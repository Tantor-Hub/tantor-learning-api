'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the type column already exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_otps',
    );

    if (!tableInfo.type) {
      console.log('Adding type column to OTP table...');

      // For PostgreSQL, check if the ENUM type already exists before creating it
      const [enumTypes] = await queryInterface.sequelize.query(`
        SELECT typname 
        FROM pg_type 
        WHERE typname = 'enum____tbl_tantor_otps_type'
      `);

      if (enumTypes.length === 0) {
        // Create the ENUM type if it doesn't exist
        await queryInterface.sequelize.query(
          "CREATE TYPE enum____tbl_tantor_otps_type AS ENUM ('normal', 'gmail');",
        );
        console.log('Created ENUM type enum____tbl_tantor_otps_type');
      } else {
        console.log('ENUM type already exists, skipping creation...');
      }

      // Add type column to OTP table
      await queryInterface.addColumn('___tbl_tantor_otps', 'type', {
        type: Sequelize.ENUM('normal', 'gmail'),
        allowNull: false,
        defaultValue: 'normal',
      });

      // Update existing records to have 'normal' as default
      await queryInterface.sequelize.query(
        "UPDATE ___tbl_tantor_otps SET type = 'normal' WHERE type IS NULL;",
      );

      console.log('Type column added successfully to OTP table');
    } else {
      console.log('Type column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the type column exists
    const tableInfo = await queryInterface.describeTable(
      '___tbl_tantor_otps',
    );

    if (tableInfo.type) {
      console.log('Removing type column from OTP table...');

      // Remove type column from OTP table
      await queryInterface.removeColumn('___tbl_tantor_otps', 'type');

      // Drop the enum type (PostgreSQL specific)
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum____tbl_tantor_otps_type;',
      );

      console.log('Type column removed successfully from OTP table');
    } else {
      console.log('Type column does not exist, skipping...');
    }
  },
};

