'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop and recreate createdBy as UUID
    await queryInterface.removeColumn('___tbl_tantor_cours', 'createdBy');
    await queryInterface.addColumn('___tbl_tantor_cours', 'createdBy', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Drop and recreate id_formateur as ARRAY(STRING)
    await queryInterface.removeColumn('___tbl_tantor_cours', 'id_formateur');
    await queryInterface.addColumn('___tbl_tantor_cours', 'id_formateur', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert createdBy back to INTEGER
    await queryInterface.changeColumn('___tbl_tantor_cours', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Revert id_formateur back to STRING
    await queryInterface.changeColumn('___tbl_tantor_cours', 'id_formateur', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
