'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the lessondocument table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_lessondocument',
    );

    if (tableExists) {
      // Fix id_lesson column type from VARCHAR to UUID
      if (
        tableExists.id_lesson &&
        tableExists.id_lesson.type === 'character varying'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_lessondocument',
          'id_lesson',
          {
            type: Sequelize.UUID,
            allowNull: true,
          },
        );
      }

      // Fix createdBy column type from INTEGER to UUID
      if (tableExists.createdBy && tableExists.createdBy.type === 'integer') {
        await queryInterface.changeColumn(
          '___tbl_tantor_lessondocument',
          'createdBy',
          {
            type: Sequelize.UUID,
            allowNull: true,
          },
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_lessondocument',
    );

    if (tableExists) {
      // Revert id_lesson column type from UUID to VARCHAR
      if (tableExists.id_lesson && tableExists.id_lesson.type === 'uuid') {
        await queryInterface.changeColumn(
          '___tbl_tantor_lessondocument',
          'id_lesson',
          {
            type: Sequelize.STRING,
            allowNull: true,
          },
        );
      }

      // Revert createdBy column type from UUID to INTEGER
      if (tableExists.createdBy && tableExists.createdBy.type === 'uuid') {
        await queryInterface.changeColumn(
          '___tbl_tantor_lessondocument',
          'createdBy',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
        );
      }
    }
  },
};
