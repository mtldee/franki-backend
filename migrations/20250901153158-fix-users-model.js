'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'school', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'grade', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'year', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'role_temp', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET "role_temp" = CASE 
        WHEN role = 'student' THEN 0
        WHEN role = 'teacher' THEN 1
        WHEN role = 'admin' THEN 2
        ELSE 0
      END
    `);

    await queryInterface.removeColumn('Users', 'role');

    await queryInterface.renameColumn('Users', 'role_temp', 'role');
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('Users', 'school');

    await queryInterface.changeColumn('Users', 'grade', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'year', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'role_temp', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'student',
    });

    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET "role_temp" = CASE
        WHEN role = 0 THEN 'student'
        WHEN role = 1 THEN 'teacher'
        WHEN role = 2 THEN 'admin'
        ELSE 'student'
      END
    `);

    await queryInterface.removeColumn('Users', 'role');

    await queryInterface.renameColumn('Users', 'role_temp', 'role');
  }
};

