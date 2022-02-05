const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

// ENDPOINT SIGNUP
router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, phone, password } = req.fields;

    const userToFind = await User.findOne({ email: email });

    // Create user's salt / hash / token
    if (username && password) {
      if (!userToFind) {
        const salt = uid2(16);

        const hash = SHA256(password + salt).toString(encBase64);

        const token = uid2(64);

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

        // Create user's avatar
        if (req.files) {
          const avatar = req.files.avatar.path;
          const result = await cloudinary.uploader.upload(avatar, {
            folder: `/vinted/user/${newUser._id}`,
            public_id: "profile-picture",
          });

          newUser.account.avatar = result;
        }

        await newUser.save();

        // Response without hash and salt
        res.status(200).json({
          _id: newUser._id,
          token: token,
          account: {
            username: username,
            phone: phone,
          },
        });
      } else {
        res.status(409).json({ message: "This email already exists." });
      }
    } else {
      res.status(400).json({ message: "You missed some parameters." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ENDPOINT LOGIN
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;

    const userToFind = await User.findOne({ email: email });

    if (email && password && userToFind) {
      const newHash = SHA256(password + userToFind.salt).toString(encBase64);
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
        res.status(400).json({ message: "Connexion is unauthorized." });
      }
    } else {
      res.status(401).json({ message: "Connexion is unauthorized." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
