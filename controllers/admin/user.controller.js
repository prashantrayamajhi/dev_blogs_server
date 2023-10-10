const { User } = require("./../../models");

exports.getUsers = async (req, res) => {
  try {
    const data = await User.findAll({
      order: [["id", "DESC"]],
    });
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
