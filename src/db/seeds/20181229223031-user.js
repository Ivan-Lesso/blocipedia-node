'use strict';
//#1
const faker = require("faker");
const bcrypt = require("bcryptjs");

//#2
let users = [];

for(let i = 1 ; i <= 15 ; i++){
  let salt = bcrypt.genSaltSync();
  let hashedPassword = bcrypt.hashSync(faker.hacker.phrase(), salt);
  users.push({
    email: 'test'+i+'@testmail.com',
    password: hashedPassword,
    role: 0,
    confirmationCode: faker.hacker.phrase(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete("Users", null, {});
  }
};
