import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('user_meta', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
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

      created_by: DataTypes.UUID,
      updated_by: DataTypes.UUID,
      deleted_by: DataTypes.UUID,
    });

    await queryInterface.addIndex('user_meta', ['user_id'], {
      name: 'idx_user_meta_user_id',
    });

    await queryInterface.addIndex('user_meta', ['meta_key'], {
      name: 'idx_user_meta_meta_key',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('user_meta');
  },
};
