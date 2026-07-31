import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('role_permissions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id',
        },
      },

      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      permission_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id',
        },
        onDelete: 'CASCADE',
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

      deleted_at: DataTypes.DATE,

      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint('role_permissions', {
      fields: ['company_id', 'role_id', 'permission_id'],
      type: 'unique',
      name: 'uq_role_permissions_company_role_permission',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('role_permissions');
  },
};
