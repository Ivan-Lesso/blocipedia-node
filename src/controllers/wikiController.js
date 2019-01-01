const wikiQueries = require("../db/queries.wikis.js");
const userQueries = require("../db/queries.users.js");
const collaboratorQueries = require("../db/queries.collaborators.js");
const Authorizer = require("../policies/wiki");
const markdown = require( "markdown" ).markdown;

module.exports = {
  index(req, res, next) {
     wikiQueries.getAllPublicWikis((err, wikis) => {
       if(err) {
         res.redirect(500, "static/index");
       } else {
         res.render("wikis/index", {title: "Public Wikis", wikis: wikis});
       }
     })
  },
  private(req, res, next) {
     wikiQueries.getAllPrivateWikis(req, (err, wikis) => {
       if(err) {
         res.render("static/index");
       } else {
         res.render("wikis/private", {title: "Private Wikis", wikis: wikis});
       }
     })
  },
  collaborations(req, res, next) {
     wikiQueries.getAllCollaborations(req, (err, wikis) => {
       if(err) {
         req.flash("error",err);
         res.render("static/index");
       } else {
         res.render("wikis/collaborations", {title: "Collaborations", wikis: wikis});
       }
     })
  },
  new(req, res, next){
    const authorized = req.user?new Authorizer(req.user).new():false;

    if(authorized) {
      userQueries.getUsers((err, users) => {
        if(err) {
          req.flash("error", "Something went wrong. Check the logs.");
          res.redirect(500,"/wikis");
        }
        else {
          let allCollaborators = [];
          users.forEach((user) => {
            allCollaborators.push({id: user.id, email: user.email, collaborator: false});
          });
          res.render("wikis/new", {allCollaborators});
        }
      })
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }

  },
  create(req, res, next) {
    let authorized;
    if(!req.body.private) authorized = req.user?new Authorizer(req.user).create():false;
    else authorized = req.user?new Authorizer(req.user).createPrivate():false;
    if(authorized) {
      let newWiki= {
        title: req.body.title,
        body: req.body.body,
        private: req.body.private,
        userId: req.user.id
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if(err){
          console.log(err);
          res.redirect(500, "/wikis/new");
        } else {
          let errors = false;
          if(req.body.collaborators && req.body.collaborators.length>0)
          {
            req.body.collaborators.forEach((collaborator) => {
              collaboratorQueries.addCollaborator(req, collaborator, (err, collab) => {
                if(err) errors = true;
              })
            })
          }
          if(!errors) res.redirect(303, `/wikis/${wiki.id}`);
          else res.redirect(500, "/wikis/new");
        }
      });
    }
    else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },
  show(req, res, next)  {
    wikiQueries.getWiki(parseInt(req.params.id), (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        let collaborators = [];
        wiki.collaborators.forEach((collaborator) => {
          collaborators.push(collaborator.userId);
        })
        let authorized = req.user?new Authorizer(req.user, wiki, collaborators).show():false;

        if(authorized) {
          wiki.body = markdown.toHTML(wiki.body);
          res.render("wikis/show", {wiki});
        }
        else {
          req.flash("notice", "You are not authorized to do that.");
          res.redirect("/wikis");
        }
      }
    });
  },
  destroy(req, res, next){
    wikiQueries.deleteWiki(req, (err, deletedRecordsCount) => {
      if(err){
        res.redirect(500, `/wikis/${req.params.id}`)
      } else {
        res.redirect(303, `/wikis`)
      }
    });
  },
  edit(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      let wikiCollaborators = [];
      wiki.collaborators.forEach((collaborator) => {
        wikiCollaborators.push(collaborator.userId);
      })
      let authorized = req.user?new Authorizer(req.user, wiki, wikiCollaborators).show():false;

      if(authorized) {
        if(err || wiki == null){
          res.redirect(404, "/");
        }
        else
        {
          userQueries.getUsers((err, users) => {
            if(err) {
              req.flash("error", "Something went wrong. Check the logs.");
              res.redirect(500,"/wikis");
            }
            else {
              let allCollaborators = [];
              users.forEach((user) => {
                let isCollaborator = false;
                allCollaborators.push({id: user.id, email: user.email, collaborator: isCollaborator});
              });
              allCollaborators.forEach((collab) => {
                if(wikiCollaborators.includes(collab.id)) {
                  collab.collaborator=true;
                }
              })
              res.render("wikis/edit", {wiki, allCollaborators});
            }
          });
        }
      }
      else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  },
  update(req, res, next) {
    let wikiCollaborators = req.body.collaborators;
     wikiQueries.updateWiki(req, req.body, (err, wiki) => {
       if(err || wiki == null){
         res.redirect(404, `/wikis/${req.params.id}/edit`);
       } else {
         let errors = false;
         collaboratorQueries.deleteAll(req, (err, updatedWiki) => {
           if(err || updatedWiki == null) {
             res.redirect(404, `/wikis/${req.params.id}/edit`);
           }
           else
           {
             if(wikiCollaborators.length>0)
             {
               wikiCollaborators.forEach((collaborator) => {
                 collaboratorQueries.addCollaborator(req, collaborator, (err, collab) => {
                   if(err) {
                     errors = true;
                   }
                 })
               })
             }
           }
         })
         if(!errors) {
           req.flash("notice", "Wiki was updated.");
           res.redirect(`/wikis/${req.params.id}`);
         }
       }
     });
   }
}
