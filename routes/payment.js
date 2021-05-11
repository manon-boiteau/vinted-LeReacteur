// Import - Express
const express = require("express");
const router = express.Router();

// Import - Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/pay", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.amount,
      currency: "eur",
      description: req.fields.title,
      source: req.fields.token,
    });

    if (response.status === "succeeded") {
      res.status(200).json({ message: "Paiement validé" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export - endpoints
module.exports = router;
