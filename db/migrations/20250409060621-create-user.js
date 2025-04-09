'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      uid: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      parent_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      claim_reff_reward: {
        defaultValue: 0,
        type: Sequelize.DECIMAL(20,9)
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
    return queryInterface.dropTable('users');
  }
};