const express = require('express');
const {
  getStocks,
  upsertStock,
  getIncomingRequests,
  respondToRequest,
  getRequestLogs,
} = require('../controllers/bloodBank.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.BLOOD_BANK));

router.get('/stocks', getStocks);
router.put('/stocks', upsertStock);
router.get('/requests', getIncomingRequests);
router.patch('/requests/:id/respond', respondToRequest);
router.get('/request-logs', getRequestLogs);

module.exports = router;
