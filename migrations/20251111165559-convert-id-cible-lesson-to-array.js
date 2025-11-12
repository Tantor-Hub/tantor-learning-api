'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (!tableExists) {
      console.log('Events table does not exist, skipping migration');
      return;
    }

    try {
      // Check the current data type of id_cible_lesson
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '___tbl_tantor_events' 
        AND column_name = 'id_cible_lesson'
      `);

      if (results.length === 0) {
        console.log(
          'id_cible_lesson column does not exist, creating it as UUID array',
        );
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
          {
            type: Sequelize.ARRAY(Sequelize.UUID),
            allowNull: true,
          },
        );
        return;
      }

      const columnInfo = results[0];
      console.log('Current id_cible_lesson column info:', columnInfo);

      // If it's a single UUID, convert it to array
      if (columnInfo.udt_name === 'uuid' && columnInfo.data_type !== 'ARRAY') {
        console.log(
          'Converting id_cible_lesson from single UUID to UUID array...',
        );

        // Create a temporary column to store the UUID as array
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_lesson_temp',
          {
            type: Sequelize.ARRAY(Sequelize.UUID),
            allowNull: true,
          },
        );

        // Copy the single UUID to the temporary array column
        // Only convert non-null values to arrays
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_lesson_temp" = ARRAY["id_cible_lesson"]::uuid[]
          WHERE "id_cible_lesson" IS NOT NULL
        `);

        // Remove the single UUID column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
        );

        // Add the array column back
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
          {
            type: Sequelize.ARRAY(Sequelize.UUID),
            allowNull: true,
          },
        );

        // Copy data from temporary column to the new array column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_lesson" = "id_cible_lesson_temp"
          WHERE "id_cible_lesson_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_lesson_temp',
        );

        console.log(
          'Successfully converted id_cible_lesson from single UUID to UUID array',
        );
      } else if (columnInfo.udt_name === 'uuid[]' || columnInfo.data_type === 'ARRAY') {
        console.log('id_cible_lesson is already a UUID array, no conversion needed');
      } else {
        console.log(
          `id_cible_lesson has unexpected type: ${columnInfo.udt_name}, skipping conversion`,
        );
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (!tableExists) {
      console.log('Events table does not exist, skipping rollback');
      return;
    }

    try {
      // Check the current data type of id_cible_lesson
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '___tbl_tantor_events' 
        AND column_name = 'id_cible_lesson'
      `);

      if (results.length === 0) {
        console.log('id_cible_lesson column does not exist, skipping rollback');
        return;
      }

      const columnInfo = results[0];
      console.log('Current id_cible_lesson column info:', columnInfo);

      // If it's an array, convert it back to single UUID
      if (columnInfo.udt_name === 'uuid[]' || columnInfo.data_type === 'ARRAY') {
        console.log(
          'Converting id_cible_lesson from UUID array back to single UUID...',
        );

        // Create a temporary column to store the first UUID from the array
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_lesson_temp',
          {
            type: Sequelize.UUID,
            allowNull: true,
          },
        );

        // Copy the first UUID from the array to the temporary column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_lesson_temp" = "id_cible_lesson"[1]
          WHERE "id_cible_lesson" IS NOT NULL 
          AND array_length("id_cible_lesson", 1) > 0
        `);

        // Remove the array column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
        );

        // Add the single UUID column back
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
          {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: '___tbl_tantor_lesson',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        );

        // Copy data from temporary column to the new column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_lesson" = "id_cible_lesson_temp"
          WHERE "id_cible_lesson_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_lesson_temp',
        );

        console.log(
          'Successfully converted id_cible_lesson from UUID array back to single UUID',
        );
      } else {
        console.log(
          'id_cible_lesson is already a single UUID, no rollback needed',
        );
      }
    } catch (error) {
      console.error('Error in rollback:', error);
      throw error;
    }
  },
};
