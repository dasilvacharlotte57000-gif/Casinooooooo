const Entreprise = require("../models/entreprise");

exports.list = async (req, res) => {
  const items = await Entreprise.find().sort({ createdAt: -1 }).lean();
  res.render("entreprises", { items });
};

exports.create = async (req, res) => {
  const { nomEntreprise, contactNom, contactEmail, notes } = req.body;

  await Entreprise.create({
    nomEntreprise,
    contactNom: contactNom || "",
    contactEmail: contactEmail || "",
    notes: notes || ""
  });

  res.redirect("/entreprises");
};

exports.remove = async (req, res) => {
  await Entreprise.findByIdAndDelete(req.params.id);
  res.redirect("/entreprises");
};
