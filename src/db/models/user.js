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
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });
    User.hasMany(models.Payment, {
      foreignKey: "userId",
      as: "payments"
    });
    User.afterCreate((user, callback) => {
      return sendgrid.sendConfirmationEmail(user);
    });
    User.afterUpdate((user, callback) => {
      if(user.isStandard())
      {
        models.Wiki.scope({method: ["privateWikis", user.id]}).all()
        .then((wikis) => {
          wikis.forEach((wiki) => {
            wiki.update({private: false});
          });
        });
      }
    });
  };
  User.prototype.isAdmin = function() {
    return this.role == 2;
  };
  User.prototype.isPremium = function() {
    return this.role == 1;
  };
  User.prototype.isStandard = function() {
    return this.role == 0;
  };
  User.prototype.isOwner = function(wiki) {
    return this.id === wiki.userId;
  };
  return User;
};
