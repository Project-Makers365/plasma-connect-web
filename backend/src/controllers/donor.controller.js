const { PlasmaRequest, RequestStatusLog, DonorProfile } = require('../models');
const { REQUEST_STATUS } = require('../constants');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { createNotification } = require('../services/notification.service');

const setAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const profile = await DonorProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) {
    throw new HttpError(404, 'Donor profile not found');
  }

  profile.isAvailable = Boolean(isAvailable);
  await profile.save();

  res.json({ message: 'Availability updated', profile });
});

const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: { donorId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

const respondToRequest = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;

  if (![REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.REJECTED].includes(status)) {
    throw new HttpError(400, 'Status must be ACCEPTED or REJECTED');
  }

  const request = await PlasmaRequest.findOne({
    where: { id: req.params.id, donorId: req.user.id },
  });

  if (!request) {
    throw new HttpError(404, 'Request not found for this donor');
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw new HttpError(400, 'Only pending requests can be updated');
  }

  request.status = status;
  await request.save();

  await RequestStatusLog.create({
    requestId: request.id,
    status,
    changedById: req.user.id,
    remark: remark || null,
  });

  await createNotification({
    userId: request.requesterId,
    type: 'REQUEST_UPDATED',
    title: 'Donor response received',
    message: `Donor has ${status.toLowerCase()} your request #${request.id}`,
    metadata: { requestId: request.id, status },
  });

  if (status === REQUEST_STATUS.ACCEPTED) {
    const profile = await DonorProfile.findOne({ where: { userId: req.user.id } });
    if (profile) {
      profile.totalDonations += 1;
      profile.lastDonationDate = new Date();
      await profile.save();
    }
  }

  res.json({ message: 'Request updated', request });
});

const getDonationHistory = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: {
      donorId: req.user.id,
      status: REQUEST_STATUS.ACCEPTED,
    },
    order: [['updatedAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

module.exports = {
  setAvailability,
  getIncomingRequests,
  respondToRequest,
  getDonationHistory,
};
