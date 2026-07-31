import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('locations', {
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

      location_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'location_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      address_line_1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      address_line_2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      postal_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      timezone: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Asia/Kolkata',
      },

      is_active: {
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

    await queryInterface.addIndex('locations', ['company_id'], {
      name: 'idx_locations_company_id',
    });

    await queryInterface.addIndex('locations', ['location_type_id'], {
      name: 'idx_locations_location_type_id',
    });

    await queryInterface.addIndex('locations', ['is_active'], {
      name: 'idx_locations_is_active',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('locations');
  },
};
