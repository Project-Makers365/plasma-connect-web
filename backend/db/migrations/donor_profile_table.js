module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable('donor_profile', {
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_donation_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      total_donations: {
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
  },
};
