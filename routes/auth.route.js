const router = require("express").Router();
const controller = require("./../controllers/auth.controller");

router.post("/login", controller.login);

router.post("/login/google", controller.googleLogin);

router.post("/signup", controller.signup);

router.post("/signup/google", controller.googleSignup);

router.post("/verify", controller.postVerificationToken);

router.post("/resend", controller.resendVerificationToken);

router.post("/forgot-password/:email", controller.forgotPassword);

router.post("/forgot-password/mobile/:email", controller.forgotPasswordMobile);

router.post("/reset-password/:token", controller.resetPassword);

router.post("/reset-password/verify/:token", controller.verifyOTP);

module.exports = router;
