'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('refferals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_address: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      reference: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.DECIMAL(20,9)
      },
      state: {
        defaultValue: 0,
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('refferals');
  }
};