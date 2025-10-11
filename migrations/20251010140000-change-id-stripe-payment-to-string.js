'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change id_stripe_payment column from UUID to STRING to store Stripe payment intent IDs
    await queryInterface.changeColumn(
      '___tbl_tantor_paymentmethodcard',
      'id_stripe_payment',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert back to UUID type
    await queryInterface.changeColumn(
      '___tbl_tantor_paymentmethodcard',
      'id_stripe_payment',
      {
        type: Sequelize.UUID,
        allowNull: true,
      },
    );
  },
};
