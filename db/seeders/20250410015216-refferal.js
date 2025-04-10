'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async(queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

      const now = new Date();
      const states = [0, 3, -1];
  
      // Ambil user yang punya parent_id dan join ke parent untuk dapat address-nya
      const usersWithParents = await queryInterface.sequelize.query(`
        SELECT 
          u.address AS user_address, 
          p.address AS reference
        FROM users u
        JOIN users p ON u.parent_id = p.id
      `, {
        type: Sequelize.QueryTypes.SELECT
      });
  
      if (!usersWithParents.length) {
        throw new Error('Tidak ditemukan user dengan parent_id, seeder tidak bisa dilanjutkan.');
      }
  
      const data = usersWithParents.map((u) => ({
        user_address: u.user_address,
        reference: u.reference,
        amount: faker.finance.amount(0.01, 100.0, 9),
        state: faker.helpers.arrayElement(states),
        created_at: now,
        updated_at: now,
      }));
  
      return queryInterface.bulkInsert('refferals', data, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
      return queryInterface.bulkDelete('refferals', null, {});
  }
};
