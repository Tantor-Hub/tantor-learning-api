'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if updatedAt column exists, if not add it
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_cours',
    );

    if (!tableDescription.updatedAt) {
      await queryInterface.addColumn('___tbl_tantor_cours', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      });
    }

    // Check if id_formateur column exists, if not add it
    if (!tableDescription.id_formateur) {
      await queryInterface.addColumn('___tbl_tantor_cours', 'id_formateur', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Check if is_published column exists, if not add it
    if (!tableDescription.is_published) {
      await queryInterface.addColumn('___tbl_tantor_cours', 'is_published', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_cours',
    );

    if (tableDescription.updatedAt) {
      await queryInterface.removeColumn('___tbl_tantor_cours', 'updatedAt');
    }

    if (tableDescription.id_formateur) {
      await queryInterface.removeColumn('___tbl_tantor_cours', 'id_formateur');
    }

    if (tableDescription.is_published) {
      await queryInterface.removeColumn('___tbl_tantor_cours', 'is_published');
    }
  },
};
