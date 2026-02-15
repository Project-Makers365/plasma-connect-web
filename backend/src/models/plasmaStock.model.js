const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlasmaStock = sequelize.define('plasma_stock', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  bloodBankId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  unitsAvailable: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = PlasmaStock;
