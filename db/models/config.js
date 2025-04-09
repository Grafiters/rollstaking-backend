'use strict';
module.exports = (sequelize, DataTypes) => {
  const config = sequelize.define('config', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    underscored: true,
    modelName: 'config',
    tableName: 'configs'
  });
  config.associate = function(models) {
    // associations can be defined here
  };
  return config;
};