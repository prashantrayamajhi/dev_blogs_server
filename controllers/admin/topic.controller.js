const { Topic } = require("./../../models/");
const { handleText } = require("./../../helper/text");

exports.postTopic = async (req, res) => {
  let { name } = req.body;
  if (!name || name.trim().length <= 0)
    return res.status(400).send({ err: "Name cannot be empty" });
  name = handleText(name);

  try {
    const topicExists = await Topic.findOne({ where: { name } });
    if (topicExists)
      return res.status(409).send({ err: "Topic already exists" });

    const topic = await Topic.create({
      name,
    });

    return res.status(201).json({ data: topic });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.updateTopic = async (req, res) => {
  const id = req.params.id;
  let { name } = req.body;
  if (!name || name.trim().length <= 0)
    return res.status(400).send({ err: "Name cannot be empty" });
  name = handleText(name);

  try {
    const topic = await Topic.findByPk(id);
    if (!topic) return res.status(404).send({ err: "Topic not found" });

    const data = topic.update({
      name: name,
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const id = req.params.id;
    const topic = await Topic.findByPk(id);
    if (!topic) return res.status(404).send({ err: "Topic not found" });
    await topic.destroy();
    return res.status(200).send({ msg: "Topic deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
