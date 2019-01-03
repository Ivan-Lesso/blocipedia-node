const userQueries = require("../db/queries.users.js");
const paymentQueries = require("../db/queries.payments.js");
const passport = require("passport");
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const stripe = require("stripe")(keySecret);

module.exports = {
  signUp(req, res, next){
    res.render("users/sign_up");
  },
  create(req, res, next){

     let newUser = {
       email: req.body.email,
       password: req.body.password,
       passwordConfirmation: req.body.passwordConfirmation
     };

     userQueries.createUser(newUser, (err, user) => {
       if(err){
         console.log(err);
         req.flash("error", err);
         res.redirect("/users/sign_up");
       } else {

         passport.authenticate("local")(req, res, () => {
           req.flash("notice", "You've successfully signed in!");
           res.redirect("/");
         })
       }
     });
  },
  signInForm(req, res, next){
    res.render("users/sign_in");
  },
  upgradeForm(req, res, next){
    res.render("users/upgrade");
  },
  upgrade(req, res, next){
    let amount = process.env.AMOUNT;

    const token = req.body.stripeToken; // Using Express

    stripe.charges.create({
      amount: amount,
      currency: 'usd',
      description: 'Blocipedia Upgrade',
      source: token,
    })
    .then(charge => {
      let newPayment= {
        userId: req.user.id,
        payment_token: token
      };
      paymentQueries.addPayment(newPayment, (err, payment) => {
        if(err){
          console.log(err);
          res.redirect(500, "/users/upgrade");
        } else {
          userQueries.changeRole(req.user, 1, (err, user) => {
            if(err){
              req.flash("error", err);
              res.redirect(500, "/users/upgrade");
            } else {
              req.flash("notice", "Your account has been successfully upgraded.");
              res.redirect(303, "/users/upgrade");
            }
          });
        }
      });
    })
    .catch(err => {
      req.flash("error", err);
      console.log("Error:", err);
      res.redirect(500, "/users/upgrade");
    });
  },
  downgrade(req, res, next){
    paymentQueries.getLatestPayment(req.user.id, (err, payment) => {
      if(err){
        console.log(err);
        res.redirect(500, "/users/upgrade");
      } else {
        stripe.refunds.create({
          charge: payment.payment_token
        })
        .then(charge => {
          userQueries.changeRole(req.user, 0, (err, user) => {
            if(err){
              req.flash("error", err);
              res.redirect(500, "/users/upgrade");
            } else {
              req.flash("notice", "Your account has been successfully downgraded.");
              res.redirect(303, "/users/upgrade");
            }
          });
        })
        .catch(err => {
          req.flash("error", err);
          console.log("Error:", err);
          res.redirect(500, "/users/upgrade");
        });
      }
    })

  },
  signIn(req, res, next){
    passport.authenticate("local")(req, res, function () {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.")
        res.redirect("/users/sign_in");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },
  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  }
}
