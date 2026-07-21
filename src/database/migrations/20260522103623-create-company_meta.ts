import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('company_meta', {
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

      meta_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      meta_value: {
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

    await queryInterface.addIndex('company_meta', ['company_id', 'meta_key'], {
      name: 'idx_company_meta_company_meta_key',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('company_meta');
  },
};
