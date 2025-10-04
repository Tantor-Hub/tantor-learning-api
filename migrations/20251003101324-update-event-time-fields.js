'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (tableExists) {
      // Add beginning_hour column if it doesn't exist
      if (!tableExists.beginning_hour) {
        await queryInterface.addColumn(
          '___tbl_tantor_events',
          'beginning_hour',
          {
            type: Sequelize.TIME,
            allowNull: false,
            defaultValue: '09:00:00',
          },
        );
        console.log('Successfully added beginning_hour column to events table');
      } else {
        console.log('beginning_hour column already exists in events table');
      }

      // Add ending_hour column if it doesn't exist
      if (!tableExists.ending_hour) {
        await queryInterface.addColumn('___tbl_tantor_events', 'ending_hour', {
          type: Sequelize.TIME,
          allowNull: false,
          defaultValue: '17:00:00',
        });
        console.log('Successfully added ending_hour column to events table');
      } else {
        console.log('ending_hour column already exists in events table');
      }

      // Remove ending_date column if it exists
      if (tableExists.ending_date) {
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'ending_date',
        );
        console.log(
          'Successfully removed ending_date column from events table',
        );
      } else {
        console.log('ending_date column does not exist in events table');
      }
    } else {
      console.log('events table does not exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (tableExists) {
      // Remove beginning_hour column if it exists
      if (tableExists.beginning_hour) {
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'beginning_hour',
        );
        console.log(
          'Successfully removed beginning_hour column from events table',
        );
      } else {
        console.log('beginning_hour column does not exist in events table');
      }

      // Remove ending_hour column if it exists
      if (tableExists.ending_hour) {
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'ending_hour',
        );
        console.log(
          'Successfully removed ending_hour column from events table',
        );
      } else {
        console.log('ending_hour column does not exist in events table');
      }

      // Add back ending_date column
      if (!tableExists.ending_date) {
        await queryInterface.addColumn('___tbl_tantor_events', 'ending_date', {
          type: Sequelize.DATE,
          allowNull: true,
        });
        console.log(
          'Successfully added ending_date column back to events table',
        );
      } else {
        console.log('ending_date column already exists in events table');
      }
    } else {
      console.log('events table does not exist');
    }
  },
};
