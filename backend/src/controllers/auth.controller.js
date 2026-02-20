const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, DonorProfile } = require('../models');
const { ROLES } = require('../constants');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

function sanitizeUser(user) {
  const plain = user.get({ plain: true });
  delete plain.password;
  delete plain.resetPasswordToken;
  delete plain.resetPasswordExpiresAt;
  return plain;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isStrongPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 64) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, bloodGroup, address, latitude, longitude } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password || !phone || !role) {
    throw new HttpError(400, 'name, email, password, phone and role are required');
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new HttpError(400, 'Invalid role');
  }

  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    throw new HttpError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    phone,
    role,
    bloodGroup: bloodGroup || null,
    address: address || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  });

  if (role === ROLES.DONOR) {
    await DonorProfile.create({ userId: user.id, isAvailable: true });
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({
    message: 'Registered successfully',
    token,
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw new HttpError(400, 'email and password are required');
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  if (user.isBlocked) {
    throw new HttpError(403, 'Account is blocked');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new HttpError(400, 'email is required');
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });

  const genericResponse = {
    message: 'If the account exists, a password reset OTP was generated',
  };

  if (!user) {
    return res.json(genericResponse);
  }

  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordToken = otpHash;
  user.resetPasswordExpiresAt = expiresAt;
  await user.save();

  return res.json({
    ...genericResponse,
    otp,
    expiresAt,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp || !newPassword) {
    throw new HttpError(400, 'email, otp and newPassword are required');
  }

  if (!isStrongPassword(newPassword)) {
    throw new HttpError(
      400,
      'Password must be 8-64 chars and include uppercase, lowercase, number, and special character',
    );
  }

  if (!/^\d{6}$/.test(String(otp))) {
    throw new HttpError(400, 'OTP must be a 6-digit code');
  }

  const otpHash = crypto.createHash('sha256').update(String(otp)).digest('hex');

  const user = await User.findOne({
    where: {
      email: normalizedEmail,
      resetPasswordToken: otpHash,
      resetPasswordExpiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new HttpError(400, 'Invalid or expired OTP');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return res.json({ message: 'Password reset successful. You can now login.' });
});

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
};
