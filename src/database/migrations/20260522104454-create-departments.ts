import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('departments', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      head_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('departments', ['company_id'], {
      name: 'idx_departments_company_id',
    });

    await queryInterface.addIndex('departments', ['parent_id'], {
      name: 'idx_departments_parent_id',
    });

    await queryInterface.addIndex('departments', ['head_user_id'], {
      name: 'idx_departments_head_user_id',
    });

    await queryInterface.addIndex('departments', ['deleted_at'], {
      name: 'idx_departments_deleted_at',
    });

    await queryInterface.addConstraint('departments', {
      fields: ['company_id', 'name'],
      type: 'unique',
      name: 'uq_departments_company_name',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('departments');
  },
};
