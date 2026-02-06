const Entreprise = require("../models/entreprise");

exports.list = async (req, res) => {
  try {
    const items = await Entreprise.find().sort({ createdAt: -1 }).lean();
    return res.render("entreprises", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage des entreprises vide", err.message);
    return res.render("entreprises", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { nomEntreprise, contactNom, contactEmail, notes } = req.body;

  try {
    await Entreprise.create({
      nomEntreprise,
      contactNom: contactNom || "",
      contactEmail: contactEmail || "",
      notes: notes || ""
    });
  } catch (err) {
    console.warn("Erreur création entreprise (DB):", err.message);
  }

  res.redirect("/entreprises");
};

exports.remove = async (req, res) => {
  try {
    await Entreprise.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.warn("Erreur suppression entreprise (DB):", err.message);
  }
  res.redirect("/entreprises");
};
