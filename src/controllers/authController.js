const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = async (req, res) => {
  res.render("login", { error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const normalized = String(email).toLowerCase().trim();

  console.log("Tentative de connexion:", normalized);
  console.log("DB connectée:", mongoose.connection.readyState === 1);

  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: normalized });
      console.log("Utilisateur trouvé:", user ? user.email : "aucun");
      if (user) {
        const ok = await bcrypt.compare(password, user.passwordHash);
        console.log("Mot de passe correct:", ok);
        if (!ok) return res.status(401).render("login", { error: "Identifiants invalides" });

        req.session.userId = user._id.toString();
        req.session.email = user.email;
        return res.redirect("/dashboard");
      }
    } catch (err) {
      console.warn("Erreur DB lors de la recherche d'utilisateur — fallback admin possible", err.message);
    }
  }

  // Fallback : authentification via variables d'environnement (mode dev)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (
    adminEmail &&
    adminPass &&
    normalized === String(adminEmail).toLowerCase().trim() &&
    password === adminPass
  ) {
    req.session.userId = "dev-admin";
    req.session.email = adminEmail;
    return res.redirect("/dashboard");
  }

  return res.status(401).render("login", { error: "Identifiants invalides" });
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};