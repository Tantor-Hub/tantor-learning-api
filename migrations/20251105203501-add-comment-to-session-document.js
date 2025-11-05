'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_sessiondocuments',
      'comment',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_sessiondocuments',
      'comment',
    );
  },
};
