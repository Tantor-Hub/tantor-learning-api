'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the unique constraint on type column
    await queryInterface.removeIndex(
      '___tbl_tantor_catalogueformation',
      'unique_catalogue_type',
    );

    console.log('Unique constraint removed successfully from type column');
  },

  async down(queryInterface, Sequelize) {
    // Re-add the unique constraint on type column
    await queryInterface.addIndex(
      '___tbl_tantor_catalogueformation',
      ['type'],
      {
        unique: true,
        name: 'unique_catalogue_type',
      },
    );

    console.log('Unique constraint re-added successfully on type column');
  },
};
