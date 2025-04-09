'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    address: DataTypes.STRING,
    uid: DataTypes.STRING,
    parent_id: DataTypes.INTEGER({default: null}),
    claim_reff_reward: DataTypes.DECIMAL(20, 9),
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    underscored: true,
    modelName: 'user',
    tableName: 'users'
  });
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.refferal, {
      foreignKey: 'reference',
      sourceKey: 'address',
      as: 'refferals'
    });
    User.hasMany(models.stake, { 
      foreignKey: 'user_address',
      sourceKey: 'address',
      as: 'stakes' });
  };
  return User;
};