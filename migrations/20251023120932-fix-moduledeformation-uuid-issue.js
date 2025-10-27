'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, check if uuid column exists and drop it if it does
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_moduledeformation',
    );

    if (tableDescription.uuid) {
      await queryInterface.removeColumn(
        '___tbl_tantor_moduledeformation',
        'uuid',
      );
    }

    // Ensure id column is properly configured as UUID with default
    await queryInterface.changeColumn('___tbl_tantor_moduledeformation', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the id column to its previous state (without default)
    await queryInterface.changeColumn('___tbl_tantor_moduledeformation', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      // Remove defaultValue to revert
    });
  },
};
