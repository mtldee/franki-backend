'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Activities', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = inactivo, 1 = activo
    });

    await queryInterface.addColumn('Activities', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Activities', 'endDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Activities', 'status', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.removeColumn('Activities', 'startDate');
    await queryInterface.removeColumn('Activities', 'endDate');
  }
};

