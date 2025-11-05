'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_users');
    if (!tableDescription.otp_expires_at) {
      await queryInterface.addColumn('___tbl_tantor_users', 'otp_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('___tbl_tantor_users');
    if (tableDescription.otp_expires_at) {
      await queryInterface.removeColumn('___tbl_tantor_users', 'otp_expires_at');
    }
  },
};
