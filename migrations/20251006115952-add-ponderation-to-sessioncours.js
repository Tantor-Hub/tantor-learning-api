'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_sessioncours',
    );

    if (!tableExists.ponderation) {
      // Add the ponderation column to sessioncours table
      await queryInterface.addColumn(
        '___tbl_tantor_sessioncours',
        'ponderation',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Ponderation value for the session course',
        },
      );
    } else {
      console.log(
        'ponderation column already exists in sessioncours table, skipping...',
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_sessioncours',
      'ponderation',
    );
  },
};
