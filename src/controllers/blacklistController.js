const Blacklist = require("../models/blacklist");

exports.list = async (req, res) => {
  const items = await Blacklist.find().sort({ createdAt: -1 }).lean();
  res.render("blacklist", { items });
};

exports.create = async (req, res) => {
  const { prenom, nom, raison, expireAt } = req.body;

  await Blacklist.create({
    prenom,
    nom,
    raison: raison || "",
    expireAt: expireAt ? new Date(expireAt) : null
  });

  res.redirect("/blacklist");
};

exports.remove = async (req, res) => {
  await Blacklist.findByIdAndDelete(req.params.id);
  res.redirect("/blacklist");
};
