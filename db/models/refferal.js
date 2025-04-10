'use strict';
module.exports = (sequelize, DataTypes) => {
  const refferal = sequelize.define('refferal', {
    stake_id: DataTypes.INTEGER({ unique: true }),
    user_address: DataTypes.STRING,
    reference: DataTypes.STRING,
    amount: DataTypes.DECIMAL(20,9),
    state: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    underscored: true,
    modelName: 'refferal',
    tableName: 'refferals'
  });
  refferal.associate = function(models) {
    // associations can be defined here
    refferal.belongsTo(models.user, {primaryKey: 'address', foreignKey: 'reference', onDelete: 'cascade'})
    refferal.belongsTo(models.stake, { primaryKey: 'id', foreignKey: 'stake_id', onDelete: 'cascade' })
  };
  return refferal;
};