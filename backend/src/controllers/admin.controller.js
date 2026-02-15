const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const {
  User,
  PlasmaRequest,
  Notification,
  DonorProfile,
  PlasmaStock,
  RequestStatusLog,
} = require('../models');
const { ROLES, REQUEST_STATUS } = require('../constants');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpiresAt'] },
    order: [['createdAt', 'DESC']],
  });

  res.json({ count: users.length, users });
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpiresAt'] },
    include: [
      { model: DonorProfile, as: 'donorProfile' },
      { model: PlasmaStock, as: 'stocks' },
    ],
  });

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const [createdRequests, donorRequests, bloodBankRequests, notifications] = await Promise.all([
    PlasmaRequest.findAll({ where: { requesterId: user.id }, order: [['createdAt', 'DESC']], limit: 50 }),
    PlasmaRequest.findAll({ where: { donorId: user.id }, order: [['createdAt', 'DESC']], limit: 50 }),
    PlasmaRequest.findAll({ where: { bloodBankId: user.id }, order: [['createdAt', 'DESC']], limit: 50 }),
    Notification.findAll({ where: { userId: user.id }, order: [['createdAt', 'DESC']], limit: 50 }),
  ]);

  res.json({
    user,
    related: {
      createdRequests,
      donorRequests,
      bloodBankRequests,
      notifications,
    },
  });
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  user.isBlocked = true;
  await user.save();

  await Notification.create({
    userId: user.id,
    type: 'ACCOUNT_BLOCKED',
    title: 'Account blocked',
    message: 'Your account has been blocked by admin',
  });

  res.json({ message: 'User blocked', userId: user.id });
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  user.isBlocked = false;
  await user.save();

  await Notification.create({
    userId: user.id,
    type: 'ACCOUNT_UNBLOCKED',
    title: 'Account unblocked',
    message: 'Your account has been unblocked by admin',
  });

  res.json({ message: 'User unblocked', userId: user.id });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const allowedFields = [
    'name',
    'email',
    'phone',
    'role',
    'bloodGroup',
    'address',
    'latitude',
    'longitude',
    'isBlocked',
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      user[field] = req.body[field];
    }
  }

  if (req.body.role && !Object.values(ROLES).includes(req.body.role)) {
    throw new HttpError(400, 'Invalid role');
  }

  if (req.body.email) {
    const conflict = await User.findOne({
      where: {
        email: req.body.email,
        id: { [Op.ne]: user.id },
      },
    });
    if (conflict) {
      throw new HttpError(409, 'Email already in use');
    }
  }

  await user.save();

  if (user.role === ROLES.DONOR) {
    await DonorProfile.findOrCreate({
      where: { userId: user.id },
      defaults: { userId: user.id, isAvailable: true },
    });
  } else {
    await DonorProfile.destroy({ where: { userId: user.id } });
  }

  const updated = await User.findByPk(user.id, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpiresAt'] },
  });

  res.json({ message: 'User updated successfully', user: updated });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (Number(req.user.id) === Number(user.id)) {
    throw new HttpError(400, 'Admin cannot delete own account');
  }

  await user.destroy();
  res.json({ message: 'User deleted successfully', userId: Number(req.params.id) });
});

const getSystemStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalDonors,
    totalHospitals,
    totalBloodBanks,
    activeRequests,
    completedRequests,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { role: ROLES.DONOR } }),
    User.count({ where: { role: ROLES.HOSPITAL } }),
    User.count({ where: { role: ROLES.BLOOD_BANK } }),
    PlasmaRequest.count({
      where: { status: { [Op.in]: [REQUEST_STATUS.PENDING, REQUEST_STATUS.ACCEPTED] } },
    }),
    PlasmaRequest.count({
      where: { status: { [Op.in]: [REQUEST_STATUS.FULFILLED, REQUEST_STATUS.REJECTED] } },
    }),
  ]);

  res.json({
    totalUsers,
    totalDonors,
    totalHospitals,
    totalBloodBanks,
    activeRequests,
    completedRequests,
  });
});

const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    include: [
      { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'role'] },
      { model: User, as: 'donor', attributes: ['id', 'name', 'email', 'role'] },
      { model: User, as: 'bloodBank', attributes: ['id', 'name', 'email', 'role'] },
      { model: RequestStatusLog, as: 'statusLogs' },
    ],
    order: [['createdAt', 'DESC']],
    limit: 200,
  });

  res.json({ count: requests.length, requests });
});

function isStrongPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 64) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (!newPassword) {
    throw new HttpError(400, 'newPassword is required');
  }

  if (!isStrongPassword(newPassword)) {
    throw new HttpError(
      400,
      'Password must be 8-64 chars and include uppercase, lowercase, number, and special character',
    );
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Notification.create({
    userId: user.id,
    type: 'PASSWORD_RESET',
    title: 'Password reset by admin',
    message: 'Your account password was reset by an administrator',
  });

  res.json({ message: 'Password reset successfully', userId: user.id });
});

module.exports = {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  updateUser,
  deleteUser,
  getSystemStats,
  getAllRequests,
  resetUserPassword,
};
