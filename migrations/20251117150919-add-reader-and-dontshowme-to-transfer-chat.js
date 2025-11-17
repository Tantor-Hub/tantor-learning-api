'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add reader column with default empty array
    await queryInterface.sequelize.query(`
      ALTER TABLE "___tbl_tantor_transferechats"
      ADD COLUMN "reader" UUID[] DEFAULT '{}'::uuid[];
    `);

    // Add dontshowme column with default empty array
    await queryInterface.sequelize.query(`
      ALTER TABLE "___tbl_tantor_transferechats"
      ADD COLUMN "dontshowme" UUID[] DEFAULT '{}'::uuid[];
    `);

    // Update existing records to have empty arrays if they are null (shouldn't be needed with DEFAULT, but just in case)
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_transferechats"
      SET reader = '{}'::uuid[]
      WHERE reader IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_transferechats"
      SET dontshowme = '{}'::uuid[]
      WHERE dontshowme IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_transferechats',
      'dontshowme',
    );
    await queryInterface.removeColumn(
      '___tbl_tantor_transferechats',
      'reader',
    );
  },
};

