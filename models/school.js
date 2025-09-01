'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class School extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      School.hasMany(models.User, { foreignKey: 'schoolId', as: 'teachers', scope: { role: 1 } }); // profesores
      School.hasMany(models.Course, { foreignKey: 'schoolId', as: 'courses' });
    }
  }
  School.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'School',
  });
  return School;
};