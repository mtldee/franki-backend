"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("Users", [
      {
        username: "257A01",
        password: hashedPassword,
        role: "student",
        letter: "A",
        grade: "7",
        year: 2025,
        listNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // Probablemente haya que hacer otra bbdd para profes porque tienen cursos asignados
        username: "25PRF1",
        password: hashedPassword,
        role: "teacher",
        letter: null,
        grade: null,
        year: null,
        listNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
