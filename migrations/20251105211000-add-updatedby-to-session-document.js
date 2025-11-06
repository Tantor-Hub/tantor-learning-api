'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_sessiondocuments',
      'updatedBy',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_sessiondocuments',
      'updatedBy',
    );
  },
};

