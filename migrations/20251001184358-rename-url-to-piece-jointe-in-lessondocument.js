'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the lessondocument table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_lessondocument',
    );

    if (tableExists) {
      // Check if the url column exists and piece_jointe doesn't exist
      if (tableExists.url && !tableExists.piece_jointe) {
        // Rename url column to piece_jointe
        await queryInterface.renameColumn(
          '___tbl_tantor_lessondocument',
          'url',
          'piece_jointe',
        );
        console.log(
          'Successfully renamed url column to piece_jointe in lessondocument table',
        );
      } else if (tableExists.piece_jointe) {
        console.log(
          'piece_jointe column already exists in lessondocument table',
        );
      } else {
        console.log('url column does not exist in lessondocument table');
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
      // Check if the piece_jointe column exists and url doesn't exist
      if (tableExists.piece_jointe && !tableExists.url) {
        // Rename piece_jointe column back to url
        await queryInterface.renameColumn(
          '___tbl_tantor_lessondocument',
          'piece_jointe',
          'url',
        );
        console.log(
          'Successfully renamed piece_jointe column back to url in lessondocument table',
        );
      } else if (tableExists.url) {
        console.log('url column already exists in lessondocument table');
      } else {
        console.log(
          'piece_jointe column does not exist in lessondocument table',
        );
      }
    } else {
      console.log('lessondocument table does not exist');
    }
  },
};
