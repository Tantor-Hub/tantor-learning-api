'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, handle existing NULL values
    // For category: set empty array if NULL
    await queryInterface.sequelize.query(`
      UPDATE ___tbl_tantor_books 
      SET category = '{}'::uuid[] 
      WHERE category IS NULL;
    `);

    // For icon: set a placeholder if NULL (you may want to adjust this)
    await queryInterface.sequelize.query(`
      UPDATE ___tbl_tantor_books 
      SET icon = '' 
      WHERE icon IS NULL;
    `);

    // For piece_joint: set a placeholder if NULL (you may want to adjust this)
    await queryInterface.sequelize.query(`
      UPDATE ___tbl_tantor_books 
      SET piece_joint = '' 
      WHERE piece_joint IS NULL;
    `);

    // Now alter the columns to be NOT NULL
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_books');

    // Update category column
    if (tableDescription.category && tableDescription.category.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'category', {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
        defaultValue: [],
      });
    }

    // Update icon column
    if (tableDescription.icon && tableDescription.icon.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'icon', {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }

    // Update piece_joint column
    if (tableDescription.piece_joint && tableDescription.piece_joint.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'piece_joint', {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_books');

    // Revert category column
    if (tableDescription.category && !tableDescription.category.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'category', {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
        defaultValue: [],
      });
    }

    // Revert icon column
    if (tableDescription.icon && !tableDescription.icon.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'icon', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Revert piece_joint column
    if (tableDescription.piece_joint && !tableDescription.piece_joint.allowNull) {
      await queryInterface.changeColumn('___tbl_tantor_books', 'piece_joint', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};

