'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      '___tbl_tantor_student_evaluations',
      'studentId',
      {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of student IDs who participated in this evaluation',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      '___tbl_tantor_student_evaluations',
      'studentId',
    );
  },
};
