'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the primary key constraint
    await queryInterface.removeConstraint(
      '___tbl_tantor_newsletter',
      '___tbl_tantor_newsletter_pkey',
    );

    // Add a new UUID column
    await queryInterface.addColumn('___tbl_tantor_newsletter', 'new_id', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    });

    // Update all existing records with new UUIDs
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_newsletter" 
      SET "new_id" = gen_random_uuid()
    `);

    // Drop the old id column
    await queryInterface.removeColumn('___tbl_tantor_newsletter', 'id');

    // Rename new_id to id
    await queryInterface.renameColumn(
      '___tbl_tantor_newsletter',
      'new_id',
      'id',
    );

    // Add primary key constraint back
    await queryInterface.addConstraint('___tbl_tantor_newsletter', {
      fields: ['id'],
      type: 'primary key',
      name: '___tbl_tantor_newsletter_pkey',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the id column back to INTEGER (if needed)
    await queryInterface.changeColumn('___tbl_tantor_newsletter', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    });
  },
};
