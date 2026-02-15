const express = require('express');
const {
  createEmergencyRequest,
  getHospitalRequests,
  getHospitalHistory,
} = require('../controllers/hospital.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.HOSPITAL));

router.post('/emergency-requests', createEmergencyRequest);
router.get('/requests', getHospitalRequests);
router.get('/history', getHospitalHistory);

module.exports = router;
