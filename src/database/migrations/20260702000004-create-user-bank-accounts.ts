import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('user_bank_accounts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bank_name: { type: DataTypes.STRING(255), allowNull: true },
      account_holder_name: { type: DataTypes.STRING(255), allowNull: true },
      account_number: { type: DataTypes.STRING(100), allowNull: true },
      branch_name: { type: DataTypes.STRING(255), allowNull: true },
      ifsc_code: { type: DataTypes.STRING(100), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
      created_by: { type: DataTypes.UUID, allowNull: true },
      updated_by: { type: DataTypes.UUID, allowNull: true },
      deleted_by: { type: DataTypes.UUID, allowNull: true },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('user_bank_accounts');
  },
};
