'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename 'file' column to 'piece_jointe'
    await queryInterface.renameColumn(
      '___tbl_tantor_catalogueformation',
      'file',
      'piece_jointe',
    );

    // Remove 'root' column
    await queryInterface.removeColumn(
      '___tbl_tantor_catalogueformation',
      'root',
    );
  },

  async down(queryInterface, Sequelize) {
    // Add back 'root' column
    await queryInterface.addColumn('___tbl_tantor_catalogueformation', 'root', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Rename 'piece_jointe' back to 'file'
    await queryInterface.renameColumn(
      '___tbl_tantor_catalogueformation',
      'piece_jointe',
      'file',
    );
  },
};
