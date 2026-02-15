const express = require('express');
const {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  updateUser,
  deleteUser,
  getSystemStats,
  getAllRequests,
  resetUserPassword,
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.patch('/users/:id/reset-password', resetUserPassword);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/requests', getAllRequests);
router.get('/stats', getSystemStats);

module.exports = router;
