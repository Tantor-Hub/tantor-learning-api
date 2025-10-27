'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the points column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answers',
    );

    if (!tableInfo.points) {
      console.log('Adding points column to student answers table...');

      await queryInterface.addColumn(
        '___tbl_tantor_student_answers',
        'points',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment:
            'Points awarded for this student answer (can be null, updated by instructor)',
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
      '___tbl_tantor_student_answers',
    );

    if (tableInfo.points) {
      console.log('Removing points column from student answers table...');
      await queryInterface.removeColumn(
        '___tbl_tantor_student_answers',
        'points',
      );
      console.log('points column removed successfully');
    } else {
      console.log('points column does not exist, skipping rollback...');
    }
  },
};
