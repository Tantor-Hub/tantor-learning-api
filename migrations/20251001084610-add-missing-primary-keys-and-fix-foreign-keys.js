'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add primary key to optionsquestionnaires table
    const optionsTableExists = await queryInterface.describeTable(
      '___tbl_tantor_optionsquestionnaires',
    );
    if (optionsTableExists && !optionsTableExists.id) {
      await queryInterface.addColumn(
        '___tbl_tantor_optionsquestionnaires',
        'id',
        {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
      );
    }

    // Convert id_question from INTEGER to UUID in optionsquestionnaires
    if (optionsTableExists && optionsTableExists.id_question) {
      if (optionsTableExists.id_question.type === 'integer') {
        await queryInterface.changeColumn(
          '___tbl_tantor_optionsquestionnaires',
          'id_question',
          {
            type: Sequelize.UUID,
            allowNull: false,
          },
        );
      }
    }

    // Add primary key to reclamations_sanctions table
    try {
      const reclamationsTableExists = await queryInterface.describeTable(
        '___tbl_tantor_docsreclamationformations',
      );
      if (reclamationsTableExists && !reclamationsTableExists.id) {
        await queryInterface.addColumn(
          '___tbl_tantor_docsreclamationformations',
          'id',
          {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
        );
      }

      // Convert suivi_id from INTEGER to UUID in docsreclamationformations
      if (reclamationsTableExists && reclamationsTableExists.suivi_id) {
        if (reclamationsTableExists.suivi_id.type === 'integer') {
          await queryInterface.changeColumn(
            '___tbl_tantor_docsreclamationformations',
            'suivi_id',
            {
              type: Sequelize.UUID,
              allowNull: false,
            },
          );
        }
      }
    } catch (error) {
      console.log(
        'Table ___tbl_tantor_docsreclamationformations does not exist, skipping...',
      );
    }

    // Add primary key to newsletter table
    const newsletterTableExists = await queryInterface.describeTable(
      '___tbl_tantor_newsletter',
    );
    if (newsletterTableExists && !newsletterTableExists.id) {
      await queryInterface.addColumn('___tbl_tantor_newsletter', 'id', {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      });
    }

    // Add primary key to contacts table
    const contactsTableExists = await queryInterface.describeTable(
      '___tbl_tantor_contacts',
    );
    if (contactsTableExists && !contactsTableExists.id) {
      await queryInterface.addColumn('___tbl_tantor_contacts', 'id', {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      });
    }

    // Add primary key to appinfos table
    const appinfosTableExists = await queryInterface.describeTable(
      '___tbl_tantor_infos',
    );
    if (appinfosTableExists && !appinfosTableExists.id) {
      await queryInterface.addColumn('___tbl_tantor_infos', 'id', {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove primary keys and revert foreign key changes
    const optionsTableExists = await queryInterface.describeTable(
      '___tbl_tantor_optionsquestionnaires',
    );
    if (optionsTableExists && optionsTableExists.id) {
      await queryInterface.removeColumn(
        '___tbl_tantor_optionsquestionnaires',
        'id',
      );
    }

    if (optionsTableExists && optionsTableExists.id_question) {
      if (optionsTableExists.id_question.type === 'uuid') {
        await queryInterface.changeColumn(
          '___tbl_tantor_optionsquestionnaires',
          'id_question',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
        );
      }
    }

    try {
      const reclamationsTableExists = await queryInterface.describeTable(
        '___tbl_tantor_docsreclamationformations',
      );
      if (reclamationsTableExists && reclamationsTableExists.id) {
        await queryInterface.removeColumn(
          '___tbl_tantor_docsreclamationformations',
          'id',
        );
      }

      if (reclamationsTableExists && reclamationsTableExists.suivi_id) {
        if (reclamationsTableExists.suivi_id.type === 'uuid') {
          await queryInterface.changeColumn(
            '___tbl_tantor_docsreclamationformations',
            'suivi_id',
            {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
          );
        }
      }
    } catch (error) {
      console.log(
        'Table ___tbl_tantor_docsreclamationformations does not exist, skipping rollback...',
      );
    }

    const newsletterTableExists = await queryInterface.describeTable(
      '___tbl_tantor_newsletter',
    );
    if (newsletterTableExists && newsletterTableExists.id) {
      await queryInterface.removeColumn('___tbl_tantor_newsletter', 'id');
    }

    const contactsTableExists = await queryInterface.describeTable(
      '___tbl_tantor_contacts',
    );
    if (contactsTableExists && contactsTableExists.id) {
      await queryInterface.removeColumn('___tbl_tantor_contacts', 'id');
    }

    const appinfosTableExists = await queryInterface.describeTable(
      '___tbl_tantor_infos',
    );
    if (appinfosTableExists && appinfosTableExists.id) {
      await queryInterface.removeColumn('___tbl_tantor_infos', 'id');
    }
  },
};
