const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/pay", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
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

module.exports = router;
