'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the existing primary key constraint
    await queryInterface.removeConstraint(
      '___tbl_tantor_lesson',
      '___tbl_tantor_lesson_pkey',
    );

    // Add a new UUID column
    await queryInterface.addColumn('___tbl_tantor_lesson', 'id_new', {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    });

    // Update existing records with new UUIDs
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_lesson" 
      SET "id_new" = gen_random_uuid()
    `);

    // Drop the old id column
    await queryInterface.removeColumn('___tbl_tantor_lesson', 'id');

    // Rename the new column to id
    await queryInterface.renameColumn('___tbl_tantor_lesson', 'id_new', 'id');

    // Add primary key constraint
    await queryInterface.addConstraint('___tbl_tantor_lesson', {
      fields: ['id'],
      type: 'primary key',
      name: '___tbl_tantor_lesson_pkey',
    });

    // Add unique constraint
    await queryInterface.addConstraint('___tbl_tantor_lesson', {
      fields: ['id'],
      type: 'unique',
      name: '___tbl_tantor_lesson_id_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove constraints
    await queryInterface.removeConstraint(
      '___tbl_tantor_lesson',
      '___tbl_tantor_lesson_pkey',
    );
    await queryInterface.removeConstraint(
      '___tbl_tantor_lesson',
      '___tbl_tantor_lesson_id_unique',
    );

    // Add back the old INTEGER id column
    await queryInterface.addColumn('___tbl_tantor_lesson', 'id_old', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
    });

    // Drop the UUID id column
    await queryInterface.removeColumn('___tbl_tantor_lesson', 'id');

    // Rename the old column back to id
    await queryInterface.renameColumn('___tbl_tantor_lesson', 'id_old', 'id');

    // Add primary key constraint
    await queryInterface.addConstraint('___tbl_tantor_lesson', {
      fields: ['id'],
      type: 'primary key',
      name: '___tbl_tantor_lesson_pkey',
    });

    // Add unique constraint
    await queryInterface.addConstraint('___tbl_tantor_lesson', {
      fields: ['id'],
      type: 'unique',
      name: '___tbl_tantor_lesson_id_unique',
    });
  },
};
