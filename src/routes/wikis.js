const express = require("express");
const router = express.Router();

const wikiController = require("../controllers/wikiController");
const validation = require("./validation");
const helper = require("../auth/helpers");

router.get("/wikis", helper.ensureAuthenticated, wikiController.index);
router.get("/wikis/private", wikiController.private);
router.get("/wikis/collaborations", wikiController.collaborations);
router.get("/wikis/new", helper.ensureAuthenticated, wikiController.new);
router.post("/wikis/create",
  helper.ensureAuthenticated,
  validation.validateWikis,
  wikiController.create);
router.get("/wikis/:id", helper.ensureAuthenticated, wikiController.show);
router.post("/wikis/:id/destroy", helper.ensureAuthenticated, wikiController.destroy);
router.get("/wikis/:id/edit", helper.ensureAuthenticated, wikiController.edit);
router.post("/wikis/:id/update", helper.ensureAuthenticated, validation.validateWikis, wikiController.update);

module.exports = router;
