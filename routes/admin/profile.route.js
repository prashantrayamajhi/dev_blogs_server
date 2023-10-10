const router = require("express").Router();
const controller = require("../../controllers/user/profile.controller");
const passport = require("passport");
const { isUser } = require("../../middlewares/role");

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.getProfile
);

router.post(
  "/profile/complete",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.completeProfile
);

router.patch(
  "/profile/details",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.updateDetails
);

router.patch(
  "/profile/personal",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.updatePersonalInformation
);

router.patch(
  "/profile/topics",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.updateTopics
);

router.patch(
  "/profile/topic/:id",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.addTopic
);

router.patch(
  "/profile/password",
  passport.authenticate("jwt", { session: false }),
  isUser,
  controller.updatePassword
);

module.exports = router;
