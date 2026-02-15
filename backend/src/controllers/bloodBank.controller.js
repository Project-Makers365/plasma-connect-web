const { Op } = require('sequelize');
const { PlasmaStock, PlasmaRequest, RequestStatusLog } = require('../models');
const { REQUEST_STATUS, REQUEST_TARGET_TYPE } = require('../constants');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { createNotification } = require('../services/notification.service');

const getStocks = asyncHandler(async (req, res) => {
  const stocks = await PlasmaStock.findAll({
    where: { bloodBankId: req.user.id },
    order: [['bloodGroup', 'ASC']],
  });

  res.json({ count: stocks.length, stocks });
});

const upsertStock = asyncHandler(async (req, res) => {
  const { bloodGroup, unitsAvailable } = req.body;

  if (!bloodGroup || unitsAvailable === undefined) {
    throw new HttpError(400, 'bloodGroup and unitsAvailable are required');
  }

  const [stock, created] = await PlasmaStock.findOrCreate({
    where: {
      bloodBankId: req.user.id,
      bloodGroup,
    },
    defaults: {
      bloodBankId: req.user.id,
      bloodGroup,
      unitsAvailable,
    },
  });

  if (!created) {
    stock.unitsAvailable = Number(unitsAvailable);
    await stock.save();
  }

  res.json({ message: 'Stock updated', stock });
});

const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: {
      bloodBankId: req.user.id,
      targetType: REQUEST_TARGET_TYPE.BLOOD_BANK,
    },
    order: [['createdAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

const respondToRequest = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;

  if (![REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.REJECTED, REQUEST_STATUS.FULFILLED].includes(status)) {
    throw new HttpError(400, 'Invalid status');
  }

  const request = await PlasmaRequest.findOne({
    where: {
      id: req.params.id,
      bloodBankId: req.user.id,
      targetType: REQUEST_TARGET_TYPE.BLOOD_BANK,
    },
  });

  if (!request) {
    throw new HttpError(404, 'Request not found');
  }

  request.status = status;
  await request.save();

  await RequestStatusLog.create({
    requestId: request.id,
    status,
    changedById: req.user.id,
    remark: remark || null,
  });

  if ([REQUEST_STATUS.ACCEPTED, REQUEST_STATUS.FULFILLED].includes(status)) {
    const stock = await PlasmaStock.findOne({
      where: { bloodBankId: req.user.id, bloodGroup: request.bloodGroup },
    });

    if (!stock || stock.unitsAvailable < request.units) {
      throw new HttpError(400, 'Insufficient stock to fulfill this request');
    }

    stock.unitsAvailable -= request.units;
    await stock.save();
  }

  await createNotification({
    userId: request.requesterId,
    type: 'REQUEST_UPDATED',
    title: 'Blood bank request updated',
    message: `Blood bank has ${status.toLowerCase()} request #${request.id}`,
    metadata: { requestId: request.id, status },
  });

  res.json({ message: 'Request status updated', request });
});

const getRequestLogs = asyncHandler(async (req, res) => {
  const requests = await PlasmaRequest.findAll({
    where: {
      bloodBankId: req.user.id,
      targetType: REQUEST_TARGET_TYPE.BLOOD_BANK,
      status: {
        [Op.in]: [REQUEST_STATUS.REJECTED, REQUEST_STATUS.FULFILLED, REQUEST_STATUS.CANCELLED],
      },
    },
    order: [['updatedAt', 'DESC']],
  });

  res.json({ count: requests.length, requests });
});

module.exports = {
  getStocks,
  upsertStock,
  getIncomingRequests,
  respondToRequest,
  getRequestLogs,
};
