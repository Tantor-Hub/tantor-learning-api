'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_replieschats', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      id_sender: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_chat: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_transferechat: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_transferechats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('alive', 'archive', 'deleted'),
        allowNull: false,
        defaultValue: 'alive',
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('___tbl_tantor_replieschats');
  },
};
