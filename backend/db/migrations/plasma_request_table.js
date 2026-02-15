module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable('plasma_request', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      requester_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'user', key: 'id' },
      },
      donor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'user', key: 'id' },
      },
      blood_bank_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'user', key: 'id' },
      },
      blood_group: {
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
      is_emergency: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      target_type: {
        type: DataTypes.ENUM('DONOR', 'BLOOD_BANK'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'FULFILLED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      distance_km: {
        type: DataTypes.FLOAT,
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

    await queryInterface.addIndex('plasma_request', ['status'], {
      name: 'idx_plasma_request_status',
      transaction,
    }).catch((error) => {
      if (error?.original?.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    });
  },
};
