'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('___tbl_tantor_user_roles', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: '___tbl_tantor_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('instructor', 'student', 'admin', 'secretary', 'expulled'),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Add unique constraint for user_id + role combination
    await queryInterface.addIndex('___tbl_tantor_user_roles', {
      fields: ['user_id', 'role'],
      unique: true,
      name: 'unique_user_role'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('___tbl_tantor_user_roles');
  },
};
