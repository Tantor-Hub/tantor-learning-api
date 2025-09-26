'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if is_published column exists, if not add it
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_cours',
    );

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

    if (tableDescription.is_published) {
      await queryInterface.removeColumn('___tbl_tantor_cours', 'is_published');
    }
  },
};
