const router = require("express").Router();
const controller = require("./../../controllers/admin/topic.controller");
const passport = require("passport");
const { isAdmin } = require("./../../middlewares/role");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.postTopic
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.updateTopic
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.deleteTopic
);

module.exports = router;
