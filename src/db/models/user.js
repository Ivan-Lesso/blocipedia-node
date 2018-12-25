'use strict';
const sendgrid = require('../../sendgrid/helpers');

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: "must be a valid email" }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    confirmationCode: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.afterCreate((user, callback) => {
      return sendgrid.sendConfirmationEmail(user);
    });
  };
  return User;
};
