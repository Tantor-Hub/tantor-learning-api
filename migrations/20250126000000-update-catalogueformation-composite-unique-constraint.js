'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the old unique constraint on type only
    try {
      await queryInterface.removeIndex(
        '___tbl_tantor_catalogueformation',
        'unique_catalogue_type',
      );
      console.log('Removed old unique constraint on type column');
    } catch (error) {
      console.log('Old constraint may not exist, continuing...', error.message);
    }

    // Check for duplicate combinations of (type, id_training)
    // Note: NULL values are considered distinct in unique constraints,
    // so multiple rows with same type and NULL id_training would be allowed
    // But we want only one per (type, id_training) combination
    const [duplicateResults] = await queryInterface.sequelize.query(`
      SELECT type, id_training, COUNT(*) as count
      FROM ___tbl_tantor_catalogueformation
      GROUP BY type, id_training
      HAVING COUNT(*) > 1
    `);

    if (duplicateResults.length > 0) {
      console.log('Duplicate (type, id_training) combinations found:', duplicateResults);
      console.log('Removing duplicates, keeping the most recent one for each combination...');
      
      // For each duplicate combination, keep only the most recent one (by createdAt)
      for (const duplicate of duplicateResults) {
        const type = duplicate.type;
        const idTraining = duplicate.id_training;
        console.log(`Processing duplicates for type: ${type}, id_training: ${idTraining || 'NULL'}`);
        
        // Delete all but the most recent catalogue for this combination
        if (idTraining) {
          await queryInterface.sequelize.query(`
            DELETE FROM ___tbl_tantor_catalogueformation
            WHERE id IN (
              SELECT id FROM (
                SELECT id, 
                       ROW_NUMBER() OVER (PARTITION BY type, id_training ORDER BY "createdAt" DESC) as rn
                FROM ___tbl_tantor_catalogueformation
                WHERE type = :type AND id_training = :idTraining
              ) t
              WHERE rn > 1
            )
          `, {
            replacements: { type, idTraining },
            type: Sequelize.QueryTypes.DELETE,
          });
        } else {
          await queryInterface.sequelize.query(`
            DELETE FROM ___tbl_tantor_catalogueformation
            WHERE id IN (
              SELECT id FROM (
                SELECT id, 
                       ROW_NUMBER() OVER (PARTITION BY type, id_training ORDER BY "createdAt" DESC) as rn
                FROM ___tbl_tantor_catalogueformation
                WHERE type = :type AND id_training IS NULL
              ) t
              WHERE rn > 1
            )
          `, {
            replacements: { type },
            type: Sequelize.QueryTypes.DELETE,
          });
        }
        
        console.log(`Removed duplicate catalogues for type: ${type}, id_training: ${idTraining || 'NULL'}`);
      }
    }

    // Add composite unique constraint on (type, id_training)
    // Check if the index already exists
    try {
      const [indexes] = await queryInterface.sequelize.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = '___tbl_tantor_catalogueformation' 
        AND indexname = 'unique_catalogue_type_training'
      `);
      
      if (indexes.length === 0) {
        await queryInterface.addIndex(
          '___tbl_tantor_catalogueformation',
          ['type', 'id_training'],
          {
            unique: true,
            name: 'unique_catalogue_type_training',
          },
        );
        console.log('Composite unique constraint added successfully on (type, id_training) columns');
      } else {
        console.log('Composite unique constraint already exists, skipping...');
      }
    } catch (error) {
      console.log('Error checking/adding composite constraint:', error.message);
      // If it's not a "already exists" error, rethrow
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Index already exists, continuing...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the composite unique constraint
    try {
      await queryInterface.removeIndex(
        '___tbl_tantor_catalogueformation',
        'unique_catalogue_type_training',
      );
      console.log('Removed composite unique constraint');
    } catch (error) {
      console.log('Composite constraint may not exist, continuing...', error.message);
    }

    // Restore the old unique constraint on type only
    try {
      await queryInterface.addIndex(
        '___tbl_tantor_catalogueformation',
        ['type'],
        {
          unique: true,
          name: 'unique_catalogue_type',
        },
      );
      console.log('Restored old unique constraint on type column');
    } catch (error) {
      console.log('Error restoring old constraint:', error.message);
    }
  },
};

