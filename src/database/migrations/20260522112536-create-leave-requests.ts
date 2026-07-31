import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('leave_requests', {
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
        onDelete: 'CASCADE',
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

      leave_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'leave_types',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      optional_holiday_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      leave_duration: {
        type: DataTypes.ENUM('full_day', 'first_half', 'second_half'),
        defaultValue: 'full_day',
      },

      total_days: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },

      reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },

      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      reviewer_note: {
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
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('leave_requests');
  },
};
