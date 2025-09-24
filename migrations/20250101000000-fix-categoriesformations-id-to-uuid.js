'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change the id column from INTEGER to UUID
    await queryInterface.changeColumn(
      '___tbl_tantor_categoriesformations',
      'id',
      {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert back to INTEGER if needed
    await queryInterface.changeColumn(
      '___tbl_tantor_categoriesformations',
      'id',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
    );
  },
};
