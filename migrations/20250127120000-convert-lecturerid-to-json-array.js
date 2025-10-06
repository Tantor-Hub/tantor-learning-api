'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the student evaluations table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_student_evaluations',
    );

    if (!tableExists) {
      console.log(
        'Student evaluations table does not exist, skipping migration',
      );
      return;
    }

    try {
      // Check if lecturerId column exists
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '___tbl_tantor_student_evaluations' 
        AND column_name = 'lecturerId'
      `);

      if (results.length === 0) {
        console.log(
          'lecturerId column does not exist, creating it as JSON array',
        );
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
          {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: [],
          },
        );
        return;
      }

      const columnInfo = results[0];
      console.log('Current lecturerId column info:', columnInfo);

      // If it's a single UUID, convert it to JSON array
      if (columnInfo.udt_name === 'uuid' && columnInfo.data_type !== 'ARRAY') {
        console.log('Converting lecturerId from single UUID to JSON array...');

        // Create a temporary column to store the UUID as JSON array
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId_temp',
          {
            type: Sequelize.JSON,
            allowNull: true,
          },
        );

        // Copy the single UUID to the temporary JSON array column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_student_evaluations" 
          SET "lecturerId_temp" = json_build_array("lecturerId")
          WHERE "lecturerId" IS NOT NULL
        `);

        // Remove the single UUID column
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
        );

        // Add the JSON column back
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
          {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: [],
          },
        );

        // Copy data from temporary column to the new JSON column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_student_evaluations" 
          SET "lecturerId" = "lecturerId_temp"
          WHERE "lecturerId_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId_temp',
        );

        console.log(
          'Successfully converted lecturerId from single UUID to JSON array',
        );
      } else if (
        columnInfo.data_type === 'json' ||
        columnInfo.udt_name === 'json'
      ) {
        console.log(
          'lecturerId is already a JSON column, no conversion needed',
        );
      } else {
        console.log(
          'lecturerId has unexpected type, converting to JSON array...',
        );

        // Create a temporary column to store the data as JSON array
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId_temp',
          {
            type: Sequelize.JSON,
            allowNull: true,
          },
        );

        // Convert existing data to JSON array format
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_student_evaluations" 
          SET "lecturerId_temp" = json_build_array("lecturerId"::text)
          WHERE "lecturerId" IS NOT NULL
        `);

        // Remove the old column
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
        );

        // Add the new JSON column
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
          {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: [],
          },
        );

        // Copy data from temporary column to the new JSON column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_student_evaluations" 
          SET "lecturerId" = "lecturerId_temp"
          WHERE "lecturerId_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId_temp',
        );

        console.log('Successfully converted lecturerId to JSON array');
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
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

    try {
      // Check the current data type of lecturerId
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '___tbl_tantor_student_evaluations' 
        AND column_name = 'lecturerId'
      `);

      if (results.length === 0) {
        console.log('lecturerId column does not exist, nothing to rollback');
        return;
      }

      const columnInfo = results[0];
      console.log('Current lecturerId column info:', columnInfo);

      // If it's a JSON column, convert it back to single UUID
      if (columnInfo.data_type === 'json' || columnInfo.udt_name === 'json') {
        console.log(
          'Converting lecturerId from JSON array back to single UUID...',
        );

        // Create a temporary column to store the first UUID from the array
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId_temp',
          {
            type: Sequelize.UUID,
            allowNull: true,
          },
        );

        // Copy the first UUID from the JSON array to the temporary column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_student_evaluations" 
          SET "lecturerId_temp" = ("lecturerId"->>0)::uuid
          WHERE "lecturerId" IS NOT NULL 
          AND json_array_length("lecturerId") > 0
        `);

        // Remove the JSON column
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
        );

        // Add the single UUID column back
        await queryInterface.addColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId',
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
        );

        // Copy data from temporary column to the new column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_student_evaluations" 
          SET "lecturerId" = "lecturerId_temp"
          WHERE "lecturerId_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_student_evaluations',
          'lecturerId_temp',
        );

        console.log('Successfully converted lecturerId back to single UUID');
      } else {
        console.log('lecturerId is already a single UUID, no rollback needed');
      }
    } catch (error) {
      console.error('Error in rollback:', error);
      throw error;
    }
  },
};
