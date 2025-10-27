'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (!tableInfo.questionId) {
      console.log(
        'Adding questionId column to student answer options table...',
      );
      await queryInterface.addColumn(
        '___tbl_tantor_student_answer_options',
        'questionId',
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_evaluation_questions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment:
            'Reference to the evaluation question this option belongs to',
        },
      );
      console.log('questionId column added successfully');
    } else {
      console.log('questionId column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (tableInfo.questionId) {
      console.log(
        'Removing questionId column from student answer options table...',
      );
      await queryInterface.removeColumn(
        '___tbl_tantor_student_answer_options',
        'questionId',
      );
      console.log('questionId column removed successfully');
    } else {
      console.log('questionId column does not exist, skipping rollback...');
    }
  },
};
