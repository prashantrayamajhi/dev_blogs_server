const router = require("express").Router();
const controller = require("../controllers/news.controller");

router.get("/", controller.getTopNews);

router.get("/:id", controller.getNewsById);

router.get("/similar/:id", controller.getSimilarNews);

router.get("/categories/:id", controller.getNewsByCategoryId);

router.get("/search/:term", controller.getNewsBySearchTerm);

module.exports = router;
