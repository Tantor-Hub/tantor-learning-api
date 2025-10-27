'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the isCorrect column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (!tableInfo.isCorrect) {
      console.log('Adding isCorrect column to student answer options table...');

      await queryInterface.addColumn(
        '___tbl_tantor_student_answer_options',
        'isCorrect',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          comment: 'Whether this answer option is correct',
        },
      );

      console.log('isCorrect column added successfully');
    } else {
      console.log('isCorrect column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the isCorrect column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (tableInfo.isCorrect) {
      console.log(
        'Removing isCorrect column from student answer options table...',
      );
      await queryInterface.removeColumn(
        '___tbl_tantor_student_answer_options',
        'isCorrect',
      );
      console.log('isCorrect column removed successfully');
    } else {
      console.log('isCorrect column does not exist, skipping rollback...');
    }
  },
};
