const Entreprise = require("../models/entreprise");
const { logAudit } = require("../utils/auditLogger");

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
  const { nomEntreprise, notes } = req.body;
  const token = req.body?.token || req.query?.token || "";

  try {
    const created = await Entreprise.create({
      nomEntreprise,
      notes: notes || ""
    });
    await logAudit({
      req,
      action: "create",
      entity: "entreprise",
      entityId: created?._id?.toString(),
      after: created
    });
  } catch (err) {
    console.warn("Erreur création entreprise (DB):", err.message);
  }

  const redirectUrl = token ? `/entreprises?token=${encodeURIComponent(token)}` : "/entreprises";
  res.redirect(redirectUrl);
};

exports.remove = async (req, res) => {
  const token = req.body?.token || req.query?.token || "";
  try {
    const removedDoc = await Entreprise.findByIdAndDelete(req.params.id);
    const removed = removedDoc ? removedDoc.toObject() : null;
    await logAudit({
      req,
      action: "delete",
      entity: "entreprise",
      entityId: req.params.id,
      before: removed
    });
  } catch (err) {
    console.warn("Erreur suppression entreprise (DB):", err.message);
  }
  const redirectUrl = token ? `/entreprises?token=${encodeURIComponent(token)}` : "/entreprises";
  res.redirect(redirectUrl);
};
