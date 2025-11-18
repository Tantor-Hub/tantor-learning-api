'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if column exists before adding it
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_replieschats');
    
    if (!tableDescription.id_transferechat) {
      await queryInterface.addColumn('___tbl_tantor_replieschats', 'id_transferechat', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_transferechats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Check if column exists before removing it
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_replieschats');
    
    if (tableDescription.id_transferechat) {
      await queryInterface.removeColumn('___tbl_tantor_replieschats', 'id_transferechat');
    }
  }
};
