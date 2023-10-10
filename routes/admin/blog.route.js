const router = require("express").Router();
const controller = require("../../controllers/admin/blog.controller");
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.getAllBlogs
);

router.get(
  "/search/:search",
  passport.authenticate("jwt", { session: false }),
  controller.getBlogsByTitle
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.getBlogById
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.postBlog
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.updateBlog
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.deleteBlog
);

module.exports = router;
