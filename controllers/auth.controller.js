const { User } = require("./../models/");
const { Token } = require("./../models/");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).send({ err: "Invalid email" });
    if (!user.isActive) return res.status(400).send({ err: "Not authorized" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).send({ err: "Invalid Password" });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const data = {
      token,
      id: user.id,
      role: user.role,
    };
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.signup = async (req, res) => {
  let { email, password } = req.body;
  password = password && password.trim();
  if (!password) return res.status(400).send({ err: "Password is required" });

  if (password.length <= 5)
    return res.status(400).send({ err: "Password too short" });

  try {
    const emailExists = await User.findOne({ where: { email } });

    if (emailExists) {
      return res.status(409).send({ err: "Email already registered" });
    }

    const user = await User.create({
      email,
      password,
    });

    const data = user.toJSON();
    delete data.password;
    return res.status(201).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
