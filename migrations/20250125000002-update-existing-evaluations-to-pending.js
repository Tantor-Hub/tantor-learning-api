'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Updating existing student evaluations to pending status...');

    try {
      // First, let's check what values exist in the markingStatus column
      const [results] = await queryInterface.sequelize.query(`
        SELECT DISTINCT "markingStatus" FROM ___tbl_tantor_student_evaluations;
      `);

      console.log('Current markingStatus values:', results);

      // Update all existing student evaluations to have markingStatus = 'pending'
      // Handle both NULL and any invalid values
      const [updateResult] = await queryInterface.sequelize.query(`
        UPDATE ___tbl_tantor_student_evaluations 
        SET "markingStatus" = 'pending' 
        WHERE "markingStatus" IS NULL 
           OR "markingStatus" NOT IN ('pending', 'in_progress', 'completed', 'published');
      `);

      console.log('Updated rows:', updateResult);
      console.log(
        'Existing student evaluations updated to pending status successfully',
      );
    } catch (error) {
      console.error('Error updating marking status:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('Rolling back marking status updates...');

    // This rollback doesn't make sense as we can't determine the original values
    // So we'll just log that the rollback is not possible
    console.log(
      'Cannot rollback marking status updates - original values unknown',
    );
  },
};
