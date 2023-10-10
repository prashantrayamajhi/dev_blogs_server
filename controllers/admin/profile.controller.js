const { User, Topic, Occupation } = require("../../models");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../utils/nodemailer");

exports.getProfile = async (req, res) => {
  try {
    const data = await User.findByPk(req.user.id, {
      include: [
        {
          model: Topic,
          as: "topics",
        },
        {
          model: Occupation,
          as: "occupation",
        },
      ],
      attributes: { exclude: ["password"] },
    });
    if (!data) {
      return res.status(401).send({ err: "Unauthorized" });
    }
    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ err });
  }
};

exports.completeProfile = async (req, res) => {
  let { gender, occupation, ageGroup, skipPolitical, skipNSFW } = req.body;
  console.log(req.body);
  gender = gender && gender.trim();
  // occupation = occupation && occupation.trim();

  if (!occupation) {
    return res.status(400).send({ err: "Occupation is required" });
  }

  if (!ageGroup) {
    return res.status(400).send({ err: "Age Group is required" });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).send({ err: "User not found" });
    }
    if (!user.isActive) {
      return res.status(400).send({ err: "Account not activated" });
    }

    if (user.isComplete) {
      return res.status(400).send({ err: "Account already completed" });
    }

    await user.update({
      gender,
      occupationId: +occupation,
      skipNSFW,
      skipPolitical,
      ageGroup,
      isComplete: true,
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({ data: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ err });
  }
};

// update profile details
exports.updateDetails = async (req, res) => {
  let { gender, occupation, ageGroup, skipPolitical, skipNSFW } = req.body;

  gender = gender && gender.trim();

  if (!occupation)
    return res.status(400).send({ err: "Occupation is required" });

  if (!ageGroup) return res.status(400).send({ err: "Age Group is required" });

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).send({ err: "User not found" });
    if (!user.isActive)
      return res.status(400).send({ err: "Account not activated" });

    const data = await user.update({
      gender,
      occupation,
      skipNSFW,
      skipPolitical,
      ageGroup,
    });

    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

// update personal information
exports.updatePersonalInformation = async (req, res) => {
  let { email, phone } = req.body;

  email = email && email.trim();
  phone = phone && phone.trim();

  if (!email) return res.status(400).send({ err: "Email is required" });

  // if (!phone) return res.status(400).send({ err: "Phone number is required" });

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).send({ err: "User not found" });
    if (!user.isActive)
      return res.status(400).send({ err: "Account not activated" });

    // const data = await user.update({
    //   email,
    //   phone,
    // });

    const data = { email, phone };

    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

// update topics
exports.updateTopics = async (req, res) => {
  let { topics } = req.body;
  if (!topics || topics.length <= 0)
    return res.status(400).send({ err: "Please select at least one topic" });

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).send({ err: "User not found" });
    if (!user.isActive)
      return res.status(400).send({ err: "Account not activated" });

    await user.setTopics([]);
    await user.addTopics(topics);

    const data = await user.save();
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.trim().length <= 0)
    return res.status(400).send({ err: "Password cannot be empty" });

  // Check if the new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res.status(400).send({ err: "Passwords do not match" });
  }

  if (newPassword.length <= 5)
    return res.status(400).send({ err: "Password too short" });

  try {
    // Find the user by id
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).send({ err: "User not found" });

    const password = bcrypt.hashSync(newPassword, 10);
    // Update the user's password
    await user.update({
      password,
    });

    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Server error" });
  }
};

exports.addTopic = async (req, res) => {
  let { id } = req.params;
  if (!id) return res.status(400).send({ err: "Topic is required" });

  try {
    const user = await User.findByPk(req.user.id, {
      include: ["topics"],
    });
    if (!user) return res.status(404).send({ err: "User not found" });
    if (!user.isActive)
      return res.status(400).send({ err: "Account not activated" });

    const topic = await Topic.findByPk(id);
    if (!topic) return res.status(404).send({ err: "Topic doesn't exist" });

    let topicExists = false;
    user.topics.forEach((topic) => {
      if (topic.id === Number(id)) {
        topicExists = true;
      }
    });
    if (topicExists) {
      console.log("tryng to remove the topic, id asdasd");
      await user.removeTopic(id);
    } else {
      await user.addTopic(topic);
    }

    const data = await user.save();
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
