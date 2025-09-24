'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the titre column from the trainings table
    await queryInterface.removeColumn('___tbl_tantor_training', 'titre');
  },

  async down(queryInterface, Sequelize) {
    // Add the titre column back if we need to rollback
    await queryInterface.addColumn('___tbl_tantor_training', 'titre', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
