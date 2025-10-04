'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get current table structure
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_users',
    );

    // Remove nick_name column from users table if it exists
    if (tableDescription.nick_name) {
      await queryInterface.removeColumn('___tbl_tantor_users', 'nick_name');
    }

    // Remove num_record column from users table if it exists
    if (tableDescription.num_record) {
      await queryInterface.removeColumn('___tbl_tantor_users', 'num_record');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back nick_name column
    await queryInterface.addColumn('___tbl_tantor_users', 'nick_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add back num_record column
    await queryInterface.addColumn('___tbl_tantor_users', 'num_record', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
