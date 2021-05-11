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
    const { title, description, price, condition, city, brand, size, color } =
      req.fields;

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
        public_id: `${newOffer.product_name}`,
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
// Update an offer
router.put("/offer/update/:id", isAuthenticated, async (req, res) => {
  const offertToUpdate = await Offer.findById(req.params.id);
  try {
    if (req.fields.title) {
      offertToUpdate.product_name = req.fields.title;
    }

    if (req.fields.description) {
      offertToUpdate.product_description = req.fields.description;
    }

    if (req.fields.price) {
      offertToUpdate.product_price = req.fields.price;
    }

    // Loop through details
    const details = offertToUpdate.product_details;
    for (let i = 0; i < details.length; i++) {
      if (details[i].CONDITION) {
        if (req.fields.condition) {
          details[i].CONDITION = req.fields.condition;
        }
      }

      if (details[i].BRAND) {
        if (req.fields.brand) {
          details[i].BRAND = req.fields.brand;
        }
      }

      if (details[i].CITY) {
        if (req.fields.city) {
          details[i].CITY = req.fields.city;
        }
      }

      if (details[i].SIZE) {
        if (req.fields.size) {
          details[i].SIZE = req.fields.size;
        }
      }

      if (details[i].COLOR) {
        if (req.fields.color) {
          details[i].COLOR = req.fields.color;
        }
      }
    }

    offerToModify.markModified("product_details");

    if (req.files.picture) {
      const pictureToUpdate = req.files.picture.path;
      const result = await cloudinary.uploader.upload(pictureToUpdate, {
        public_id: `/vinted/offers/${offertToUpdate._id}`,
      });
      offertToUpdate.product_image = result; // replace the old image by the new one
    }

    await offertToUpdate.save();

    res.status(200).json("Your offer has been successfully updated.");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an offer
router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    // Delete images inside the folder 🔔 DELETE INSIDE A FOLDER ✅
    await cloudinary.api.delete_resources_by_prefix(
      `/vinted/offers/${req.params.id}`
    );

    // Delete empty folder 🔔 CHECK DELETE FOLDER IN CLOUDINARY (DOES NOT WORK)
    await cloudinary.api.delete_folder(`/vinted/offers/${req.params.id}`);

    // Delete offer
    await Offer.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Your offer has been successfully deleted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
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
