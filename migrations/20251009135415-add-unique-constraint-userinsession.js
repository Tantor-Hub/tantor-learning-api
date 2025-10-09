'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the userinsession table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_userinsession',
    );

    if (!tableExists) {
      console.log('UserInSession table does not exist, skipping migration');
      return;
    }

    console.log('Adding unique constraint to userinsession table...');

    // Check if the unique constraint already exists
    const indexes = await queryInterface.showIndex(
      '___tbl_tantor_userinsession',
    );
    const uniqueConstraintExists = indexes.some(
      (index) =>
        index.unique &&
        index.fields.some((field) => field.attribute === 'id_user') &&
        index.fields.some((field) => field.attribute === 'id_session'),
    );

    if (uniqueConstraintExists) {
      console.log('Unique constraint already exists on userinsession table');
      return;
    }

    // First, remove any duplicate records (keep the most recent one)
    console.log('Removing duplicate records...');
    await queryInterface.sequelize.query(`
      DELETE FROM "___tbl_tantor_userinsession" 
      WHERE id NOT IN (
        SELECT DISTINCT ON (id_user, id_session) id 
        FROM "___tbl_tantor_userinsession" 
        ORDER BY id_user, id_session, "createdAt" DESC
      )
    `);

    // Add the unique constraint
    await queryInterface.addIndex('___tbl_tantor_userinsession', {
      fields: ['id_user', 'id_session'],
      unique: true,
      name: 'unique_user_session',
    });

    console.log('Successfully added unique constraint to userinsession table');
  },

  async down(queryInterface, Sequelize) {
    // Check if the userinsession table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_userinsession',
    );

    if (!tableExists) {
      console.log('UserInSession table does not exist, skipping rollback');
      return;
    }

    console.log('Removing unique constraint from userinsession table...');

    // Remove the unique constraint
    await queryInterface.removeIndex(
      '___tbl_tantor_userinsession',
      'unique_user_session',
    );

    console.log(
      'Successfully removed unique constraint from userinsession table',
    );
  },
};
