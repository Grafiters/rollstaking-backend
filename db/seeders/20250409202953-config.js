'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const levels = [
      { name: 'Level 1', value: 10.0 },
      { name: 'Level 2', value: 5.0 },
      { name: 'Level 3', value: 3.0 },
      { name: 'Level 4', value: 2.0 },
      { name: 'Level 5', value: 1.0 },
      { name: 'Level 6', value: 0.8 },
      { name: 'Level 7', value: 0.5 },
      { name: 'Level 8', value: 0.3 },
      { name: 'Level 9', value: 0.2 },
      { name: 'Level 10', value: 0.2 },
    ];

    const now = new Date();
    const data = levels.map(item => ({
      ...item,
      created_at: now,
      updated_at: now,
    }));

    console.log(data);
    
    return queryInterface.bulkInsert('configs', data, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
      return queryInterface.bulkDelete('configs', null, {});
  }
};
