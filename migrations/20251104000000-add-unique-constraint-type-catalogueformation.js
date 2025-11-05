'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, check if there are duplicate types and handle them
    const [results] = await queryInterface.sequelize.query(`
      SELECT type, COUNT(*) as count
      FROM ___tbl_tantor_catalogueformation
      GROUP BY type
      HAVING COUNT(*) > 1
    `);

    if (results.length > 0) {
      console.log('Duplicate catalogue types found:', results);
      console.log('Removing duplicates, keeping the most recent one for each type...');
      
      // For each duplicate type, keep only the most recent one (by createdAt)
      for (const duplicate of results) {
        const type = duplicate.type;
        console.log(`Processing duplicates for type: ${type}`);
        
        // Delete all but the most recent catalogue for this type
        await queryInterface.sequelize.query(`
          DELETE FROM ___tbl_tantor_catalogueformation
          WHERE id IN (
            SELECT id FROM (
              SELECT id, 
                     ROW_NUMBER() OVER (PARTITION BY type ORDER BY "createdAt" DESC) as rn
              FROM ___tbl_tantor_catalogueformation
              WHERE type = :type
            ) t
            WHERE rn > 1
          )
        `, {
          replacements: { type },
          type: Sequelize.QueryTypes.DELETE,
        });
        
        console.log(`Removed duplicate catalogues for type: ${type}`);
      }
    }

    // Add unique constraint on type column
    await queryInterface.addIndex(
      '___tbl_tantor_catalogueformation',
      ['type'],
      {
        unique: true,
        name: 'unique_catalogue_type',
      },
    );
    
    console.log('Unique constraint added successfully on type column');
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeIndex(
      '___tbl_tantor_catalogueformation',
      'unique_catalogue_type',
    );
  },
};

