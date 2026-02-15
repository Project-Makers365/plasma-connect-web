const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonorProfile = sequelize.define('donor_profile', {
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  lastDonationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  totalDonations: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = DonorProfile;
