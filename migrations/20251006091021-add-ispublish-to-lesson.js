'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_lesson',
    );

    if (!tableExists.ispublish) {
      // Add the column with default value for existing records
      await queryInterface.addColumn('___tbl_tantor_lesson', 'ispublish', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the lesson is published and visible to students',
      });

      // Explicitly set default value for all existing records
      await queryInterface.sequelize.query(`
        UPDATE "___tbl_tantor_lesson" 
        SET "ispublish" = false 
        WHERE "ispublish" IS NULL
      `);
    } else {
      console.log(
        'ispublish column already exists in lesson table, skipping...',
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('___tbl_tantor_lesson', 'ispublish');
  },
};
