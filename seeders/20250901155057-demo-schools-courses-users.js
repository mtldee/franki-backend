'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const schools = await queryInterface.bulkInsert(
      'Schools',
      [
        { name: 'Colegio Alfa', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Colegio Beta', createdAt: new Date(), updatedAt: new Date() },
      ],
      { returning: true }
    );

    const schoolRecords = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Schools";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const alfaId = schoolRecords.find(s => s.name === 'Colegio Alfa').id;
    const betaId = schoolRecords.find(s => s.name === 'Colegio Beta').id;

    const teachers = await queryInterface.bulkInsert(
      'Users',
      [
        {
          username: 'profesor1',
          password: hashedPassword,
          role: 1,
          schoolId: alfaId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'profesor2',
          password: hashedPassword,
          role: 1,
          schoolId: betaId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    const teacherRecords = await queryInterface.sequelize.query(
      'SELECT id, username FROM "Users" WHERE role = 1;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const teacher1Id = teacherRecords.find(t => t.username === 'profesor1').id;
    const teacher2Id = teacherRecords.find(t => t.username === 'profesor2').id;

    await queryInterface.bulkInsert('Courses', [
      {
        name: 'Curso 7A',
        grade: 7,
        letter: 'A',
        schoolId: alfaId,
        teacherId: teacher1Id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Curso 8B',
        grade: 8,
        letter: 'B',
        schoolId: betaId,
        teacherId: teacher2Id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const courses = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Courses";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const curso7AId = courses.find(c => c.name === 'Curso 7A').id;
    const curso8BId = courses.find(c => c.name === 'Curso 8B').id;

    await queryInterface.bulkInsert('Users', [
      {
        username: '257A01',
        password: hashedPassword,
        role: 0,
        courseId: curso7AId,
        grade: 7,
        letter: 'A',
        year: 2025,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: '25PRF1',
        password: hashedPassword,
        role: 0,
        courseId: curso8BId,
        grade: 8,
        letter: 'B',
        year: 2025,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Courses', null, {});
    await queryInterface.bulkDelete('Schools', null, {});
  }
};

