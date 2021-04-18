// Import - models
const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");

      const user = await User.findOne({ token: token }).select("account _id");

      if (user) {
        req.user = user;
        return next();
      } else {
        return res.status(401).json({ message: "Unauthorized." });
      }
    } else {
      return res.status(401).json({ message: "Unauthorized." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Export middleware "isAuthenticated"
module.exports = isAuthenticated;
