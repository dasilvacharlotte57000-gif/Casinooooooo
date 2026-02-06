const Blacklist = require("../models/blacklist");

exports.list = async (req, res) => {
  try {
    const items = await Blacklist.find().sort({ createdAt: -1 }).lean();
    return res.render("blacklist", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage de la blacklist vide", err.message);
    return res.render("blacklist", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { prenom, nom, raison, expireAt } = req.body;
  try {
    await Blacklist.create({
      prenom,
      nom,
      raison: raison || "",
      expireAt: expireAt ? new Date(expireAt) : null
    });
  } catch (err) {
    console.warn("Erreur création blacklist (DB):", err.message);
  }

  res.redirect("/blacklist");
};

exports.remove = async (req, res) => {
  try {
    await Blacklist.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.warn("Erreur suppression blacklist (DB):", err.message);
  }
  res.redirect("/blacklist");
};
