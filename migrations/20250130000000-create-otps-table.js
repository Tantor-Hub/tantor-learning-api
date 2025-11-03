'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_otps', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      connected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Add index on userId for faster queries
    await queryInterface.addIndex('___tbl_tantor_otps', ['userId']);
    // Add index on createdAt for faster cleanup queries
    await queryInterface.addIndex('___tbl_tantor_otps', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('___tbl_tantor_otps');
  },
};
