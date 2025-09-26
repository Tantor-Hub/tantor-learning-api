'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if id_session column exists, if not add it
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_cours',
    );

    if (!tableDescription.id_session) {
      await queryInterface.addColumn('___tbl_tantor_cours', 'id_session', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_trainingssession',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable(
      '___tbl_tantor_cours',
    );

    if (tableDescription.id_session) {
      await queryInterface.removeColumn('___tbl_tantor_cours', 'id_session');
    }
  },
};
