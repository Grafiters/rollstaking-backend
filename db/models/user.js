'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    address: DataTypes.STRING,
    uid: DataTypes.STRING,
    claim_reff_reward: DataTypes.DECIMAL(20, 9),
    parent_id: DataTypes.INTEGER({default: null})
  }, {
    sequelize,
    underscored: true,
    modelName: 'user',
    tableName: 'users'
  });
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.refferal, { as: 'refferals' });
    User.hasMany(models.stake, { as: 'stakes' });
  };
  return User;
};