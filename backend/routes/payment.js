const express = require("express");
const {
  sendStripeKey,
  captureStripePayment,
} = require("../controllers/paymentController");
const { isLoggedIn } = require("../middlewares/userMiddleware");
const router = express.Router();

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/stripepayment").post(isLoggedIn, captureStripePayment);

module.exports = router;
