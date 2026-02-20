const { verifyToken } = require("../utils/authToken");

module.exports = function requireAdmin(req, res, next) {
  // Vérifier d'abord si l'utilisateur est déjà authentifié via session
  if (req.user && req.user.admin === true) {
    return next();
  }

  // Sinon, vérifier s'il y a un token dans l'URL
  const tokenFromQuery = req.query.token;
  if (tokenFromQuery) {
    const payload = verifyToken(tokenFromQuery);
    if (payload && payload.admin === true) {
      // Token valide avec admin=true
      req.user = payload;
      return next();
    }
  }

  // Aucune authentification valide -> redirection
  return res.redirect("/admin/login");
};
