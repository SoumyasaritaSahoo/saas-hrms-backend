import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('companies', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      industry_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'industries',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      email_domain: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      logo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      website: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'INR',
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      gst_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      pan_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      is_setup: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('companies', ['industry_id'], {
      name: 'idx_companies_industry_id',
    });

    await queryInterface.addIndex('companies', ['status'], {
      name: 'idx_companies_status',
    });

    await queryInterface.addIndex('companies', ['deleted_at'], {
      name: 'idx_companies_deleted_at',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('companies');
  },
};
