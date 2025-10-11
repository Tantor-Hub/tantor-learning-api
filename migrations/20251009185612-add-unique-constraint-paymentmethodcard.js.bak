'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add unique constraint to prevent duplicate payment methods for same user and session
    await queryInterface.addConstraint('___tbl_tantor_paymentmethodcard', {
      fields: ['id_user', 'id_session'],
      type: 'unique',
      name: 'unique_user_session_payment_card',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint(
      '___tbl_tantor_paymentmethodcard',
      'unique_user_session_payment_card',
    );
  },
};
