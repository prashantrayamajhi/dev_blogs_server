const { User } = require("./../models/");
const { Token } = require("./../models/");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("./../helper/token");
const { sendEmail } = require("./../utils/nodemailer");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).send({ err: "Invalid email" });
    if (user.role !== "admin" && !user.isActive)
      return res.status(400).send({ err: "not_active" });
    if (user.role !== "admin" && !user.password)
      return res.status(400).send({
        err: "Account registered via google. Please login through gmail ",
      });
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

exports.googleLogin = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).send({ err: "Email not registered" });
    if (user.registrationType !== "google")
      return res.status(400).send({
        err: "Account registered via email. Please sign in through email",
      });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const data = {
      token,
      id: user.id,
    };
    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.signup = async (req, res) => {
  let { username, email, password } = req.body;

  username = username && username.trim();
  // phone = phone && phone.trim();
  password = password && password.trim();

  if (!username) return res.status(400).send({ err: "Username is required" });
  // if (!phone) return res.status(400).send({ err: "Phone number is required" });
  if (!password) return res.status(400).send({ err: "Password is required" });

  // if (phone.length !== 10)
  //   return res.status(400).send({ err: "Invalid phone number" });

  if (password.length <= 5)
    return res.status(400).send({ err: "Password too short" });

  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists && !emailExists.isActive) {
      const token = await Token.findOne({
        where: { user_id: emailExists.id },
      });
      if (token) {
        await Token.destroy({
          where: { user_id: emailExists.id },
        });
      }
      await User.destroy({ where: { id: emailExists.id } });
    }
    if (emailExists && emailExists.isActive) {
      return res.status(409).send({ err: "Email already registered" });
    }

    const user = await User.create({
      username,
      email,
      password,
      // phone,
      registrationType: "email",
    });

    const token = generateToken(4);
    await sendEmail(user.email, "Verify Account", token);
    await Token.create({ userId: user.id, token });
    const data = user.toJSON();
    delete data.password;
    return res.status(201).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.googleSignup = async (req, res) => {
  let { username, email } = req.body;

  try {
    const emailExists = await User.findOne({ where: { email } });

    if (emailExists) {
      return res.status(409).send({ err: "Email already registered" });
    }

    const user = await User.create({
      username,
      email,
      // phone,
      registrationType: "google",
      isActive: true,
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const data = {
      token,
      id: user.id,
    };

    return res.status(201).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.postVerificationToken = async (req, res) => {
  const { token } = req.body;
  try {
    const validToken = await Token.findOne({
      where: { token },
    });

    if (!validToken) {
      return res.status(400).send({ err: "Invalid token" });
    }
    const user = await User.findByPk(validToken.userId);
    if (user.isActive) {
      return res
        .status(400)
        .send({ err: "Account already activated please login" });
    }

    if (user.registrationType === "google")
      return res.status(404).send({ err: "Cannot perform action" });

    user.isActive = true;
    await user.save();
    await validToken.destroy();

    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const data = {
      token: jwtToken,
      id: user.id,
    };

    return res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.resendVerificationToken = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).send({ err: "Email not registered" });
    if (user.registrationType === "gmail")
      return res.status(404).send({ err: "Cannot perform action" });
    if (user.isActive)
      return res
        .status(400)
        .send({ err: "Your account has already been activated" });
    const token = generateToken(4);
    await sendEmail(user.email, "Verify Account", token);

    await Token.create({
      userId: user.id,
      token,
    });
    return res.status(200).send({ msg: "Mail sent successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.params;
  if (!email || email.trim().length <= 0)
    return res.status(400).send({ err: "Email is required" });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send({ err: "User not found" });
    if (!user.isActive)
      return res.status(404).send({ err: "Account not activated" });
    if (user.registrationType === "google")
      return res.status(404).send({ err: "Cannot perform action" });
    const token = await user.generatePasswordResetToken();
    // send email
    await sendEmail(
      email,
      "Password Reset Link",
      `<div>
        <p>Hello User</p>
        <p>Please click the link below to reset your password</p>
        <a
          href=http://localhost:3000/auth/forgot-password/${token}
          target="_blank"
        >
          Reset Password
        </a>
      </div>`
    );
    await user.save();
    return res.status(200).send({ msg: "Password reset link sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.forgotPasswordMobile = async (req, res) => {
  const { email } = req.params;
  if (!email || email.trim().length <= 0)
    return res.status(400).send({ err: "Email is required" });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).send({ err: "Email address not registred" });
    if (!user.isActive)
      return res.status(404).send({ err: "Account not activated" });
    if (user.registrationType === "google")
      return res.status(404).send({ err: "Cannot perform action" });
    const code = Math.floor(1000 + Math.random() * 9000); // generate 4-digit code
    user.resetPasswordCode = code.toString(); // save code to user object
    await user.save(); // save user object to database
    // send email with code
    await sendEmail(
      email,
      "Password Reset Code",
      `<div>
        <p>Hello User</p>
        <p>Your password reset code is: <strong>${code}</strong></p>
      </div>`
    );
    return res.status(200).send({ msg: "Password reset code sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  if (!token || token.trim().length <= 0)
    return res.status(400).send({ err: "Token is required" });

  if (!password || password.trim().length <= 0)
    return res.status(400).send({ err: "Password cannot be empty" });

  // Check if the new password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).send({ err: "Passwords do not match" });
  }

  if (password.length <= 5)
    return res.status(400).send({ err: "Password too short" });

  try {
    const user = await User.findOne({ where: { resetPasswordToken: token } });
    if (!user) return res.status(404).send({ err: "User not found" });

    if (!user.isActive)
      return res.status(404).send({ err: "Account not activated" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    // Update the user's password
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
    });

    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};

exports.verifyOTP = async (req, res) => {
  const { token } = req.params;
  if (!token || token.trim().length <= 0)
    return res.status(400).send({ err: "Token is required" });
  try {
    const user = await User.findOne({ where: { resetPasswordCode: token } });
    if (!user) return res.status(404).send({ err: "User not found" });

    if (!user.isActive)
      return res.status(404).send({ err: "Account not activated" });

    if (user.registrationType === "google")
      return res.status(404).send({ err: "Cannot perform action" });
    const resetToken = await user.generatePasswordResetToken();
    user.resetPasswordToken = resetToken;
    await user.save();

    return res.status(200).send({ data: user });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err });
  }
};
