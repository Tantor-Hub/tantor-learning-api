'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the student evaluations table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_student_evaluations',
    );

    if (!tableExists) {
      console.log('Student evaluations table does not exist, creating it...');

      // Create the table with all required columns
      await queryInterface.createTable('___tbl_tantor_student_evaluations', {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        type: {
          type: Sequelize.ENUM(
            'exercise',
            'homework',
            'test',
            'quiz',
            'examen',
          ),
          allowNull: false,
        },
        points: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        createdBy: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_users',
            key: 'id',
          },
        },
        studentId: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        },
        submittiondate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        beginningTime: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        endingTime: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        ispublish: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isImmediateResult: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        sessionCoursId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: '___tbl_tantor_sessioncours',
            key: 'id',
          },
        },
        lessonId: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      console.log('Student evaluations table created successfully');
      return;
    }

    // Table exists, add missing columns
    console.log('Student evaluations table exists, adding missing columns...');

    // Add type column if it doesn't exist
    if (!tableExists.type) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'type',
        {
          type: Sequelize.ENUM(
            'exercise',
            'homework',
            'test',
            'quiz',
            'examen',
          ),
          allowNull: false,
          defaultValue: 'exercise',
        },
      );
      console.log('Added type column');
    }

    // Add points column if it doesn't exist
    if (!tableExists.points) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'points',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 100,
        },
      );
      console.log('Added points column');
    }

    // Add submittiondate column if it doesn't exist
    if (!tableExists.submittiondate) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'submittiondate',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      );
      console.log('Added submittiondate column');
    }

    // Add ispublish column if it doesn't exist
    if (!tableExists.ispublish) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'ispublish',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      );
      console.log('Added ispublish column');
    }

    // Add isImmediateResult column if it doesn't exist
    if (!tableExists.isImmediateResult) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'isImmediateResult',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
      );
      console.log('Added isImmediateResult column');
    }

    // Add sessionCoursId column if it doesn't exist
    if (!tableExists.sessionCoursId) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'sessionCoursId',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: '___tbl_tantor_sessioncours',
            key: 'id',
          },
        },
      );
      console.log('Added sessionCoursId column');
    }

    // Add lessonId column if it doesn't exist
    if (!tableExists.lessonId) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'lessonId',
        {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        },
      );
      console.log('Added lessonId column');
    }

    // Add beginningTime column if it doesn't exist
    if (!tableExists.beginningTime) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'beginningTime',
        {
          type: Sequelize.TIME,
          allowNull: true,
        },
      );
      console.log('Added beginningTime column');
    }

    // Add endingTime column if it doesn't exist
    if (!tableExists.endingTime) {
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'endingTime',
        {
          type: Sequelize.TIME,
          allowNull: true,
        },
      );
      console.log('Added endingTime column');
    }

    // Handle lecturerId to createdBy conversion
    if (tableExists.lecturerId && !tableExists.createdBy) {
      console.log('Converting lecturerId to createdBy...');

      // Add createdBy column
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'createdBy',
        {
          type: Sequelize.UUID,
          allowNull: true, // Temporarily allow null during migration
        },
      );

      // Copy data from lecturerId to createdBy (take first UUID from array if it's JSON)
      await queryInterface.sequelize.query(`
        UPDATE "___tbl_tantor_student_evaluations" 
        SET "createdBy" = (
          CASE 
            WHEN json_typeof("lecturerId") = 'array' AND json_array_length("lecturerId") > 0 
            THEN ("lecturerId"->>0)::uuid
            ELSE "lecturerId"::uuid
          END
        )
        WHERE "lecturerId" IS NOT NULL
      `);

      // Make createdBy not null after data migration
      await queryInterface.changeColumn(
        '___tbl_tantor_student_evaluations',
        'createdBy',
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_users',
            key: 'id',
          },
        },
      );

      // Remove lecturerId column
      await queryInterface.removeColumn(
        '___tbl_tantor_student_evaluations',
        'lecturerId',
      );

      console.log('Successfully converted lecturerId to createdBy');
    } else if (!tableExists.createdBy) {
      // Add createdBy column if it doesn't exist and lecturerId doesn't exist
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'createdBy',
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_users',
            key: 'id',
          },
        },
      );
      console.log('Added createdBy column');
    }

    console.log('Migration completed successfully');
  },

  async down(queryInterface, Sequelize) {
    // Check if the student evaluations table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_student_evaluations',
    );

    if (!tableExists) {
      console.log(
        'Student evaluations table does not exist, skipping rollback',
      );
      return;
    }

    console.log('Rolling back student evaluations table changes...');

    // Remove added columns
    const columnsToRemove = [
      'type',
      'points',
      'submittiondate',
      'ispublish',
      'isImmediateResult',
      'sessionCoursId',
      'lessonId',
      'beginningTime',
      'endingTime',
    ];

    for (const column of columnsToRemove) {
      if (tableExists[column]) {
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          column,
        );
        console.log(`Removed ${column} column`);
      }
    }

    // Convert createdBy back to lecturerId if needed
    if (tableExists.createdBy && !tableExists.lecturerId) {
      console.log('Converting createdBy back to lecturerId...');

      // Add lecturerId column as JSON array
      await queryInterface.addColumn(
        '___tbl_tantor_student_evaluations',
        'lecturerId',
        {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: [],
        },
      );

      // Copy data from createdBy to lecturerId as JSON array
      await queryInterface.sequelize.query(`
        UPDATE "___tbl_tantor_student_evaluations" 
        SET "lecturerId" = json_build_array("createdBy")
        WHERE "createdBy" IS NOT NULL
      `);

      // Remove createdBy column
      await queryInterface.removeColumn(
        '___tbl_tantor_student_evaluations',
        'createdBy',
      );

      console.log('Successfully converted createdBy back to lecturerId');
    }

    console.log('Rollback completed successfully');
  },
};
