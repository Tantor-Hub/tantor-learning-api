'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the documentinstance table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_documentinstance',
    );

    if (!tableExists) {
      console.log('DocumentInstance table does not exist, skipping migration');
      return;
    }

    console.log('Adding unique constraint to documentinstance table...');

    // Check if the unique constraint already exists
    const indexes = await queryInterface.showIndex(
      '___tbl_tantor_documentinstance',
    );
    const uniqueConstraintExists = indexes.some(
      (index) =>
        index.unique &&
        index.fields.some((field) => field.attribute === 'userId') &&
        index.fields.some((field) => field.attribute === 'templateId'),
    );

    if (uniqueConstraintExists) {
      console.log('Unique constraint already exists on documentinstance table');
      return;
    }

    // First, remove any duplicate records (keep the most recent one)
    console.log('Removing duplicate records...');
    await queryInterface.sequelize.query(`
      DELETE FROM "___tbl_tantor_documentinstance" 
      WHERE id NOT IN (
        SELECT DISTINCT ON ("userId", "templateId") id 
        FROM "___tbl_tantor_documentinstance" 
        ORDER BY "userId", "templateId", "createdAt" DESC
      )
    `);

    // Add the unique constraint
    await queryInterface.addIndex('___tbl_tantor_documentinstance', {
      fields: ['userId', 'templateId'],
      unique: true,
      name: 'unique_user_template',
    });

    console.log('Successfully added unique constraint to documentinstance table');
  },

  async down(queryInterface, Sequelize) {
    // Check if the documentinstance table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_documentinstance',
    );

    if (!tableExists) {
      console.log('DocumentInstance table does not exist, skipping rollback');
      return;
    }

    console.log('Removing unique constraint from documentinstance table...');

    // Remove the unique constraint
    await queryInterface.removeIndex(
      '___tbl_tantor_documentinstance',
      'unique_user_template',
    );

    console.log(
      'Successfully removed unique constraint from documentinstance table',
    );
  },
};

