'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Convert payementmethode table primary key from INTEGER to UUID
    const payementTableExists = await queryInterface.describeTable(
      '___tbl_tantor_payementmethode',
    );

    if (payementTableExists) {
      // Check if id column is INTEGER and needs conversion
      if (payementTableExists.id && payementTableExists.id.type === 'integer') {
        // First, drop the primary key constraint
        await queryInterface.removeConstraint(
          '___tbl_tantor_payementmethode',
          '___tbl_tantor_payementmethode_pkey',
        );

        // Add a new UUID column
        await queryInterface.addColumn(
          '___tbl_tantor_payementmethode',
          'new_id',
          {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4,
          },
        );

        // Update the new_id column with UUIDs for existing records
        await queryInterface.sequelize.query(`
          UPDATE "___tbl_tantor_payementmethode" 
          SET "new_id" = gen_random_uuid()
        `);

        // Drop the old id column
        await queryInterface.removeColumn(
          '___tbl_tantor_payementmethode',
          'id',
        );

        // Rename new_id to id
        await queryInterface.renameColumn(
          '___tbl_tantor_payementmethode',
          'new_id',
          'id',
        );

        // Add primary key constraint back
        await queryInterface.addConstraint('___tbl_tantor_payementmethode', {
          fields: ['id'],
          type: 'primary key',
          name: '___tbl_tantor_payementmethode_pkey',
        });
      }

      // Convert id_session and id_session_student from INTEGER to UUID
      if (
        payementTableExists.id_session &&
        payementTableExists.id_session.type === 'integer'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_payementmethode',
          'id_session',
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
        );
      }

      if (
        payementTableExists.id_session_student &&
        payementTableExists.id_session_student.type === 'integer'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_payementmethode',
          'id_session_student',
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
        );
      }
    }

    // Convert opcopayement table foreign keys from INTEGER to UUID
    const opcoTableExists = await queryInterface.describeTable(
      '___tbl_tantor_opcopayement',
    );

    if (opcoTableExists) {
      if (
        opcoTableExists.id_session &&
        opcoTableExists.id_session.type === 'integer'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_opcopayement',
          'id_session',
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
        );
      }

      if (
        opcoTableExists.id_session_student &&
        opcoTableExists.id_session_student.type === 'integer'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_opcopayement',
          'id_session_student',
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    const payementTableExists = await queryInterface.describeTable(
      '___tbl_tantor_payementmethode',
    );

    if (payementTableExists) {
      // Revert id column from UUID to INTEGER
      if (payementTableExists.id && payementTableExists.id.type === 'uuid') {
        await queryInterface.removeConstraint(
          '___tbl_tantor_payementmethode',
          '___tbl_tantor_payementmethode_pkey',
        );

        await queryInterface.addColumn(
          '___tbl_tantor_payementmethode',
          'new_id',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
          },
        );

        await queryInterface.removeColumn(
          '___tbl_tantor_payementmethode',
          'id',
        );
        await queryInterface.renameColumn(
          '___tbl_tantor_payementmethode',
          'new_id',
          'id',
        );

        await queryInterface.addConstraint('___tbl_tantor_payementmethode', {
          fields: ['id'],
          type: 'primary key',
          name: '___tbl_tantor_payementmethode_pkey',
        });
      }

      // Revert foreign keys from UUID to INTEGER
      if (
        payementTableExists.id_session &&
        payementTableExists.id_session.type === 'uuid'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_payementmethode',
          'id_session',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
        );
      }

      if (
        payementTableExists.id_session_student &&
        payementTableExists.id_session_student.type === 'uuid'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_payementmethode',
          'id_session_student',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
        );
      }
    }

    const opcoTableExists = await queryInterface.describeTable(
      '___tbl_tantor_opcopayement',
    );

    if (opcoTableExists) {
      if (
        opcoTableExists.id_session &&
        opcoTableExists.id_session.type === 'uuid'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_opcopayement',
          'id_session',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
        );
      }

      if (
        opcoTableExists.id_session_student &&
        opcoTableExists.id_session_student.type === 'uuid'
      ) {
        await queryInterface.changeColumn(
          '___tbl_tantor_opcopayement',
          'id_session_student',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
        );
      }
    }
  },
};
