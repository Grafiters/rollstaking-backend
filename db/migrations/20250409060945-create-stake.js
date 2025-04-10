'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('stakes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      unix_timestamp: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      staked_amount: {
        defaultValue: 0.0,
        type: Sequelize.DECIMAL(20,9)
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('stakes');
  }
};