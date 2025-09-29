'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Profesores
      User.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' }); 
      User.hasMany(models.Course, { foreignKey: 'teacherId', as: 'courses' }); 

      // Alumnos
      User.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' }); 
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.INTEGER,
    letter: DataTypes.STRING,
    grade: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    listNumber: DataTypes.INTEGER,
    schoolId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};