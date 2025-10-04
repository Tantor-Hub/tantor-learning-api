'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the lessondocument table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_lessondocument',
    );

    if (tableExists) {
      // Check if title column doesn't exist
      if (!tableExists.title) {
        await queryInterface.addColumn(
          '___tbl_tantor_lessondocument',
          'title',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'Untitled Document',
          },
        );
        console.log('Successfully added title column to lessondocument table');
      } else {
        console.log('title column already exists in lessondocument table');
      }

      // Check if description column doesn't exist
      if (!tableExists.description) {
        await queryInterface.addColumn(
          '___tbl_tantor_lessondocument',
          'description',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: 'No description provided',
          },
        );
        console.log(
          'Successfully added description column to lessondocument table',
        );
      } else {
        console.log(
          'description column already exists in lessondocument table',
        );
      }
    } else {
      console.log('lessondocument table does not exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the lessondocument table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_lessondocument',
    );

    if (tableExists) {
      // Remove title column if it exists
      if (tableExists.title) {
        await queryInterface.removeColumn(
          '___tbl_tantor_lessondocument',
          'title',
        );
        console.log(
          'Successfully removed title column from lessondocument table',
        );
      } else {
        console.log('title column does not exist in lessondocument table');
      }

      // Remove description column if it exists
      if (tableExists.description) {
        await queryInterface.removeColumn(
          '___tbl_tantor_lessondocument',
          'description',
        );
        console.log(
          'Successfully removed description column from lessondocument table',
        );
      } else {
        console.log(
          'description column does not exist in lessondocument table',
        );
      }
    } else {
      console.log('lessondocument table does not exist');
    }
  },
};
