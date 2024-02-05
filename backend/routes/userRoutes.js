const express = require("express");
const {
  signup,
  login,
  logout,
  forgotPassword,
  forgotPasswordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
} = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/userMiddleware");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:forgotToken").post(forgotPasswordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/change").post(isLoggedIn, changePassword);
router.route("/update/userDetails").post(isLoggedIn, updateUserDetails);

module.exports = router;
