'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_books');
    if (!tableDescription.downloadable) {
      await queryInterface.addColumn('___tbl_tantor_books', 'downloadable', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_books');
    if (tableDescription.downloadable) {
      await queryInterface.removeColumn('___tbl_tantor_books', 'downloadable');
    }
  },
};

