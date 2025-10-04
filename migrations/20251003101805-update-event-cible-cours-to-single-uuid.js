'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (tableExists) {
      // Check if id_cible_cours exists and is an array
      if (tableExists.id_cible_cours) {
        // Remove the old array column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_cours',
        );
        console.log(
          'Successfully removed old id_cible_cours array column from events table',
        );
      }

      // Add the new single UUID column
      await queryInterface.addColumn('___tbl_tantor_events', 'id_cible_cours', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: '___tbl_tantor_sessioncours',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
      console.log(
        'Successfully added new id_cible_cours UUID column to events table',
      );

      // Drop the junction table if it exists
      const junctionTableExists =
        await queryInterface.describeTable('EventSessionCours');
      if (junctionTableExists) {
        await queryInterface.dropTable('EventSessionCours');
        console.log('Successfully dropped EventSessionCours junction table');
      }
    } else {
      console.log('events table does not exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (tableExists) {
      // Remove the new single UUID column
      if (tableExists.id_cible_cours) {
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_cours',
        );
        console.log(
          'Successfully removed id_cible_cours UUID column from events table',
        );
      }

      // Add back the old array column
      await queryInterface.addColumn('___tbl_tantor_events', 'id_cible_cours', {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true,
      });
      console.log(
        'Successfully added back id_cible_cours array column to events table',
      );

      // Recreate the junction table
      await queryInterface.createTable('EventSessionCours', {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        eventId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_events',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        coursId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_sessioncours',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
      console.log('Successfully recreated EventSessionCours junction table');
    } else {
      console.log('events table does not exist');
    }
  },
};
