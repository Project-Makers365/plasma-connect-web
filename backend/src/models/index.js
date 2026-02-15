const sequelize = require('../config/database');
const User = require('./user.model');
const DonorProfile = require('./donorProfile.model');
const PlasmaRequest = require('./plasmaRequest.model');
const RequestStatusLog = require('./requestStatusLog.model');
const PlasmaStock = require('./plasmaStock.model');
const Notification = require('./notification.model');

User.hasOne(DonorProfile, { foreignKey: 'userId', as: 'donorProfile', onDelete: 'CASCADE' });
DonorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PlasmaRequest, { foreignKey: 'requesterId', as: 'createdRequests' });
PlasmaRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

User.hasMany(PlasmaRequest, { foreignKey: 'donorId', as: 'donorRequests' });
PlasmaRequest.belongsTo(User, { foreignKey: 'donorId', as: 'donor' });

User.hasMany(PlasmaRequest, { foreignKey: 'bloodBankId', as: 'bloodBankRequests' });
PlasmaRequest.belongsTo(User, { foreignKey: 'bloodBankId', as: 'bloodBank' });

PlasmaRequest.hasMany(RequestStatusLog, { foreignKey: 'requestId', as: 'statusLogs', onDelete: 'CASCADE' });
RequestStatusLog.belongsTo(PlasmaRequest, { foreignKey: 'requestId', as: 'request' });

User.hasMany(RequestStatusLog, { foreignKey: 'changedById', as: 'statusChanges' });
RequestStatusLog.belongsTo(User, { foreignKey: 'changedById', as: 'changedBy' });

User.hasMany(PlasmaStock, { foreignKey: 'bloodBankId', as: 'stocks', onDelete: 'CASCADE' });
PlasmaStock.belongsTo(User, { foreignKey: 'bloodBankId', as: 'bloodBank' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  DonorProfile,
  PlasmaRequest,
  RequestStatusLog,
  PlasmaStock,
  Notification,
};
