'use strict';
module.exports = (sequelize, DataTypes) => {
  const stake = sequelize.define('stake', {
    user_address: DataTypes.STRING,
    unix_timestamp: DataTypes.INTEGER,
    staked_amount: DataTypes.DECIMAL(20,9),
    state: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {});
  stake.associate = function(models) {
    // associations can be defined here
    stake.belongsTo(models.user, { foreignKey: 'user_address' })
  };
  return stake;
};