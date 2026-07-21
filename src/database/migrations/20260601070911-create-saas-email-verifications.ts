import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('saas_email_verifications', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      saas_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'saas_users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      hashed_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM('password_reset'),
        allowNull: false,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      created_by: DataTypes.UUID,
      updated_by: DataTypes.UUID,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('saas_email_verifications');
  },
};
