/* ---------- Import des modèles --------- */
const User = require("../models/User");
const Offer = require("../models/Offer");

// Je créer cette fonction pour vérifier si le user est authentifié sur le site pour pouvoir poster une annonce
// Si le user est déjà authentifié sur mon site, ALORS il peut continuer et uploader une annonce
// Sinon, ne pas executer la suite et ne pas entrer dans la route

const isAuthenticated = async (req, res, next) => {
  //   console.log("On rentre dans le middleware");
  // Le serveur check s'il y a un token dans la requête
  // Si oui :
  if (req.headers.authorization) {
    // 1- Le serveur récupère le token reçu en header de la requête et l'enregistre dans une variable
    const token = req.headers.authorization.replace("Bearer ", "");

    // 2- Le serveur cherche s'il a un utilisateur du même token en BDD
    const user = await await User.findOne({ token: token }).select(
      "account _id"
    ); // le .selct() permet de filtrer les infos que l'on veut filtrer (pour ne pas renvoyer le salt et le hash au client)

    // Si oui :
    if (user) {
      req.user = user; // J'ajoute à l'objet req l'utilisateur qui possède le token en BDD et qui donc peut se connecter
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized." });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized." });
  }
};

/* ----------- Export du middleware "isAuthenticated" ----------- */
module.exports = isAuthenticated;
