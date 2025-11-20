'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the studentId column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (!tableInfo.studentId) {
      console.log(
        'Adding studentId column to student answer options table...',
      );

      // First, add the column as nullable to handle existing records
      await queryInterface.addColumn(
        '___tbl_tantor_student_answer_options',
        'studentId',
        {
          type: Sequelize.UUID,
          allowNull: true, // Start as nullable
          references: {
            model: '___tbl_tantor_users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Reference to the student who selected this option',
        },
      );

      console.log('studentId column added (nullable)');

      // Try to populate studentId from StudentAnswer records if they exist
      // This links StudentAnswerOption to StudentAnswer via questionId
      try {
        const [results] = await queryInterface.sequelize.query(`
          UPDATE ___tbl_tantor_student_answer_options sao
          SET "studentId" = sa."studentId"
          FROM ___tbl_tantor_student_answers sa
          WHERE sao."questionId" = sa."questionId"
          AND sao."studentId" IS NULL
        `);
        console.log('Populated studentId from StudentAnswer records');
      } catch (error) {
        console.log('Note: Could not populate studentId from StudentAnswer records:', error.message);
        console.log('Existing records will have NULL studentId. Please update them manually.');
      }

      // Now make it non-nullable (this will fail if there are still NULL values)
      // Only do this if there are no NULL values
      const [nullCount] = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count
        FROM ___tbl_tantor_student_answer_options
        WHERE "studentId" IS NULL
      `);

      if (nullCount[0]?.count === '0' || nullCount[0]?.count === 0) {
        await queryInterface.changeColumn(
          '___tbl_tantor_student_answer_options',
          'studentId',
          {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: '___tbl_tantor_users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Reference to the student who selected this option',
          },
        );
        console.log('studentId column set to NOT NULL');
      } else {
        console.log('Warning: Some records have NULL studentId. Column remains nullable.');
        console.log('Please update these records before making the column non-nullable.');
      }

      console.log('studentId column migration completed');
    } else {
      console.log('studentId column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the studentId column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_student_answer_options',
    );

    if (tableInfo.studentId) {
      console.log(
        'Removing studentId column from student answer options table...',
      );
      await queryInterface.removeColumn(
        '___tbl_tantor_student_answer_options',
        'studentId',
      );
      console.log('studentId column removed successfully');
    } else {
      console.log('studentId column does not exist, skipping rollback...');
    }
  },
};

