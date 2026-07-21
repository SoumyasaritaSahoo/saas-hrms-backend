import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('user_sessions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      revoked_at: {
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
    });

    await queryInterface.addIndex('user_sessions', ['user_id'], {
      name: 'idx_user_sessions_user_id',
    });

    await queryInterface.addIndex('user_sessions', ['company_id'], {
      name: 'idx_user_sessions_company_id',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('user_sessions');
  },
};
