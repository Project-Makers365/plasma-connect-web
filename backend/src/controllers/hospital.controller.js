const { PlasmaRequest } = require('../models');
const { REQUEST_TARGET_TYPE } = require('../constants');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { createRequest: baseCreateRequest } = require('./user.controller');

const createEmergencyRequest = asyncHandler(async (req, res, next) => {
  const { targetType } = req.body;

  if (targetType && !Object.values(REQUEST_TARGET_TYPE).includes(targetType)) {
    throw new HttpError(400, 'Invalid targetType');
  }

  req.body.isEmergency = true;
  return baseCreateRequest(req, res, next);
});

const getHospitalRequests = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: { requesterId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

const getHospitalHistory = getHospitalRequests;

module.exports = {
  createEmergencyRequest,
  getHospitalRequests,
  getHospitalHistory,
};
