'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' });
      Course.belongsTo(models.User, { foreignKey: 'teacherId', as: 'teacher' }); // profesor del curso
      Course.hasMany(models.User, { foreignKey: 'courseId', as: 'students', scope: { role: 0 } }); // alumnos
    }
  }
  Course.init({
    name: DataTypes.STRING,
    grade: DataTypes.INTEGER,
    letter: DataTypes.STRING,
    schoolId: DataTypes.INTEGER,
    teacherId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};