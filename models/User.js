const mongoose = require("mongoose");

/* ------------- Déclaration du modèle User -------------- */
const User = mongoose.model("User", {
  email: {
    unique: true, // !! On rend ici l'email unique auprès de la BDD !
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
    avatar: Object,
  },
  token: String,
  hash: String,
  salt: String,
});

/* ------------- Export du modèle User -------------- */
module.exports = User;
