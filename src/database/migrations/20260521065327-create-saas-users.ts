import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('saas_users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      middle_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },

      last_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },

      is_deletable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'saas_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'saas_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'saas_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });

    await queryInterface.addIndex('saas_users', ['email'], {
      unique: true,
      name: 'idx_saas_users_email_unique',
    });

    await queryInterface.addIndex('saas_users', ['status'], {
      name: 'idx_saas_users_status',
    });

    await queryInterface.addIndex('saas_users', ['deleted_at'], {
      name: 'idx_saas_users_deleted_at',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('saas_users');
  },
};
