// Import - Express
const express = require("express");
const router = express.Router();

// Initialisation - Cloudinary
const cloudinary = require("cloudinary").v2;

// Models
const User = require("../models/User");
const Offer = require("../models/Offer");

// Middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");

// Endpoints offer
// Create an offer
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { CONDITION: condition },
        { BRAND: brand },
        { CITY: city },
        { SIZE: size },
        { COLOR: color },
      ],
      owner: req.user, // (middleware isAuthentificated)
    });

    if (req.files) {
      const pictureOfProduct = req.files.picture.path;

      const result = await cloudinary.uploader.upload(pictureOfProduct, {
        folder: `/vinted/offers/${newOffer._id}`,
        public_id: "basket-nike",
      });

      newOffer.product_image = result;
    }

    await newOffer.save();

    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ---------------------------------------------- */
// AF !! Route PUT - Modification d'une annonce
// router.put("/offer/update/", isAuthenticated, async (req, res) => {
//   try {
//     //

//     res.status(200).json("hi");
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// AF !! Route DELETE - Suppression d'une annonce
// router.delete("/offer/delete", isAuthenticated, async (req, res) => {
//   try {
//     // On recoit le token du user et l'id de l'annonce à supprimer
//     // On vérifie que le user soit authentifié via le middleware isAuthenticated
//     // On cherche l'annonce que le user veut supprimer via
//     // On vérifie que l'annonce appartienne bien au user
//     // Si oui, on supprime l'annonce
//     // Puis on supprime les images correspondantes sur Cloudinary
//     // cloudinary.uploader.destroy('sample', function(result) { console.log(result) });

//     // On gère les cas :
//     // 1. isAuthenticated gère déjà le cas de l'authentification du user
//     // 2. l'annonce n'existe pas
//     // 3. l'annonce n'appartienne pas au user

//     res.status(200).json({ message: "Hello" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
/* ---------------------------------------------- */

// Filters
// Filter an offer
router.get("/offers", async (req, res) => {
  try {
    /* ---------------------- filtre ✅ ----------------------- */
    const filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMax) {
      filters.product_price = { $lte: Number(req.query.priceMax) };
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    }

    /* ----------------------- sort ✅ ------------------------- */
    const sort = {};

    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        sort.product_price = "asc";
      } else if (req.query.sort === "price-desc") {
        sort.product_price = "desc";
      }
    }

    /* ------------------------- page ✅ ----------------------- */
    let skip = 0;
    const limit = 3;

    if (req.query.page) {
      if (req.query.page > 1) {
        skip = (Number(req.query.page) - 1) * limit;
      }
    }

    const results = await Offer.find(filters)
      .sort(sort)
      .populate("owner", "account")
      .skip(skip)
      .limit(limit)
      .select("product_name product_price");

    res.status(200).json({ count: results.length, offers: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Params
// Get all informations about an offer in particular
router.get("/offer/:id", async (req, res) => {
  try {
    if (req.params) {
      const offers = await Offer.find({ _id: req.params.id }).populate(
        "owner",
        "account"
      );

      res.status(200).json(offers);
    } else {
      res.status(400).json({ message: "Missing parameter." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export - endpoints
module.exports = router;
