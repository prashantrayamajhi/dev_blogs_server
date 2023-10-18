const router = require("express").Router();
const controller = require("../../controllers/admin/profile.controller");
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.getProfile
);

router.patch(
  "/profile/password",
  passport.authenticate("jwt", { session: false }),
  controller.updatePassword
);

module.exports = router;
