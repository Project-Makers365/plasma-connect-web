const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const donorRoutes = require('./donor.routes');
const adminRoutes = require('./admin.routes');
const hospitalRoutes = require('./hospital.routes');
const bloodBankRoutes = require('./bloodBank.routes');
const notificationRoutes = require('./notification.routes');
const env = require('../config/env');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Plasma Connect API',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/donor', donorRoutes);
router.use('/donors', donorRoutes);
router.use('/admin', adminRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/blood-banks', bloodBankRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
