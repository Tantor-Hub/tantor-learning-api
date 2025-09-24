'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add title column
    await queryInterface.addColumn(
      '___tbl_tantor_categoriesformations',
      'title',
      {
        type: Sequelize.STRING,
        allowNull: true, // Allow null for existing records
      },
    );

    // Add createdAt column
    await queryInterface.addColumn(
      '___tbl_tantor_categoriesformations',
      'createdAt',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    );

    // Add updatedAt column
    await queryInterface.addColumn(
      '___tbl_tantor_categoriesformations',
      'updatedAt',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn(
      '___tbl_tantor_categoriesformations',
      'updatedAt',
    );

    await queryInterface.removeColumn(
      '___tbl_tantor_categoriesformations',
      'createdAt',
    );

    await queryInterface.removeColumn(
      '___tbl_tantor_categoriesformations',
      'title',
    );
  },
};
