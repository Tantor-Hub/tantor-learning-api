'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the contacts table exists
    const contactsTableExists = await queryInterface.describeTable(
      '___tbl_tantor_contacts',
    );

    if (!contactsTableExists) {
      console.log('Contacts table does not exist, skipping migration...');
      return;
    }

    // Check if id column exists and is INTEGER
    if (contactsTableExists.id) {
      const idColumnType = contactsTableExists.id.type?.toLowerCase() || '';
      
      // Check if it's integer or bigint (both need conversion)
      if (idColumnType.includes('integer') || idColumnType.includes('bigint') || idColumnType.includes('int')) {
        console.log('Converting contacts table id column from INTEGER to UUID...');
        
        // First, drop the primary key constraint if it exists
        try {
          await queryInterface.removeConstraint(
            '___tbl_tantor_contacts',
            '___tbl_tantor_contacts_pkey',
          );
        } catch (error) {
          console.log('Primary key constraint may not exist or has a different name:', error.message);
        }

        // Add a new UUID column
        await queryInterface.addColumn(
          '___tbl_tantor_contacts',
          'new_id',
          {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4,
          },
        );

        // Update the new_id column with UUIDs for existing records
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_contacts" 
          SET "new_id" = gen_random_uuid()
        `);

        // Drop the old id column
        await queryInterface.removeColumn(
          '___tbl_tantor_contacts',
          'id',
        );

        // Rename new_id to id
        await queryInterface.renameColumn(
          '___tbl_tantor_contacts',
          'new_id',
          'id',
        );

        // Add primary key constraint back
        await queryInterface.addConstraint('___tbl_tantor_contacts', {
          fields: ['id'],
          type: 'primary key',
          name: '___tbl_tantor_contacts_pkey',
        });

        console.log('Successfully converted contacts id column to UUID');
      } else if (idColumnType.includes('uuid')) {
        console.log('Contacts id column is already UUID, skipping conversion...');
      } else {
        console.log(`Contacts id column has unexpected type: ${idColumnType}, skipping conversion...`);
      }
    } else {
      // If id doesn't exist, add it as UUID
      console.log('Adding UUID id column to contacts table...');
      await queryInterface.addColumn('___tbl_tantor_contacts', 'id', {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      });
      console.log('Successfully added UUID id column to contacts table');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    const contactsTableExists = await queryInterface.describeTable(
      '___tbl_tantor_contacts',
    );

    if (!contactsTableExists) {
      return;
    }

    if (contactsTableExists.id) {
      const idColumnType = contactsTableExists.id.type?.toLowerCase() || '';
      
      if (idColumnType.includes('uuid')) {
        console.log('Reverting contacts id column from UUID to INTEGER...');
        
        // Drop primary key constraint
        try {
          await queryInterface.removeConstraint(
            '___tbl_tantor_contacts',
            '___tbl_tantor_contacts_pkey',
          );
        } catch (error) {
          console.log('Error removing constraint:', error.message);
        }

        // Add a new INTEGER column
        await queryInterface.addColumn(
          '___tbl_tantor_contacts',
          'new_id',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
          },
        );

        // Drop the old UUID id column
        await queryInterface.removeColumn(
          '___tbl_tantor_contacts',
          'id',
        );

        // Rename new_id to id
        await queryInterface.renameColumn(
          '___tbl_tantor_contacts',
          'new_id',
          'id',
        );

        // Add primary key constraint back
        await queryInterface.addConstraint('___tbl_tantor_contacts', {
          fields: ['id'],
          type: 'primary key',
          name: '___tbl_tantor_contacts_pkey',
        });

        console.log('Successfully reverted contacts id column to INTEGER');
      }
    }
  },
};

