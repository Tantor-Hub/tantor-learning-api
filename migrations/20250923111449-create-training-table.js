'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_training', {
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
      subtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_trainingcategory: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_trainingcategory',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      trainingtype: {
        type: Sequelize.ENUM(
          'En ligne',
          'Vision Conférence',
          'En présentiel',
          'Hybride',
        ),
        allowNull: true,
      },
      rnc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      requirement: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      pedagogygoals: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      prix: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('___tbl_tantor_training');
  },
};
