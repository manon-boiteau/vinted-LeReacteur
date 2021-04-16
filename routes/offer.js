/* --------- Import et initialisation d'Express --------- */
const express = require("express");
const router = express.Router();

/* --------- Import d'autres packages --------- */
const cloudinary = require("cloudinary").v2;

/* ---------- Import des modèles --------- */
const User = require("../models/User");
const Offer = require("../models/Offer");

/* ---------- Import des middlewares --------- */
const isAuthenticated = require("../middlewares/isAuthenticated");

/* ________________ La requête POSTMAN est la suivante :

POST http://localhost:3000/offer/publish
BODY (form-data) (...)
HEADER (authaurization) - bearen token - token ______________ */

/* ---------------- Déclaration des routes ------------------ */
// Route POST - Création d'une annonce
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

    // 1/ Le serveur créer la nouvelle annonce
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
      //   product_image: {
      //     secure_url: result,
      //   },
      owner: req.user, // req.user (cf. middleware isAutentificated = ref vers le user qui fait la requête)
    });

    if (req.files) {
      // 2/ Le serveur récupère également l'image envoyée
      // !! IMPORTANT DE LA RECUPERER APRES LA DECLARATION DE newOffer
      const pictureOfProduct = req.files.picture.path;

      // 3/ Le serveur envoie cette image sur Cloudinary afin de la sauvegarder et de récupérer une URL correspondant à l'image en échange
      const result = await cloudinary.uploader.upload(pictureOfProduct, {
        folder: `/vinted/offers/${newOffer._id}`, // l'image sera enregistrée dans un dossier "vinted/offers/id de l'offre"
        public_id: "basket-nike",
      });

      // On ajoute à l'objet newOffer la clé "product_image" ainsi que sa valeur.
      newOffer.product_image = result;
    }

    // Le serveur enregistre l'offre en BDD
    await newOffer.save();

    // Le serveur répond au client
    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

/* ------- Routes comportant des filtres ---------- */
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

    /*
    OU écriture plus concise mais plus compliqué à lire :

    if (req.query.priceMin) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }
    */

    // console.log(filters);

    /* ----------------------- sort ✅ ------------------------- */
    const sort = {};

    if (req.query.sort) {
      // On est pas obligé de vérifier si la clé existe.
      if (req.query.sort === "price-asc") {
        sort.product_price = "asc";
      } else if (req.query.sort === "price-desc") {
        sort.product_price = "desc";
      }
    }

    // console.log(sort);

    /* ------------------------- page - A REVOIR  ----------------------- */
    let skip = 0;
    const limit = 3;

    if (req.query.page) {
      if (req.query.page > 1) {
        skip = (Number(req.query.page) - 1) * limit;
      }
    }

    /* ------------------------------------------------------- */
    const results = await Offer.find(filters)
      .sort(sort)
      .populate("owner", "account") // !! au salt et au hash, il faut filtrer !!
      /*
      Ou
      .populate({
        path: "owner",
        select: "account"
      })
      */
      .skip(skip)
      .limit(limit)
      .select("product_name product_price");

    res.status(200).json({ count: results.length, offers: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ------- Routes comportant des params ---------- */
router.get("/offer/:id", async (req, res) => {
  try {
    if (req.params) {
      const offers = await Offer.find({ _id: req.params.id }).populate(
        "owner",
        "account"
      );
      /*
      const offers = await Offer.findById(req.params.id).populate(
        "owner",
        "account"
      );
      */
      res.status(200).json(offers);
    } else {
      res.status(400).json({ message: "Missing parameter." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ----------- Export de la route "offer" ----------- */
module.exports = router;
