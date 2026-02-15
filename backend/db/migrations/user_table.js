module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable('user', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'DONOR', 'USER', 'HOSPITAL', 'BLOOD_BANK'),
        allowNull: false,
      },
      blood_group: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      is_blocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reset_password_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reset_password_expires_at: {
        type: DataTypes.DATE,
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

    await queryInterface.addIndex('user', ['role', 'blood_group'], {
      name: 'idx_user_role_blood_group',
      transaction,
    }).catch((error) => {
      if (error?.original?.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    });

    await queryInterface.addIndex('user', ['latitude', 'longitude'], {
      name: 'idx_user_location',
      transaction,
    }).catch((error) => {
      if (error?.original?.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    });
  },
};
