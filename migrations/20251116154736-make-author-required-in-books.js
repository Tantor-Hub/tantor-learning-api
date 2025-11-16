'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, handle existing NULL values by setting a placeholder
    await queryInterface.sequelize.query(`
      UPDATE ___tbl_tantor_books 
      SET author = 'Unknown Author' 
      WHERE author IS NULL OR author = '';
    `);

    // Now alter the column to be NOT NULL
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_books');

    if (tableDescription.author && tableDescription.author.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'author', {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_books');

    // Revert author column to allow NULL
    if (tableDescription.author && !tableDescription.author.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'author', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};

