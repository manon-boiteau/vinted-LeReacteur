// Import - models
const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await await User.findOne({ token: token }).select(
      "account _id"
    );

    if (user) {
      req.user = user;
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized." });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized." });
  }
};

// Export middleware "isAuthenticated"
module.exports = isAuthenticated;
