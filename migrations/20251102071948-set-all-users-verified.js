'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_users" SET "is_verified" = true WHERE "is_verified" = false;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Reverting this migration would set is_verified back to false for all users,
    // but since we don't know the original state, we'll leave it as is or set to false.
    // For safety, we'll set to false for all.
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_users" SET "is_verified" = false;
    `);
  },
};
