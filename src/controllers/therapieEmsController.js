const TherapieEms = require("../models/therapieEms");
const initCloudinary = require("../config/cloudinary");
const { logAudit } = require("../utils/auditLogger");

exports.list = async (req, res) => {
  try {
    const items = await TherapieEms.find().sort({ isCompleted: 1, createdAt: -1 }).lean();
    return res.render("therapieEms", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage thérapie EMS vide", err.message);
    return res.render("therapieEms", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { prenom, nom, raison, photoUrl } = req.body;
  const token = req.body?.token || req.query?.token || "";
  let finalPhotoUrl = photoUrl || "";

  if (!finalPhotoUrl && req.file) {
    try {
      const cloudinary = initCloudinary();
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: "casino/therapie-ems"
      });
      finalPhotoUrl = uploaded.secure_url;
    } catch (err) {
      console.warn("Erreur upload photo therapie EMS:", err.message);
    }
  }

  try {
    const created = await TherapieEms.create({
      prenom,
      nom,
      raison: raison || "",
      photoUrl: finalPhotoUrl
    });

    await logAudit({
      req,
      action: "create",
      entity: "therapie-ems",
      entityId: created?._id?.toString(),
      after: created
    });
  } catch (err) {
    console.warn("Erreur création therapie EMS (DB):", err.message);
  }

  const redirectUrl = token ? `/therapie-ems?token=${encodeURIComponent(token)}` : "/therapie-ems";
  res.redirect(redirectUrl);
};

exports.update = async (req, res) => {
  const { prenom, nom, raison, photoUrl } = req.body;
  const token = req.body?.token || req.query?.token || "";
  let finalPhotoUrl = typeof photoUrl === "string" ? photoUrl.trim() : "";

  if (!finalPhotoUrl && req.file) {
    try {
      const cloudinary = initCloudinary();
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: "casino/therapie-ems"
      });
      finalPhotoUrl = uploaded.secure_url;
    } catch (err) {
      console.warn("Erreur upload photo therapie EMS:", err.message);
    }
  }

  const update = {
    prenom,
    nom,
    raison: raison || ""
  };

  if (finalPhotoUrl) {
    update.photoUrl = finalPhotoUrl;
  }

  try {
    const before = await TherapieEms.findById(req.params.id).lean();
    const updatedDoc = await TherapieEms.findByIdAndUpdate(req.params.id, update, { new: true });
    const updated = updatedDoc ? updatedDoc.toObject() : null;

    await logAudit({
      req,
      action: "update",
      entity: "therapie-ems",
      entityId: req.params.id,
      before,
      after: updated
    });
  } catch (err) {
    console.warn("Erreur modification therapie EMS (DB):", err.message);
  }

  const redirectUrl = token ? `/therapie-ems?token=${encodeURIComponent(token)}` : "/therapie-ems";
  res.redirect(redirectUrl);
};

exports.toggleCompleted = async (req, res) => {
  const token = req.body?.token || req.query?.token || "";
  const completed = req.body?.isCompleted === "on" || req.body?.isCompleted === "true";

  try {
    const before = await TherapieEms.findById(req.params.id).lean();
    const updatedDoc = await TherapieEms.findByIdAndUpdate(
      req.params.id,
      {
        isCompleted: completed,
        completedAt: completed ? new Date() : null
      },
      { new: true }
    );
    const updated = updatedDoc ? updatedDoc.toObject() : null;

    await logAudit({
      req,
      action: "update",
      entity: "therapie-ems",
      entityId: req.params.id,
      before,
      after: updated
    });
  } catch (err) {
    console.warn("Erreur mise a jour statut therapie EMS (DB):", err.message);
  }

  const redirectUrl = token ? `/therapie-ems?token=${encodeURIComponent(token)}` : "/therapie-ems";
  res.redirect(redirectUrl);
};

exports.remove = async (req, res) => {
  const token = req.body?.token || req.query?.token || "";

  try {
    const removedDoc = await TherapieEms.findByIdAndDelete(req.params.id);
    const removed = removedDoc ? removedDoc.toObject() : null;

    await logAudit({
      req,
      action: "delete",
      entity: "therapie-ems",
      entityId: req.params.id,
      before: removed
    });
  } catch (err) {
    console.warn("Erreur suppression therapie EMS (DB):", err.message);
  }

  const redirectUrl = token ? `/therapie-ems?token=${encodeURIComponent(token)}` : "/therapie-ems";
  res.redirect(redirectUrl);
};
