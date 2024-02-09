const express = require("express");
const { isLoggedIn, role } = require("../middlewares/userMiddleware");
const {
  createOrder,
  getOneOrder,
  userGetOrder,
  adminGetAllOrder,
  adminDeleteOrder,
  adminUpdateOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/createOrder").post(isLoggedIn, createOrder);
router.route("/getOneOrder/:id").get(isLoggedIn, getOneOrder);
router.route("/myOrder").get(isLoggedIn, userGetOrder);
router
  .route("/adminGetAllOrder")
  .get(isLoggedIn, role("admin"), adminGetAllOrder);

router
  .route("/adminUpdateOrder/:id")
  .put(isLoggedIn, role("admin"), adminUpdateOrder);

router
  .route("/adminDeleteOrder/:id")
  .delete(isLoggedIn, role("admin"), adminDeleteOrder);

module.exports = router;
