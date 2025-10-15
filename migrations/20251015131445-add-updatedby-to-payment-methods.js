'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add updatedBy column to PaymentMethodOpco table
    await queryInterface.addColumn(
      '___tbl_tantor_paymentmethodopco',
      'updatedBy',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    );

    // Add updatedBy column to PaymentMethodCpf table
    await queryInterface.addColumn(
      '___tbl_tantor_paymentmethodcpf',
      'updatedBy',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove updatedBy column from PaymentMethodOpco table
    await queryInterface.removeColumn(
      '___tbl_tantor_paymentmethodopco',
      'updatedBy',
    );

    // Remove updatedBy column from PaymentMethodCpf table
    await queryInterface.removeColumn(
      '___tbl_tantor_paymentmethodcpf',
      'updatedBy',
    );
  },
};
