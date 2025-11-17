'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_documenttemplate',
      'signature',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_documenttemplate',
      'signature',
    );
  },
};

