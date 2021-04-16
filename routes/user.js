/* ------------- Import d'Express -------------- */
const express = require("express");
const router = express.Router();

// Packages pour l'authentification
const uid2 = require("uid2"); // gère des chaînes de caractères aléatoirement
const SHA256 = require("crypto-js/sha256"); // crypto-js = librairie d'algorithmes cryptographiques
const encBase64 = require("crypto-js/enc-base64");

// Package pour gérer les fichiers (images, videos...)
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "db6m8rlzz", // id perso
  api_key: "679999567546627", // clé perso
  api_secret: "BIFORf_iXoR5WWVsF_f3nMdFBKk", // clé perso
});

/* ------------- Import des modèles -------------- */
const User = require("../models/User");
const Offer = require("../models/Offer");

// SIGNUP
router.post("/user/signup", async (req, res) => {
  try {
    // 1 - Le serveur récupère les infos du user
    const { email, username, phone, password } = req.fields;

    // Le serveur fait une requête auprès de la BDD pour savoir si un user avec cet email existe déjà.
    const userToFind = await User.findOne({ email: email }); // !! Si findOne() ne trouve rien, il renvoie un []

    if (username && password) {
      // Double sécurité car le front aura déjà vérifié
      if (!userToFind) {
        // 2 - Le serveur génère un salt (= string aléatoire de 16 caractères)
        const salt = uid2(16); // JKPm0risVvhUVCDh

        // 3 - Le serveur génère un hash (= salt + password, le tout cripté)
        const hash = SHA256(password + salt).toString(encBase64); // rDTd+HqMpbb6b1NbgCsq14yjqbwqXNKMX1/7/ZYfqgI=

        // 4 - Le serveur génère un token (= string aléatoire de 16 caractères propre à chaque user)
        const token = uid2(64);

        // Le serveur créer un nouveau user
        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
          },

          token: token,
          hash: hash,
          salt: salt,
        });

        // -----------------------------------
        // GESTION DE L'AVATAR
        if (req.files) {
          console.log(req.files);
          const avatar = req.files.avatar.path;
          const result = await cloudinary.uploader.upload(avatar, {
            folder: `/vinted/user/${newUser._id}`,
            public_id: "profile-picture",
          });

          newUser.account.avatar = result;
        }
        // -----------------------------------

        // Le nouveau user est enregistré en BDD
        await newUser.save();

        // Réponse du serveur au client
        res.status(200).json({
          _id: newUser._id,
          token: token,
          account: {
            username: username,
            phone: phone,
          },
        });
      } else {
        res.status(409).json({ message: "This email already exists." }); // status(409) pour un doublon
      }
    } else {
      res.status(400).json({ message: "You missed some parameters." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGIN
router.post("/user/login", async (req, res) => {
  try {
    // 1 - Le serveur récupère les infos du user
    const { email, password } = req.fields;

    // 2 - Le serveur cherche dans la BDD si le user existe
    const userToFind = await User.findOne({ email: email });
    console.log(userToFind);

    if (email && password && userToFind) {
      // 3 - Le serveur génère un nouveau hash (= salt + password, le tout cripté)
      const newHash = SHA256(password + userToFind.salt).toString(encBase64); // rDTd+HqMpbb6b1NbgCsq14yjqbwqXNKMX1/7/ZYfqgI=
      if (userToFind.hash === newHash) {
        res.status(200).json({
          _id: userToFind._id,
          token: userToFind.token,
          account: {
            username: userToFind.account.username,
            phone: userToFind.account.phone,
          },
        });
      } else {
        res.status(400).json({ message: "Connexion is unauthorized." }); // !! Attention il ne faut jamais préciser que le mdp ou l'email ne sont pas bon. Ne pas donner trop d'infos.
      }
    } else {
      res.status(401).json({ message: "Connexion is unauthorized." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ------------- Export de la route "user" -------------- */
module.exports = router;
