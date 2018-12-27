const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Authorizer = require("../policies/wiki");

module.exports = {
  //#1
  getAllPublicWikis(callback) {
    return Wiki.findAll({where: {private: false}})

  //#2
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    })
  },
  addWiki(newWiki, callback){
    return Wiki.create(newWiki)
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },
  deleteWiki(req, callback){
    return Wiki.findById(req.params.id)
    .then((wiki) => {

      const authorized = req.user?new Authorizer(req.user, wiki).destroy():false;

      if(authorized) {
        wiki.destroy()
        .then((res) => {
          callback(null, wiki);
        });

      } else {
        req.flash("notice", "You are not authorized to do that.")
        callback(401);
      }
    });
  },
  updateWiki(req, updatedWiki, callback){
    return Wiki.findById(req.params.id)
    .then((wiki) => {
      if(!wiki){
        return callback("Wiki not found");
      }
      const authorized = req.user?new Authorizer(req.user, wiki).update():false;
      if(authorized) {
        wiki.update(updatedWiki, {
          fields: Object.keys(updatedWiki)
        })
        .then(() => {
          callback(null, wiki);
        })
        .catch((err) => {
          callback(err);
        });
      }
      else {
        req.flash("notice", "You are not authorized to do that.");
        callback("Forbidden");
      }
    });
  },
  getWiki(id, callback){
    return Wiki.findById(id, {
      include: [
        {model: User}
      ]
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  }
}
