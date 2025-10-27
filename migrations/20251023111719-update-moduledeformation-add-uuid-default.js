'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add UUID default value to the id column
    await queryInterface.changeColumn('___tbl_tantor_moduledeformation', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the default value (revert to previous state)
    await queryInterface.changeColumn('___tbl_tantor_moduledeformation', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      // Remove defaultValue to revert
    });
  },
};
