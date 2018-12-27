'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "Users",
      "confirmationCode",
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    );
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn("Users", "confirmationCode");
  }
};
