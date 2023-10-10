const router = require("express").Router();
const controller = require("./../controllers/topics.controller");

router.get("/", controller.getTopics);

router.get("/:id", controller.getTopicById);

module.exports = router;
