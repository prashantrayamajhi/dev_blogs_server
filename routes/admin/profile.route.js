const router = require("express").Router();
const controller = require("../../controllers/user/profile.controller");
const passport = require("passport");

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  controller.getProfile
);

router.post(
  "/profile/complete",
  passport.authenticate("jwt", { session: false }),
  controller.completeProfile
);

router.patch(
  "/profile/details",
  passport.authenticate("jwt", { session: false }),
  controller.updateDetails
);

router.patch(
  "/profile/personal",
  passport.authenticate("jwt", { session: false }),
  controller.updatePersonalInformation
);

router.patch(
  "/profile/topics",
  passport.authenticate("jwt", { session: false }),
  controller.updateTopics
);

router.patch(
  "/profile/topic/:id",
  passport.authenticate("jwt", { session: false }),
  controller.addTopic
);

router.patch(
  "/profile/password",
  passport.authenticate("jwt", { session: false }),
  controller.updatePassword
);

module.exports = router;
