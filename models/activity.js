'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Activity.belongsTo(models.User, { foreignKey: 'userId', as: 'teacher' });
      Activity.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    }
  }
  Activity.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.INTEGER,
    icon: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};