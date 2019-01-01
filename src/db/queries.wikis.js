const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Collaborator = require("./models").Collaborator;
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
  getAllPrivateWikis(req, callback) {
    let where = null;
    if(req.user.isAdmin()) where = {where: {private: true}};
    else if(req.user.isPremium()) where = {where: {private: true, userId: req.user.id}}

    if(where !== null) {
      return Wiki.findAll(where)
      .then((wikis) => {
        callback(null, wikis);
      })
      .catch((err) => {
        callback(err);
      })
    }
    else {
      req.flash("notice", "You are not authorized to do that.");
      callback(401);
    }
  },
  getAllCollaborations(req, callback) {
    Wiki.scope({method: ["collaborations", req.user.id]}).all()
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    });
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
    return Wiki.findById(req.params.id, {
      include: [
        {model: Collaborator, as: "collaborators"}
      ]
    })
    .then((wiki) => {
      if(!wiki){
        return callback("Wiki not found");
      }
      let wikiCollaborators = [];
      wiki.collaborators.forEach((collaborator) => {
        wikiCollaborators.push(collaborator.userId);
      })
      const authorized = req.user?new Authorizer(req.user, wiki, wikiCollaborators).update():false;
      if(authorized) {
<<<<<<< HEAD
        updatedWiki.private = updatedWiki.private?true:false;
        wiki.update(updatedWiki, {
          fields: Object.keys(updatedWiki)
=======
        let adjustedWiki = updatedWiki;
        adjustedWiki.private = updatedWiki.private?true:false;
        delete adjustedWiki.collaborators;

        wiki.update(adjustedWiki, {
          fields: Object.keys(adjustedWiki)
>>>>>>> collab
        })
        .then(() => {
          callback(null, wiki);
        })
        .catch((err) => {
          console.log(err);
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
        {model: Collaborator, as: "collaborators"}
      ]
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
      console.log(err);
    })
  }
}
