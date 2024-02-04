const express = require("express");
const {
  signup,
  login,
  logout,
  forgotPassword,
  forgotPasswordReset,
} = require("../controllers/userController");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:forgotToken").post(forgotPasswordReset);

module.exports = router;
