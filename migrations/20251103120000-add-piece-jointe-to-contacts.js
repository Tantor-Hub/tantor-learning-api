'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column exists before adding it
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_contacts',
    );

    if (!tableInfo.piece_jointe) {
      console.log('Adding piece_jointe column to contacts table...');
      await queryInterface.addColumn('___tbl_tantor_contacts', 'piece_jointe', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      console.log('piece_jointe column added successfully');
    } else {
      console.log('piece_jointe column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the column exists before removing it
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_contacts',
    );

    if (tableInfo.piece_jointe) {
      console.log('Removing piece_jointe column from contacts table...');
      await queryInterface.removeColumn('___tbl_tantor_contacts', 'piece_jointe');
      console.log('piece_jointe column removed successfully');
    } else {
      console.log('piece_jointe column does not exist, skipping rollback...');
    }
  },
};

