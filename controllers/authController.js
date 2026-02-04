const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASSWORD;

  if (!email || !pass) return; // si tu veux gérer toi-même
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

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return res.status(401).render("login", { error: "Identifiants invalides" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).render("login", { error: "Identifiants invalides" });

  req.session.userId = user._id.toString();
  req.session.email = user.email;
  res.redirect("/dashboard");
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};
