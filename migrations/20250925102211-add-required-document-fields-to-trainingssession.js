'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new required document fields to trainingssession table
    await queryInterface.addColumn(
      '___tbl_tantor_trainingssession',
      'required_document_before',
      {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      '___tbl_tantor_trainingssession',
      'required_document_during',
      {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      '___tbl_tantor_trainingssession',
      'required_document_after',
      {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
    );

    // Remove the old required_document column if it exists
    await queryInterface.removeColumn(
      '___tbl_tantor_trainingssession',
      'required_document',
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes: remove new columns and restore old column
    await queryInterface.removeColumn(
      '___tbl_tantor_trainingssession',
      'required_document_before',
    );
    await queryInterface.removeColumn(
      '___tbl_tantor_trainingssession',
      'required_document_during',
    );
    await queryInterface.removeColumn(
      '___tbl_tantor_trainingssession',
      'required_document_after',
    );

    // Restore the old required_document column
    await queryInterface.addColumn(
      '___tbl_tantor_trainingssession',
      'required_document',
      {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
    );
  },
};
