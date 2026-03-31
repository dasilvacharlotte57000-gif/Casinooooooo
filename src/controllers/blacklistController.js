const Blacklist = require("../models/blacklist");
const BlacklistHistory = require("../models/blacklistHistory");
const initCloudinary = require("../config/cloudinary");
const { logAudit } = require("../utils/auditLogger");

exports.list = async (req, res) => {
  try {
    // Auto-clean expired entries, but archive them to history first
    const expired = await Blacklist.find({
      permanent: { $ne: true },
      expireAt: { $ne: null, $lte: new Date() }
    }).lean();

    if (expired.length > 0) {
      const historyDocs = expired.map((e) => ({
        prenom:      e.prenom,
        nom:         e.nom,
        raison:      e.raison || "",
        addedAt:     e.createdAt,
        expireAt:    e.expireAt,
        permanent:   e.permanent,
        photoUrl:    e.photoUrl || "",
        removedAt:   new Date(),
        removalType: "expired"
      }));
      await BlacklistHistory.insertMany(historyDocs);
      await Blacklist.deleteMany({
        permanent: { $ne: true },
        expireAt: { $ne: null, $lte: new Date() }
      });
    }

    const items = await Blacklist.find().sort({ createdAt: -1 }).lean();
    return res.render("blacklist", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage de la blacklist vide", err.message);
    return res.render("blacklist", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { prenom, nom, raison, expireAt, photoUrl, permanent } = req.body;
  let finalPhotoUrl = photoUrl || "";
  const token = req.body?.token || req.query?.token || "";
  const isPermanent = permanent === "on" || permanent === "true";

  if (!finalPhotoUrl && req.file) {
    try {
      const cloudinary = initCloudinary();
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: "casino/blacklist"
      });
      finalPhotoUrl = uploaded.secure_url;
    } catch (err) {
      console.warn("Erreur upload photo blacklist:", err.message);
    }
  }
  try {
    const created = await Blacklist.create({
      prenom,
      nom,
      raison: raison || "",
      expireAt: !isPermanent && expireAt ? new Date(expireAt) : null,
      permanent: isPermanent,
      photoUrl: finalPhotoUrl
    });
    await logAudit({
      req,
      action: "create",
      entity: "blacklist",
      entityId: created?._id?.toString(),
      after: created
    });
  } catch (err) {
    console.warn("Erreur création blacklist (DB):", err.message);
  }

  const redirectUrl = token ? `/blacklist?token=${encodeURIComponent(token)}` : "/blacklist";
  res.redirect(redirectUrl);
};

exports.update = async (req, res) => {
  const { prenom, nom, raison, expireAt, photoUrl, permanent } = req.body;
  const token = req.body?.token || req.query?.token || "";
  let finalPhotoUrl = typeof photoUrl === "string" ? photoUrl.trim() : "";
  const isPermanent = permanent === "on" || permanent === "true";

  if (!finalPhotoUrl && req.file) {
    try {
      const cloudinary = initCloudinary();
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: "casino/blacklist"
      });
      finalPhotoUrl = uploaded.secure_url;
    } catch (err) {
      console.warn("Erreur upload photo blacklist:", err.message);
    }
  }

  const update = {
    prenom,
    nom,
    raison: raison || "",
    expireAt: !isPermanent && expireAt ? new Date(expireAt) : null,
    permanent: isPermanent
  };

  if (finalPhotoUrl) {
    update.photoUrl = finalPhotoUrl;
  }

  try {
    const before = await Blacklist.findById(req.params.id).lean();
    const updatedDoc = await Blacklist.findByIdAndUpdate(req.params.id, update, { new: true });
    const updated = updatedDoc ? updatedDoc.toObject() : null;
    await logAudit({
      req,
      action: "update",
      entity: "blacklist",
      entityId: req.params.id,
      before,
      after: updated
    });
  } catch (err) {
    console.warn("Erreur modification blacklist (DB):", err.message);
  }

  const redirectUrl = token ? `/blacklist?token=${encodeURIComponent(token)}` : "/blacklist";
  res.redirect(redirectUrl);
};

exports.remove = async (req, res) => {
  const token = req.body?.token || req.query?.token || "";
  try {
    const removedDoc = await Blacklist.findByIdAndDelete(req.params.id);
    const removed = removedDoc ? removedDoc.toObject() : null;

    // Archive in history
    if (removed) {
      await BlacklistHistory.create({
        prenom:      removed.prenom,
        nom:         removed.nom,
        raison:      removed.raison || "",
        addedAt:     removed.createdAt,
        expireAt:    removed.expireAt || null,
        permanent:   removed.permanent,
        photoUrl:    removed.photoUrl || "",
        removedAt:   new Date(),
        removalType: "manual"
      });
    }

    await logAudit({
      req,
      action: "delete",
      entity: "blacklist",
      entityId: req.params.id,
      before: removed
    });
  } catch (err) {
    console.warn("Erreur suppression blacklist (DB):", err.message);
  }
  const redirectUrl = token ? `/blacklist?token=${encodeURIComponent(token)}` : "/blacklist";
  res.redirect(redirectUrl);
};

// ───────────────────────────────────────────────
// Historique complet des anciens blacklistés
// ───────────────────────────────────────────────
exports.listHistory = async (req, res) => {
  try {
    const items = await BlacklistHistory.find().sort({ removedAt: -1 }).lean();
    return res.render("blacklistHistory", { items });
  } catch (err) {
    console.warn("DB non disponible — historique vide", err.message);
    return res.render("blacklistHistory", { items: [] });
  }
};

// ───────────────────────────────────────────────
// API : vérifie si une personne a déjà été blacklistée (par nom + prenom)
// GET /blacklist/check-history?nom=...&prenom=...
// ───────────────────────────────────────────────
exports.checkHistory = async (req, res) => {
  try {
    const nom    = (req.query.nom    || "").trim();
    const prenom = (req.query.prenom || "").trim();

    if (!nom || !prenom) {
      return res.json({ found: false, entries: [] });
    }

    const entries = await BlacklistHistory.find({
      nom:    { $regex: new RegExp(`^${nom}$`,    "i") },
      prenom: { $regex: new RegExp(`^${prenom}$`, "i") }
    })
      .sort({ removedAt: -1 })
      .lean();

    return res.json({ found: entries.length > 0, entries });
  } catch (err) {
    console.warn("Erreur check history blacklist:", err.message);
    return res.json({ found: false, entries: [] });
  }
};
