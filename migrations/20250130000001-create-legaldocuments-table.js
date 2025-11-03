'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_legaldocuments', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      type: {
        type: Sequelize.ENUM(
          'CODE_ETHIQUE',
          'CONDITIONS_GENERALES_UTILISATION',
          'CONDITIONS_GENERALES_SERVICE',
          'MENTIONS_LEGALES',
          'REGLEMENT_INTERIEUR',
          'POLITIQUE_GLOBALE_RECLAMATIONS',
          'POLITIQUE_PROTECTION_DONNEES',
        ),
        allowNull: false,
        unique: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // Add index on type for faster lookups
    await queryInterface.addIndex('___tbl_tantor_legaldocuments', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('___tbl_tantor_legaldocuments');
  },
};
