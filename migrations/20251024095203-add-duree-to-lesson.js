'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add duree column to lesson table
    await queryInterface.addColumn('___tbl_tantor_lesson', 'duree', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '60h',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove duree column from lesson table
    await queryInterface.removeColumn('___tbl_tantor_lesson', 'duree');
  },
};
