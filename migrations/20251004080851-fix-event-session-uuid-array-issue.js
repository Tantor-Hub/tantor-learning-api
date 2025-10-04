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
      // First, let's check the current data type of id_cible_session
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '___tbl_tantor_events' 
        AND column_name = 'id_cible_session'
      `);

      if (results.length === 0) {
        console.log(
          'id_cible_session column does not exist, creating it as single UUID',
        );
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_session',
          {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: '___tbl_tantor_trainingssession',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        );
        return;
      }

      const columnInfo = results[0];
      console.log('Current id_cible_session column info:', columnInfo);

      // If it's an array type, we need to convert it
      if (
        columnInfo.udt_name === 'uuid[]' ||
        columnInfo.data_type === 'ARRAY'
      ) {
        console.log('Converting id_cible_session from array to single UUID...');

        // Create a temporary column to store the first UUID from the array
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_session_temp',
          {
            type: Sequelize.UUID,
            allowNull: true,
          },
        );

        // Copy the first UUID from the array to the temporary column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_session_temp" = "id_cible_session"[1]
          WHERE "id_cible_session" IS NOT NULL 
          AND array_length("id_cible_session", 1) > 0
        `);

        // Remove the old array column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_session',
        );

        // Add the new single UUID column with proper constraints
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_session',
          {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: '___tbl_tantor_trainingssession',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        );

        // Copy data from temporary column to the new column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_session" = "id_cible_session_temp"
          WHERE "id_cible_session_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_session_temp',
        );

        console.log(
          'Successfully converted id_cible_session from array to single UUID',
        );
      } else {
        console.log(
          'id_cible_session is already a single UUID, no conversion needed',
        );
      }

      // Add default values for events that don't have a session
      await queryInterface.sequelize.query(`
        UPDATE "___tbl_tantor_events" 
        SET "id_cible_session" = (
          SELECT id FROM "___tbl_tantor_trainingssession" 
          WHERE "___tbl_tantor_trainingssession"."id" IS NOT NULL 
          LIMIT 1
        )
        WHERE "id_cible_session" IS NULL
        AND EXISTS (SELECT 1 FROM "___tbl_tantor_trainingssession" LIMIT 1)
      `);

      console.log(
        'Successfully added default session values to events without sessions',
      );
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
      // Check the current data type of id_cible_session
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '___tbl_tantor_events' 
        AND column_name = 'id_cible_session'
      `);

      if (results.length === 0) {
        console.log(
          'id_cible_session column does not exist, nothing to rollback',
        );
        return;
      }

      const columnInfo = results[0];
      console.log('Current id_cible_session column info:', columnInfo);

      // If it's a single UUID, convert it back to array
      if (columnInfo.udt_name === 'uuid' && columnInfo.data_type !== 'ARRAY') {
        console.log(
          'Converting id_cible_session from single UUID back to array...',
        );

        // Create a temporary column to store the UUID as array
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_session_temp',
          {
            type: Sequelize.ARRAY(Sequelize.UUID),
            allowNull: true,
          },
        );

        // Copy the single UUID to the temporary array column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_session_temp" = ARRAY["id_cible_session"]
          WHERE "id_cible_session" IS NOT NULL
        `);

        // Remove the single UUID column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_session',
        );

        // Add the array column back
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'id_cible_session',
          {
            type: Sequelize.ARRAY(Sequelize.UUID),
            allowNull: true,
          },
        );

        // Copy data from temporary column to the new array column
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_events" 
          SET "id_cible_session" = "id_cible_session_temp"
          WHERE "id_cible_session_temp" IS NOT NULL
        `);

        // Remove the temporary column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_session_temp',
        );

        console.log('Successfully converted id_cible_session back to array');
      } else {
        console.log('id_cible_session is already an array, no rollback needed');
      }
    } catch (error) {
      console.error('Error in rollback:', error);
      throw error;
    }
  },
};
