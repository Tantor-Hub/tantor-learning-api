'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, add a temporary column
    await queryInterface.addColumn(
      '___tbl_tantor_surveyquestions',
      'questions_temp',
      {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    );

    // Copy and convert data from old column to new column
    await queryInterface.sequelize.query(`
      UPDATE "___tbl_tantor_surveyquestions" 
      SET "questions_temp" = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', 'q' || ordinality,
            'type', 'text',
            'question', value,
            'required', true,
            'order', ordinality
          )
        )
        FROM unnest("questions") WITH ORDINALITY AS t(value, ordinality)
      )
      WHERE "questions" IS NOT NULL;
    `);

    // Drop the old column
    await queryInterface.removeColumn(
      '___tbl_tantor_surveyquestions',
      'questions',
    );

    // Rename the temporary column
    await queryInterface.renameColumn(
      '___tbl_tantor_surveyquestions',
      'questions_temp',
      'questions',
    );

    // Set the column as NOT NULL
    await queryInterface.changeColumn(
      '___tbl_tantor_surveyquestions',
      'questions',
      {
        type: Sequelize.JSONB,
        allowNull: false,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Change the column type back to string array
    await queryInterface.changeColumn(
      '___tbl_tantor_surveyquestions',
      'questions',
      {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
    );
  },
};
