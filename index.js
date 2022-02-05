const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const userRoute = require("./routes/user");
app.use(userRoute);

const offerRoute = require("./routes/offer");
app.use(offerRoute);

const paymentRoute = require("./routes/payment");
app.use(paymentRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Vinted API by lereacteur !" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This endpoint does not exist." });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Go go gooo server 🥳 !");
});
