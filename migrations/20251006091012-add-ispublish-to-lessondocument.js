'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the column with default value for existing records
    await queryInterface.addColumn(
      '___tbl_tantor_lessondocument',
      'ispublish',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment:
          'Whether the lesson document is published and visible to students',
      },
    );

    // Explicitly set default value for all existing records
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_lessondocument" 
      SET "ispublish" = false 
      WHERE "ispublish" IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_lessondocument',
      'ispublish',
    );
  },
};
