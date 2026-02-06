const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");

async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASSWORD;

  if (!email || !pass) return; // admin géré manuellement

  // Si la DB n'est pas connectée, on ne tente pas d'utiliser Mongoose
  if (mongoose.connection.readyState !== 1) {
    console.warn("DB non connectée — saut de la création automatique d'admin");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(pass, 12);
  await User.create({ email, passwordHash });
  console.log("Admin créé:", email);
}

exports.getLogin = async (req, res) => {
  await ensureDefaultAdmin();
  res.render("login", { error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const normalized = String(email).toLowerCase().trim();

  // Si la DB est connectée, tenter l'auth via la collection `users`
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: normalized });
      if (user) {
        const ok = await bcrypt.compare(password, user.passwordHash);
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
