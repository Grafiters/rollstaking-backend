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
      refence_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      refered_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      amount: {
        type: Sequelize.DECIMAL(20,9)
      },
      state: {
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('refferals');
  }
};