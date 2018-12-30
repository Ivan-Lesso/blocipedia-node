const express = require("express");
const router = express.Router();
const validation = require("./validation");
const userController = require("../controllers/userController");
const helper = require("../auth/helpers");

router.get("/users/sign_up", userController.signUp);
router.post("/users", validation.validateUsers, userController.create);
router.get("/users/sign_in", userController.signInForm);
router.get("/users/upgrade", helper.ensureAuthenticated, userController.upgradeForm);
router.post("/users/upgrade", helper.ensureAuthenticated, userController.upgrade);
router.post("/users/downgrade", helper.ensureAuthenticated, userController.downgrade);
router.post("/users/sign_in", validation.validateUsers, userController.signIn);
router.get("/users/sign_out", userController.signOut);

module.exports = router;
