import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      company_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      actor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      actor_type: {
        type: DataTypes.ENUM('user', 'saas_admin', 'system'),
        allowNull: false,
      },

      action: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      resource_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      resource_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      old_values: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      new_values: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      ip_address: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      user_agent: {
        type: DataTypes.TEXT,
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

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });

    await queryInterface.addIndex('audit_logs', ['company_id'], {
      name: 'idx_audit_logs_company_id',
    });

    await queryInterface.addIndex('audit_logs', ['actor_id'], {
      name: 'idx_audit_logs_actor_id',
    });

    await queryInterface.addIndex('audit_logs', ['actor_type'], {
      name: 'idx_audit_logs_actor_type',
    });

    await queryInterface.addIndex('audit_logs', ['resource_type'], {
      name: 'idx_audit_logs_resource_type',
    });

    await queryInterface.addIndex('audit_logs', ['resource_id'], {
      name: 'idx_audit_logs_resource_id',
    });

    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'idx_audit_logs_created_at',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};
