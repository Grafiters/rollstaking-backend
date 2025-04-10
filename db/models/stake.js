'use strict';
module.exports = (sequelize, DataTypes) => {
  const stake = sequelize.define('stake', {
    signature: DataTypes.STRING({ unique: true }),
    user_address: DataTypes.STRING,
    unix_timestamp: DataTypes.BIGINT,
    staked_amount: DataTypes.DECIMAL(20,9),
    claimed: DataTypes.DECIMAL(20,9),
    epoach: DataTypes.INTEGER,
    epoach_start_time: DataTypes.BIGINT,
    state: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    underscored: true,
    modelName: 'stake',
    tableName: 'stakes'
  });
  stake.associate = function(models) {
    // associations can be defined here
    stake.belongsTo(models.user, { foreignKey: 'user_address' })
    stake.hasMany(models.refferal, {foreignKey: 'stake_id', sourceKey: 'id', as: 'refferals'})
  };
  return stake;
};