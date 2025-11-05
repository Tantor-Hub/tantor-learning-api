'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the existing foreign key constraint with CASCADE
    // First, find the constraint name (PostgreSQL syntax)
    const [results] = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = '___tbl_tantor_otps'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name IN (
        SELECT constraint_name
        FROM information_schema.key_column_usage
        WHERE table_name = '___tbl_tantor_otps'
        AND column_name = 'userId'
      )
    `);

    if (results && results.length > 0) {
      const constraintName = results[0].constraint_name;
      
      // Drop the existing foreign key constraint (PostgreSQL syntax)
      await queryInterface.sequelize.query(`
        ALTER TABLE "___tbl_tantor_otps"
        DROP CONSTRAINT "${constraintName}"
      `);

      // First, make userId nullable to allow SET NULL
      await queryInterface.changeColumn('___tbl_tantor_otps', 'userId', {
        type: Sequelize.UUID,
        allowNull: true,
      });

      // Recreate the foreign key constraint without CASCADE delete (using SET NULL)
      await queryInterface.addConstraint('___tbl_tantor_otps', {
        fields: ['userId'],
        type: 'foreign key',
        name: constraintName,
        references: {
          table: '___tbl_tantor_users',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface, Sequelize) {
      // Revert: restore CASCADE delete and NOT NULL constraint
    const [results] = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = '___tbl_tantor_otps'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name IN (
        SELECT constraint_name
        FROM information_schema.key_column_usage
        WHERE table_name = '___tbl_tantor_otps'
        AND column_name = 'userId'
      )
    `);

    if (results && results.length > 0) {
      const constraintName = results[0].constraint_name;
      
      // Drop the existing foreign key constraint (PostgreSQL syntax)
      await queryInterface.sequelize.query(`
        ALTER TABLE "___tbl_tantor_otps"
        DROP CONSTRAINT "${constraintName}"
      `);

      // Make userId NOT NULL again
      await queryInterface.changeColumn('___tbl_tantor_otps', 'userId', {
        type: Sequelize.UUID,
        allowNull: false,
      });

      // Recreate with CASCADE delete
      await queryInterface.addConstraint('___tbl_tantor_otps', {
        fields: ['userId'],
        type: 'foreign key',
        name: constraintName,
        references: {
          table: '___tbl_tantor_users',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  },
};

