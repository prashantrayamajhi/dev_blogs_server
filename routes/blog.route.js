const router = require("express").Router();
const controller = require("../controllers/blog.controller");

router.get("/", controller.getTopBlogs);

router.get("/:id", controller.getBlogById);

router.get("/similar/:id", controller.getSimilarBlogs);

router.get("/categories/:id", controller.getBlogByCategoryId);

router.get("/search/:term", controller.getBlogBySearchTerm);

module.exports = router;
