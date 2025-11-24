'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_documentinstance',
      'signature',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_documentinstance',
      'signature',
    );
  },
};

