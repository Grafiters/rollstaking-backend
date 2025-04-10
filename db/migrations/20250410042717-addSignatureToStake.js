'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await Promise.all([
      queryInterface.addColumn('stakes', 'signature', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      }),
      queryInterface.addColumn('stakes', 'epoach', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('stakes', 'epoach_start_time', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('stakes', 'claimed', {
        type: Sequelize.DECIMAL(20,9),
        defultValue: 0.0
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   await Promise.all([
    queryInterface.removeColumn('stakes', 'signature'),
    queryInterface.removeColumn('stakes', 'epoach'),
    queryInterface.removeColumn('stakes', 'epoach_start_time'),
    queryInterface.removeColumn('stakes', 'claimed')
   ])
  }
};
