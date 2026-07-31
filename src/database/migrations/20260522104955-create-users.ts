import { QueryInterface, DataTypes } from 'sequelize';

// NOTE: simplified from the source project's users migration. department_id
// and designation_id no longer have `references` to `departments` /
// `designations` tables (those feature modules were excluded from this
// auth-only port, so those tables don't exist here) — the columns are kept
// as plain nullable UUIDs so the shape still matches if those modules are
// added back later. shift_id already had no FK constraint in the source.
export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('users', {
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

      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      middle_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
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

      employee_code: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },

      highest_qualification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      experience_years: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
      },

      is_married: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      emergency_contact_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      emergency_contact_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      emergency_contact_relation: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      base_salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      department_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      designation_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      manager_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      shift_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      employment_type: {
        type: DataTypes.ENUM(
          'full_time',
          'part_time',
          'contract',
          'internship',
          'temporary',
        ),
        allowNull: true,
      },

      employment_status: {
        type: DataTypes.ENUM(
          'probation',
          'confirmed',
          'notice_period',
          'resigned',
          'terminated',
        ),
        allowNull: true,
      },

      work_mode: {
        type: DataTypes.ENUM('on_site', 'remote', 'hybrid'),
        allowNull: true,
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      email_verified_at: {
        type: DataTypes.DATE,
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

    await queryInterface.addConstraint('users', {
      fields: ['company_id', 'email'],
      type: 'unique',
      name: 'uq_users_company_email',
    });

    await queryInterface.addConstraint('users', {
      fields: ['company_id', 'employee_code'],
      type: 'unique',
      name: 'uq_users_company_employee_code',
    });

    await queryInterface.addIndex('users', ['company_id'], {
      name: 'idx_users_company_id',
    });

    await queryInterface.addIndex('users', ['department_id'], {
      name: 'idx_users_department_id',
    });

    await queryInterface.addIndex('users', ['designation_id'], {
      name: 'idx_users_designation_id',
    });

    await queryInterface.addIndex('users', ['manager_id'], {
      name: 'idx_users_manager_id',
    });

    await queryInterface.addIndex('users', ['deleted_at'], {
      name: 'idx_users_deleted_at',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('users');
  },
};
