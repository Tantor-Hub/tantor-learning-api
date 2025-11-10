'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_catalogueformation',
      'id_training',
      {
        type: Sequelize.UUID,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_catalogueformation',
      'id_training',
    );
  },
};
