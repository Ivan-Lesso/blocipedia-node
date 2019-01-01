const User = require("./models").User;
const Collaborator = require("./models").Collaborator;
const Wiki = require("./models").Wiki;
const Authorizer = require("../policies/wiki");

module.exports = {
  //#1
  getCollaborators(wikiId, callback){
    return Collaborator.findAll({where: {wikiId: wikiId}})
    .then((collaborators) => {
      callback(null, collaborators);
    })
    .catch((err) => {
      callback(err);
    })
  },
  addCollaborator(req, collaborator, callback) {
    return Wiki.findById(req.params.id)
      .then((wiki) => {

      const authorized = req.user?new Authorizer(req.user, wiki).createPrivate():false;

      if(authorized) {
        return Collaborator.create({wikiId: req.params.id, userId: collaborator})
        .then((collaborator) => {
          callback(null, collaborator);
        })
        .catch((err) => {
          callback(err);
        })
      }
      else {
        req.flash("notice", "You are not authorized to do that.")
        callback(401);
      }
    });
  },
  deleteAll(req, callback) {
    return Wiki.findById(req.params.id)
    .then((wiki) => {

      const authorized = req.user?new Authorizer(req.user, wiki).createPrivate():false;

      if(authorized) {
        console.log("DELETE ALL CALLED");
        Collaborator.destroy({where: {wikiId: req.params.id}})
        .then((res) => {
          callback(null, wiki);
        })
        .catch((err) => {
          callback(err);
        });
      } else {
        req.flash("notice", "You are not authorized to do that.")
        callback(401);
      }
    });
  }
}
