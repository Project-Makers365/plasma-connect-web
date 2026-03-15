const express = require('express');
const {
  searchDonors,
  createRequest,
  getMyRequests,
  getRequestById,
  getRequestHistory,
  canBecomeDonor,
  convertToDonor,
  switchToUser,
} = require('../controllers/user.controller');
const {
  getMyNotifications,
  markNotificationRead,
} = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate);

// Role conversion routes (available to USER and DONOR roles)
router.get('/can-become-donor', authorize(ROLES.USER, ROLES.DONOR), canBecomeDonor);
router.post('/convert-to-donor', authorize(ROLES.USER), convertToDonor);
router.post('/switch-to-user', authorize(ROLES.DONOR), switchToUser);

// Routes that require USER or HOSPITAL role
router.use(authorize(ROLES.USER, ROLES.HOSPITAL));

router.get('/donors/search', searchDonors);
router.post('/requests', createRequest);
router.get('/requests', getMyRequests);
router.get('/requests/history', getRequestHistory);
router.get('/requests/:id', getRequestById);
router.get('/notifications', getMyNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

module.exports = router;
