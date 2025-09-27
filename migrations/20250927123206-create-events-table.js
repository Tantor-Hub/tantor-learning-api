'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_events', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_cible_training: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
      },
      id_cible_session: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
      },
      id_cible_cours: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
      },
      id_cible_lesson: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
      },
      id_cible_user: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
      },
      begining_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ending_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('___tbl_tantor_events');
  },
};
