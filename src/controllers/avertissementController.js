const Avertissement = require("../models/avertissement");

exports.list = async (req, res) => {
  try {
    await Avertissement.deleteMany({
      type: "temporaire",
      expireAt: { $ne: null, $lte: new Date() }
    });

    const items = await Avertissement.find().sort({ createdAt: -1 }).lean();
    return res.render("avertissements", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage avertissements vide", err.message);
    return res.render("avertissements", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { prenom, nom, motif, type, expireAt, durationDays } = req.body;
  const token = req.body?.token || req.query?.token || "";
  let finalExpireAt = null;

  if (type === "temporaire") {
    if (durationDays && Number(durationDays) > 0) {
      const days = Number(durationDays);
      finalExpireAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else if (expireAt) {
      finalExpireAt = new Date(expireAt);
    }
  }

  try {
    await Avertissement.create({
      prenom,
      nom,
      motif: motif || "",
      type,
      expireAt: finalExpireAt
    });
  } catch (err) {
    console.warn("Erreur creation avertissement (DB):", err.message);
  }

  const redirectUrl = token ? `/avertissements?token=${encodeURIComponent(token)}` : "/avertissements";
  res.redirect(redirectUrl);
};

exports.remove = async (req, res) => {
  const token = req.body?.token || req.query?.token || "";
  try {
    await Avertissement.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.warn("Erreur suppression avertissement (DB):", err.message);
  }
  const redirectUrl = token ? `/avertissements?token=${encodeURIComponent(token)}` : "/avertissements";
  res.redirect(redirectUrl);
};
