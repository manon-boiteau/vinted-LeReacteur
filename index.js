// Import - packages
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const env = require("dotenv").config();
const cors = require("cors");

// Initialisation - packages
const app = express();
app.use(formidable());
app.use(cors());

// Initialisation - Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Database connexion
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// Import - endpoints
const userRoute = require("./routes/user");
app.use(userRoute);

const offerRoute = require("./routes/offer");
app.use(offerRoute);

// -------------------------
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Vinted API by lereacteur !" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This endpoint does not exist." });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Go go gooo server 🥳 !");
});
