const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize({
  ...env.db,
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
  },
});

module.exports = sequelize;
