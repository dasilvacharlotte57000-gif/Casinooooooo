module.exports = function requireAdmin(req, res, next) {
  // Le middleware global dans app.js gère déjà le token
  // On vérifie juste si l'utilisateur a le flag admin
  if (req.user && req.user.admin === true) {
    return next();
  }

  // Sinon redirection vers le login
  return res.redirect("/admin/login");
};
