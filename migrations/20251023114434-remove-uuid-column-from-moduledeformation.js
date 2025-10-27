'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the uuid column from the moduledeformation table
    await queryInterface.removeColumn(
      '___tbl_tantor_moduledeformation',
      'uuid',
    );
  },

  async down(queryInterface, Sequelize) {
    // Add back the uuid column if we need to rollback
    await queryInterface.addColumn('___tbl_tantor_moduledeformation', 'uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
    });
  },
};
