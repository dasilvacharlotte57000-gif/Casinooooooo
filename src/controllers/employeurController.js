const Employeur = require("../models/employeur");

exports.list = async (req, res) => {
  const items = await Employeur.find().sort({ createdAt: -1 }).lean();
  res.render("employeurs", { items });
};

exports.create = async (req, res) => {
  const { prenom, nom, dateEntree, photoUrl } = req.body;

  await Employeur.create({
    prenom,
    nom,
    dateEntree: dateEntree ? new Date(dateEntree) : null,
    photoUrl: photoUrl || ""
  });

  res.redirect("/employeurs");
};

exports.remove = async (req, res) => {
  await Employeur.findByIdAndDelete(req.params.id);
  res.redirect("/employeurs");
};
