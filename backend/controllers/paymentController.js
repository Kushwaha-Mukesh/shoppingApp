const stripe = require("stripe")(process.env.STRIPE_SECRET);
exports.sendStripeKey = async (req, res) => {
  res.status(200).json({
    stripekey: Process.env.STRIPE_API_KEY,
  });
};

exports.captureStripePayment = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "USD",

      // optional
      metadata: { integration_check: "access_a_payment" },
    });
    res.status(200).json({
      success: true,
      amount: req.body.amount,
      client_secret: paymentIntent.client_secret,
      // here we can send id as well optionally
    });
  } catch (error) {
    res.status(500).send("Error capturing stripe payment: " + error.message);
  }
};

// similarly we can create for razorpay as well.
