'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the student answers table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_student_answers',
    );

    if (!tableExists) {
      console.log('Student answers table does not exist, creating it...');

      await queryInterface.createTable('___tbl_tantor_student_answers', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
        },
        questionId: {
          type: Sequelize.UUID,
          allowNull: false,
          comment: 'ID of the evaluation question',
        },
        studentId: {
          type: Sequelize.UUID,
          allowNull: false,
          comment: 'ID of the student who answered',
        },
        evaluationId: {
          type: Sequelize.UUID,
          allowNull: false,
          comment: 'ID of the evaluation this answer belongs to',
        },
        answerText: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Text answer for text-based questions',
        },
        isCorrect: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          comment:
            'Whether the answer is correct (calculated for multiple choice)',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      console.log('Student answers table created successfully');
    } else {
      console.log('Student answers table already exists, skipping creation');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the student answers table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_student_answers',
    );

    if (!tableExists) {
      console.log('Student answers table does not exist, skipping rollback');
      return;
    }

    console.log('Rolling back student answers table...');
    await queryInterface.dropTable('___tbl_tantor_student_answers');
    console.log('Student answers table dropped successfully');
  },
};
