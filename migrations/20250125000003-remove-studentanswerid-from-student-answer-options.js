'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (tableInfo.studentAnswerId) {
      console.log(
        'Removing studentAnswerId column from student answer options table...',
      );
      await queryInterface.removeColumn(
        '___tbl_tantor_student_answer_options',
        'studentAnswerId',
      );
      console.log('studentAnswerId column removed successfully');
    } else {
      console.log('studentAnswerId column does not exist, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log(
      'Adding studentAnswerId column back to student answer options table...',
    );
    await queryInterface.addColumn(
      '___tbl_tantor_student_answer_options',
      'studentAnswerId',
      {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '___tbl_tantor_student_answers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to the student answer this option belongs to',
      },
    );
    console.log('studentAnswerId column added back successfully');
  },
};
