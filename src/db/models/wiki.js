'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wiki = sequelize.define('Wiki', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {});
  Wiki.associate = function(models) {
    // associations can be defined here
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
    Wiki.hasMany(models.Collaborator, {
      foreignKey: "wikiId",
      as: "collaborators"
    });
    Wiki.addScope("privateWikis", (userId) => {
      return {
        where: { userId: userId, private: true }
      }
    });
    Wiki.addScope("collaborations", (userId) => {
      return {
        include: [
          {model: models.Collaborator,
            as: "collaborators",
            required: true,
            where: { userId: userId }
          }
        ]
      }
    });
  };
  return Wiki;
};
