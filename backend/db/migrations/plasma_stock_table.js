module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable('plasma_stock', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      blood_bank_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE',
      },
      blood_group: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      units_available: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint('plasma_stock', {
      fields: ['blood_bank_id', 'blood_group'],
      type: 'unique',
      name: 'uq_plasma_stock_blood_bank_group',
      transaction,
    }).catch((error) => {
      if (error?.original?.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    });
  },
};
