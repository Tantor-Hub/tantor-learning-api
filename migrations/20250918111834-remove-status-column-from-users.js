'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get current table structure
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_users',
    );

    // Remove status column from users table if it exists
    if (tableDescription.status) {
      await queryInterface.removeColumn('___tbl_tantor_users', 'status');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back status column
    await queryInterface.addColumn('___tbl_tantor_users', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },
};
