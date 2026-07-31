import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('leave_types', {
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
        onDelete: 'RESTRICT',
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      total_days_per_year: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      accrual_type: {
        type: DataTypes.ENUM('yearly', 'monthly', 'quarterly', 'manual'),
        allowNull: false,
        defaultValue: 'yearly',
      },

      effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      can_carry_forward: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      max_carry_forward_days: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },

      is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      requires_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      exclude_holidays: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      supports_optional_holiday: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
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

    await queryInterface.addIndex('leave_types', ['company_id']);
    await queryInterface.addIndex('leave_types', ['status']);
    await queryInterface.addIndex('leave_types', ['deleted_at']);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('leave_types');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS enum_leave_types_accrual_type CASCADE',
    );
  },
};
