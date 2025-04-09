'use strict';
module.exports = (sequelize, DataTypes) => {
  const refferal = sequelize.define('refferal', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    reference_id: DataTypes.BIGINT,
    refered_id: DataTypes.BIGINT,
    amount: DataTypes.DECIMAL(20,9),
    state: DataTypes.INTEGER,
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
    refferal.belongsTo(models.user, {foreignKey: 'user_id', onDelete: 'cascade'})
  };
  return refferal;
};