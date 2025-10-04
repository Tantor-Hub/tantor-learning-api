'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get current table structure
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_users',
    );

    // Remove password column from users table if it exists
    if (tableDescription.password) {
      await queryInterface.removeColumn('___tbl_tantor_users', 'password');
    }

    // Remove can_update_password column from users table if it exists
    if (tableDescription.can_update_password) {
      await queryInterface.removeColumn(
        '___tbl_tantor_users',
        'can_update_password',
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back password column
    await queryInterface.addColumn('___tbl_tantor_users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add back can_update_password column
    await queryInterface.addColumn(
      '___tbl_tantor_users',
      'can_update_password',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    );
  },
};
