'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove foreign key constraint first
    await queryInterface.removeConstraint(
      '___tbl_tantor_fromations',
      '___tbl_tantor_fromations_id_categories_fkey',
    );

    // Remove the id_categories column
    await queryInterface.removeColumn(
      '___tbl_tantor_fromations',
      'id_categories',
    );
  },

  async down(queryInterface, Sequelize) {
    // Add the column back
    await queryInterface.addColumn(
      '___tbl_tantor_fromations',
      'id_categories',
      {
        type: Sequelize.UUID,
        allowNull: true,
      },
    );

    // Add foreign key constraint back
    await queryInterface.addConstraint('___tbl_tantor_fromations', {
      fields: ['id_categories'],
      type: 'foreign key',
      name: '___tbl_tantor_fromations_id_categories_fkey',
      references: {
        table: '___tbl_tantor_categoriesformations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
