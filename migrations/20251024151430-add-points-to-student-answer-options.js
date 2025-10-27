'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the points column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (!tableInfo.points) {
      console.log('Adding points column to student answer options table...');

      await queryInterface.addColumn(
        '___tbl_tantor_student_answer_options',
        'points',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 1,
          comment: 'Points awarded for this answer option',
        },
      );

      console.log('points column added successfully');
    } else {
      console.log('points column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the points column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (tableInfo.points) {
      console.log(
        'Removing points column from student answer options table...',
      );
      await queryInterface.removeColumn(
        '___tbl_tantor_student_answer_options',
        'points',
      );
      console.log('points column removed successfully');
    } else {
      console.log('points column does not exist, skipping rollback...');
    }
  },
};
