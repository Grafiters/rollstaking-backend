'use strict';
const { faker } = require('@faker-js/faker');

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

      const users = [];
      const parentUsers = [];
  
      // Buat 5 user tanpa parent_id
      for (let i = 0; i < 10; i++) {
        const user = {
          address: faker.finance.ethereumAddress(),
          uid: faker.string.uuid(),
          parent_id: null,
          claim_reff_reward: faker.finance.amount(0, 1000, 9),
          created_at: new Date(),
          updated_at: new Date()
        };
        users.push(user);
        parentUsers.push(user);
      }

      for (let i = 0; i < 100; i++) {
        const parent = Math.floor(Math.random() * 10) + 1;
        users.push({
          address: faker.finance.ethereumAddress(),
          uid: faker.string.uuid(),
          parent_id: parent,
          claim_reff_reward: faker.finance.amount(0, 500, 9),
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      for (let i = 0; i < 20; i++) {
        const parent = Math.floor(Math.random() * 100) + 1;
        users.push({
          address: faker.finance.ethereumAddress(),
          uid: faker.string.uuid(),
          parent_id: parent,
          claim_reff_reward: faker.finance.amount(0, 500, 9),
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      for (let i = 0; i < 20; i++) {
        const parent = Math.floor(Math.random() * 25) + 1;
        users.push({
          address: faker.finance.ethereumAddress(),
          uid: faker.string.uuid(),
          parent_id: parent,
          claim_reff_reward: faker.finance.amount(0, 500, 9),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
  
      return queryInterface.bulkInsert('users', users, {});
   
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
      return queryInterface.bulkDelete('users', null, {});
  }

};
