'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('___tbl_tantor_events', 'qrcode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('___tbl_tantor_events', 'participant', {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('___tbl_tantor_events', 'participant');
    await queryInterface.removeColumn('___tbl_tantor_events', 'qrcode');
  },
};
