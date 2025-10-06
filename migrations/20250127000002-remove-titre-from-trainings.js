'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the titre column from the trainings table
    // Check if the table exists before trying to remove the column
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_trainings',
    );
    if (tableExists && tableExists.titre) {
      await queryInterface.removeColumn('___tbl_tantor_trainings', 'titre');
    }
  },

  async down(queryInterface, Sequelize) {
    // Add the titre column back if we need to rollback
    // Check if the table exists before trying to add the column
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_trainings',
    );
    if (tableExists && !tableExists.titre) {
      await queryInterface.addColumn('___tbl_tantor_trainings', 'titre', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};
