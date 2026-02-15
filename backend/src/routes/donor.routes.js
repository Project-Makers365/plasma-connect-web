const express = require('express');
const {
  setAvailability,
  getIncomingRequests,
  respondToRequest,
  getDonationHistory,
} = require('../controllers/donor.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.DONOR));

router.patch('/availability', setAvailability);
router.get('/requests', getIncomingRequests);
router.patch('/requests/:id/respond', respondToRequest);
router.get('/history', getDonationHistory);

module.exports = router;
