'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('___tbl_tantor_documentinstance', 'status', {
      type: Sequelize.ENUM('pending', 'validated', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    });

    await queryInterface.addColumn(
      '___tbl_tantor_documentinstance',
      'comment',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_documentinstance',
      'status',
    );
    await queryInterface.removeColumn(
      '___tbl_tantor_documentinstance',
      'comment',
    );
  },
};
