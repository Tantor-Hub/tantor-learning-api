'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Check if the column is currently NOT NULL before dropping the constraint
    const [results] = await queryInterface.sequelize.query(`
      SELECT 
        is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = '___tbl_tantor_replieschats' 
        AND column_name = 'id_chat';
    `);

    // Only drop NOT NULL if the column is currently NOT NULL
    if (results && results.length > 0 && results[0].is_nullable === 'NO') {
      console.log('Dropping NOT NULL constraint on id_chat column...');
      await queryInterface.sequelize.query(
        'ALTER TABLE "___tbl_tantor_replieschats" ALTER COLUMN "id_chat" DROP NOT NULL;',
      );
      console.log('NOT NULL constraint dropped successfully');
    } else {
      console.log('id_chat column already allows NULL, skipping migration');
    }
  },

  async down(queryInterface) {
    // Revert by adding NOT NULL constraint (may fail if null values exist)
    const [results] = await queryInterface.sequelize.query(`
      SELECT 
        is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = '___tbl_tantor_replieschats' 
        AND column_name = 'id_chat';
    `);

    // Only add NOT NULL if the column currently allows NULL
    if (results && results.length > 0 && results[0].is_nullable === 'YES') {
      // First, update any NULL values to a default (this may need adjustment based on your business logic)
      // For now, we'll just try to set NOT NULL and let it fail if there are NULLs
      console.log('Adding NOT NULL constraint on id_chat column...');
      await queryInterface.sequelize.query(
        'ALTER TABLE "___tbl_tantor_replieschats" ALTER COLUMN "id_chat" SET NOT NULL;',
      );
      console.log('NOT NULL constraint added successfully');
    } else {
      console.log(
        'id_chat column already has NOT NULL constraint, skipping rollback',
      );
    }
  },
};
