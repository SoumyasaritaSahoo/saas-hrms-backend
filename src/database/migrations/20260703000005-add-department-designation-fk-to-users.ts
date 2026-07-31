import { QueryInterface } from 'sequelize';

// NOTE: this migration does not exist in the source project — there,
// departments/designations were created before users (so users'
// department_id/designation_id columns could declare `references` inline
// at table-creation time, see the source's create-users migration). In
// this backend, the `users` table was already created (without those FK
// constraints — see the NOTE in this repo's create-users migration) before
// department/designation existed. This migration adds the equivalent FK
// constraints retroactively, mirroring how the source's
// create-attendance-shifts migration adds `fk_users_shift_id` onto the
// already-existing `users` table.
export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addConstraint('users', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_users_department_id',
      references: {
        table: 'departments',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('users', {
      fields: ['designation_id'],
      type: 'foreign key',
      name: 'fk_users_designation_id',
      references: {
        table: 'designations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeConstraint('users', 'fk_users_designation_id');
    await queryInterface.removeConstraint('users', 'fk_users_department_id');
  },
};
