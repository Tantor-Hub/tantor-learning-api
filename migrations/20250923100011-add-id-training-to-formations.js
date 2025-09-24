'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('___tbl_tantor_fromations', 'id_training', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: '___tbl_tantor_trainingcategory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_fromations',
      'id_training',
    );
  },
};
