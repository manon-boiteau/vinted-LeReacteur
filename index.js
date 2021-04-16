/* ------------ Import des packages -------------- */
// Packages pour le serveur et la BDD
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const env = require("dotenv").config(); // on active les variables d'environnement

/* --------- Initialisation des packages --------- */
const app = express();
app.use(formidable());

/* ---------- Initialisation de Cloudinary --------- */
// Pour gérer le stockage des fichiers reçus par le serveur
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ------------- Connexion à la BDD -------------- */
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

/* -------------- Import des routes -------------- */
const userRoute = require("./routes/user");
app.use(userRoute);

const offerRoute = require("./routes/offer");
app.use(offerRoute);

/* ----------------------------------------- */
app.all("*", (req, res) => {
  res.status(404).json({ message: "This endpoint does not exist." });
});

app.listen(process.env.PORT, () => {
  console.log("Go go gooo server 🥳 !");
});
