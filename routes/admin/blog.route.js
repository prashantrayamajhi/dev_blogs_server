const router = require("express").Router();
const controller = require("../../controllers/admin/blog.controller");
const passport = require("passport");
const { isAdmin } = require("../../middlewares/role");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.getAllBlogs
);

router.get(
  "/search/:search",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.getBlogsByTitle
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.getBlogById
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.postBlog
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.updateBlog
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  controller.deleteBlog
);

module.exports = router;
