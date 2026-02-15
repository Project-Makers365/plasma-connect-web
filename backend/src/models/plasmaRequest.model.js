const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { REQUEST_STATUS, REQUEST_TARGET_TYPE } = require('../constants');

const PlasmaRequest = sequelize.define('plasma_request', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  donorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  bloodBankId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  units: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isEmergency: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  targetType: {
    type: DataTypes.ENUM(...Object.values(REQUEST_TARGET_TYPE)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(REQUEST_STATUS)),
    allowNull: false,
    defaultValue: REQUEST_STATUS.PENDING,
  },
  distanceKm: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

module.exports = PlasmaRequest;
