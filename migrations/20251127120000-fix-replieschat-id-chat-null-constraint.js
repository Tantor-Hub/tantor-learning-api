'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter id_chat column to allow NULL
    await queryInterface.changeColumn('___tbl_tantor_replieschats', 'id_chat', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: '___tbl_tantor_chats',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert id_chat to NOT NULL (note: this may fail if there are existing NULL values)
    await queryInterface.changeColumn('___tbl_tantor_replieschats', 'id_chat', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: '___tbl_tantor_chats',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
