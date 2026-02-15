const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { REQUEST_STATUS } = require('../constants');

const RequestStatusLog = sequelize.define('request_status_log', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  requestId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(REQUEST_STATUS)),
    allowNull: false,
  },
  changedById: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

module.exports = RequestStatusLog;
