'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'schoolId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'courseId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Courses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'schoolId');
    await queryInterface.removeColumn('Users', 'courseId');
  }
};
