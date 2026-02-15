const { Op } = require('sequelize');
const {
  User,
  PlasmaRequest,
  RequestStatusLog,
  PlasmaStock,
} = require('../models');
const { REQUEST_STATUS, REQUEST_TARGET_TYPE, ROLES } = require('../constants');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { matchDonors } = require('../services/matching.service');
const { createNotification } = require('../services/notification.service');

const searchDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, latitude, longitude, radiusKm = 50 } = req.query;

  if (!bloodGroup || latitude === undefined || longitude === undefined) {
    throw new HttpError(400, 'bloodGroup, latitude and longitude are required');
  }

  const matches = await matchDonors({ bloodGroup, latitude, longitude, radiusKm });

  res.json({
    count: matches.length,
    matches: matches.map(({ donor, distanceKm }) => ({
      id: donor.id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      address: donor.address,
      latitude: donor.latitude,
      longitude: donor.longitude,
      distanceKm,
    })),
  });
});

const createRequest = asyncHandler(async (req, res) => {
  const { bloodGroup, units = 1, note, targetType, donorId, bloodBankId, isEmergency = false } = req.body;

  if (!bloodGroup || !targetType) {
    throw new HttpError(400, 'bloodGroup and targetType are required');
  }

  if (![REQUEST_TARGET_TYPE.DONOR, REQUEST_TARGET_TYPE.BLOOD_BANK].includes(targetType)) {
    throw new HttpError(400, 'Invalid targetType');
  }

  if (targetType === REQUEST_TARGET_TYPE.DONOR && !donorId) {
    throw new HttpError(400, 'donorId is required for donor request');
  }

  if (targetType === REQUEST_TARGET_TYPE.BLOOD_BANK && !bloodBankId) {
    throw new HttpError(400, 'bloodBankId is required for blood bank request');
  }

  let distanceKm = null;
  if (targetType === REQUEST_TARGET_TYPE.DONOR) {
    const donor = await User.findByPk(donorId);
    if (!donor || donor.role !== ROLES.DONOR) {
      throw new HttpError(404, 'Donor not found');
    }
  }

  if (targetType === REQUEST_TARGET_TYPE.BLOOD_BANK) {
    const bloodBank = await User.findByPk(bloodBankId);
    if (!bloodBank || bloodBank.role !== ROLES.BLOOD_BANK) {
      throw new HttpError(404, 'Blood bank not found');
    }

    const stock = await PlasmaStock.findOne({
      where: { bloodBankId, bloodGroup },
    });

    if (!stock || stock.unitsAvailable < Number(units)) {
      throw new HttpError(400, 'Insufficient stock in selected blood bank');
    }
  }

  if (
    req.user.latitude !== null &&
    req.user.longitude !== null &&
    targetType === REQUEST_TARGET_TYPE.DONOR
  ) {
    const donor = await User.findByPk(donorId);
    const lat1 = Number(req.user.latitude);
    const lon1 = Number(req.user.longitude);
    const lat2 = Number(donor.latitude);
    const lon2 = Number(donor.longitude);
    const earthRadiusKm = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    distanceKm = Number((earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(2));
  }

  const request = await PlasmaRequest.create({
    requesterId: req.user.id,
    donorId: targetType === REQUEST_TARGET_TYPE.DONOR ? donorId : null,
    bloodBankId: targetType === REQUEST_TARGET_TYPE.BLOOD_BANK ? bloodBankId : null,
    bloodGroup,
    units,
    note: note || null,
    isEmergency: Boolean(isEmergency),
    targetType,
    status: REQUEST_STATUS.PENDING,
    distanceKm,
  });

  await RequestStatusLog.create({
    requestId: request.id,
    status: REQUEST_STATUS.PENDING,
    changedById: req.user.id,
    remark: 'Request created',
  });

  const targetUserId = targetType === REQUEST_TARGET_TYPE.DONOR ? donorId : bloodBankId;
  await createNotification({
    userId: targetUserId,
    type: 'REQUEST_CREATED',
    title: 'New plasma request',
    message: `You have a new plasma request for ${bloodGroup}`,
    metadata: { requestId: request.id },
  });

  res.status(201).json({ message: 'Request created', request });
});

const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: { requesterId: req.user.id },
    include: [{ model: RequestStatusLog, as: 'statusLogs' }],
    order: [['createdAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

const getRequestById = asyncHandler(async (req, res) => {
  const request = await PlasmaRequest.findByPk(req.params.id, {
    include: [
      { model: RequestStatusLog, as: 'statusLogs' },
      { model: User, as: 'donor', attributes: ['id', 'name', 'phone'] },
      { model: User, as: 'bloodBank', attributes: ['id', 'name', 'phone'] },
      { model: User, as: 'requester', attributes: ['id', 'name', 'phone'] },
    ],
  });

  if (!request) {
    throw new HttpError(404, 'Request not found');
  }

  if (request.requesterId !== req.user.id && req.user.role !== ROLES.ADMIN) {
    throw new HttpError(403, 'Access denied');
  }

  res.json({ request });
});

const getRequestHistory = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: {
      requesterId: req.user.id,
      status: {
        [Op.in]: [REQUEST_STATUS.FULFILLED, REQUEST_STATUS.REJECTED, REQUEST_STATUS.CANCELLED],
      },
    },
    order: [['updatedAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

module.exports = {
  searchDonors,
  createRequest,
  getMyRequests,
  getRequestById,
  getRequestHistory,
};
