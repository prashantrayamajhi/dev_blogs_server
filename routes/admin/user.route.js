const router = require("express").Router();
const controller = require("./../../controllers/admin/user.controller");
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.getUsers
);

module.exports = router;
