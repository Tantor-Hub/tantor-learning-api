'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_surveyquestions',
      'categories',
      {
        type: Sequelize.ENUM('before', 'during', 'after'),
        allowNull: false,
        defaultValue: 'before', // Set a default value for existing records
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_surveyquestions',
      'categories',
    );
  },
};
