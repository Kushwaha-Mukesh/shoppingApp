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
  adminUser,
  managerUser,
  admingetoneuser,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controllers/userController");
const { isLoggedIn, role } = require("../middlewares/userMiddleware");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:forgotToken").post(forgotPasswordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/change").post(isLoggedIn, changePassword);
router.route("/update/userDetails").post(isLoggedIn, updateUserDetails);

router.route("/admin/users").get(isLoggedIn, role("admin"), adminUser);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, role("admin"), admingetoneuser)
  .put(isLoggedIn, role("admin"), adminUpdateUser)
  .delete(isLoggedIn, role("admin"), adminDeleteUser);
router.route("/manager/users").get(isLoggedIn, role("manager"), managerUser);

module.exports = router;
