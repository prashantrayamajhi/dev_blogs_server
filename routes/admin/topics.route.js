const router = require("express").Router();
const controller = require("./../../controllers/admin/topic.controller");
const passport = require("passport");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.postTopic
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.updateTopic
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.deleteTopic
);

module.exports = router;
