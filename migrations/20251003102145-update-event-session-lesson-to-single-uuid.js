'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the events table exists
    const tableExists = await queryInterface.describeTable(
      '___tbl_tantor_events',
    );

    if (tableExists) {
      // Update id_cible_session from array to single UUID
      if (tableExists.id_cible_session) {
        // Remove the old array column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_session',
        );
        console.log(
          'Successfully removed old id_cible_session array column from events table',
        );
      }

      // Add the new single UUID column for session
      await queryInterface.addColumn(
        '___tbl_tantor_events',
        'id_cible_session',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: '___tbl_tantor_trainingssession',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
      );
      console.log(
        'Successfully added new id_cible_session UUID column to events table',
      );

      // Update id_cible_lesson from array to single UUID
      if (tableExists.id_cible_lesson) {
        // Remove the old array column
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
        );
        console.log(
          'Successfully removed old id_cible_lesson array column from events table',
        );
      }

      // Add the new single UUID column for lesson
      await queryInterface.addColumn(
        '___tbl_tantor_events',
        'id_cible_lesson',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: '___tbl_tantor_lesson',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
      );
      console.log(
        'Successfully added new id_cible_lesson UUID column to events table',
      );

      // Drop the junction tables if they exist
      const sessionJunctionExists = await queryInterface.describeTable(
        'EventTrainingSession',
      );
      if (sessionJunctionExists) {
        await queryInterface.dropTable('EventTrainingSession');
        console.log('Successfully dropped EventTrainingSession junction table');
      }

      const lessonJunctionExists =
        await queryInterface.describeTable('EventLesson');
      if (lessonJunctionExists) {
        await queryInterface.dropTable('EventLesson');
        console.log('Successfully dropped EventLesson junction table');
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
      // Remove the new single UUID columns
      if (tableExists.id_cible_session) {
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_session',
        );
        console.log(
          'Successfully removed id_cible_session UUID column from events table',
        );
      }

      if (tableExists.id_cible_lesson) {
        await queryInterface.removeColumn(
          '___tbl_tantor_events',
          'id_cible_lesson',
        );
        console.log(
          'Successfully removed id_cible_lesson UUID column from events table',
        );
      }

      // Add back the old array columns
      await queryInterface.addColumn(
        '___tbl_tantor_events',
        'id_cible_session',
        {
          type: Sequelize.ARRAY(Sequelize.UUID),
          allowNull: true,
        },
      );
      console.log(
        'Successfully added back id_cible_session array column to events table',
      );

      await queryInterface.addColumn(
        '___tbl_tantor_events',
        'id_cible_lesson',
        {
          type: Sequelize.ARRAY(Sequelize.UUID),
          allowNull: true,
        },
      );
      console.log(
        'Successfully added back id_cible_lesson array column to events table',
      );

      // Recreate the junction tables
      await queryInterface.createTable('EventTrainingSession', {
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
        sessionId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_trainingssession',
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
      console.log('Successfully recreated EventTrainingSession junction table');

      await queryInterface.createTable('EventLesson', {
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
        lessonId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: '___tbl_tantor_lesson',
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
      console.log('Successfully recreated EventLesson junction table');
    } else {
      console.log('events table does not exist');
    }
  },
};
