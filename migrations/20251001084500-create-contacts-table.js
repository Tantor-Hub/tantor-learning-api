'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_contacts', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      from_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      from_mail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    await queryInterface.dropTable('___tbl_tantor_contacts');
  },
};

