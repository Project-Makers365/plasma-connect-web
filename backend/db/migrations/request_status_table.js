module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable('request_status_log', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'plasma_request', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'FULFILLED', 'CANCELLED'),
        allowNull: false,
      },
      changed_by_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'user', key: 'id' },
      },
      remark: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, { transaction }).catch((error) => {
      if (error?.original?.code !== 'ER_TABLE_EXISTS_ERROR') {
        throw error;
      }
    });
  },
};
