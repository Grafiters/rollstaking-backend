'use strict';
module.exports = (sequelize, DataTypes) => {
  const config = sequelize.define('config', {
    name: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    underscored: true,
    modelName: 'config',
    tableName: 'configs',
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  });
  config.associate = function(models) {
    // associations can be defined here
  };
  return config;
};