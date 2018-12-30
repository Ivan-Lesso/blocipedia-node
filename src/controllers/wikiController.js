const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");

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
  new(req, res, next){
    const authorized = req.user?new Authorizer(req.user).new():false;

    if(authorized) {
      res.render("wikis/new");
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
          res.redirect(500, "/wikis/new");
        } else {
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    }
    else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },
  show(req, res, next)  {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        res.render("wikis/show", {wiki});
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
      const authorized = new Authorizer(req.user, wiki).edit();
      if(authorized) {
        if(err || wiki == null){
          res.redirect(404, "/");
        } else {
          res.render("wikis/edit", {wiki});
        }
      }
      else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  },
  update(req, res, next){
     wikiQueries.updateWiki(req, req.body, (err, wiki) => {
       if(err || wiki == null){
         res.redirect(404, `/wikis/${req.params.id}/edit`);
       } else {
         req.flash("notice", "Wiki was updated.");
         res.redirect(`/wikis/${req.params.id}`);
       }
     });
   }
}
