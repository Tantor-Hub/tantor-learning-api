'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the markingStatus column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_evaluations',
    );

    if (!tableInfo.markingStatus) {
      console.log(
        'Adding markingStatus column to student evaluations table...',
      );

      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'markingStatus',
        {
          type: Sequelize.ENUM(
            'pending',
            'in_progress',
            'completed',
            'published',
          ),
          allowNull: false,
          defaultValue: 'pending',
          comment:
            'Status of marking process: pending, in_progress, completed, published',
        },
      );

      console.log('markingStatus column added successfully');
    } else {
      console.log('markingStatus column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the markingStatus column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_evaluations',
    );

    if (tableInfo.markingStatus) {
      console.log(
        'Removing markingStatus column from student evaluations table...',
      );
      await queryInterface.removeColumn(
        '___tbl_tantor_student_evaluations',
        'markingStatus',
      );
      console.log('markingStatus column removed successfully');
    } else {
      console.log('markingStatus column does not exist, skipping rollback...');
    }
  },
};
