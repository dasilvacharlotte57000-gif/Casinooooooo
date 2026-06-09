const TherapieEms = require("../models/therapieEms");
const Blacklist = require("../models/blacklist");
const BlacklistHistory = require("../models/blacklistHistory");
const initCloudinary = require("../config/cloudinary");
const { logAudit } = require("../utils/auditLogger");

function buildEmsBlacklistReason(raison) {
  const base = (raison || "").trim();
  return base ? `Therapie EMS - ${base}` : "Therapie EMS en attente";
}

async function createEmsBlacklistEntry({ prenom, nom, raison, photoUrl }) {
  const created = await Blacklist.create({
    prenom,
    nom,
    raison: buildEmsBlacklistReason(raison),
    expireAt: null,
    permanent: true,
    photoUrl: photoUrl || ""
  });
  return created;
}

async function removeBlacklistEntryWithHistory(entryId) {
  if (!entryId) return null;

  const removedDoc = await Blacklist.findByIdAndDelete(entryId);
  const removed = removedDoc ? removedDoc.toObject() : null;

  if (!removed) return null;

  await BlacklistHistory.create({
    prenom: removed.prenom,
    nom: removed.nom,
    raison: removed.raison || "",
    addedAt: removed.createdAt,
    expireAt: removed.expireAt || null,
    permanent: removed.permanent,
    photoUrl: removed.photoUrl || "",
    removedAt: new Date(),
    removalType: "manual"
  });

  return removed;
}

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

    let blacklistEntryId = "";
    try {
      const bl = await createEmsBlacklistEntry({
        prenom,
        nom,
        raison,
        photoUrl: finalPhotoUrl
      });
      blacklistEntryId = bl?._id?.toString() || "";

      if (blacklistEntryId) {
        await TherapieEms.findByIdAndUpdate(created._id, { blacklistEntryId });
      }

      await logAudit({
        req,
        action: "create",
        entity: "blacklist",
        entityId: blacklistEntryId,
        after: bl
      });
    } catch (syncErr) {
      console.warn("Erreur sync blacklist apres creation therapie EMS:", syncErr.message);
    }

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

    if (updated?.blacklistEntryId && !updated.isCompleted) {
      const blUpdate = {
        prenom: updated.prenom,
        nom: updated.nom,
        raison: buildEmsBlacklistReason(updated.raison),
        permanent: true,
        expireAt: null
      };
      if (updated.photoUrl) blUpdate.photoUrl = updated.photoUrl;

      try {
        await Blacklist.findByIdAndUpdate(updated.blacklistEntryId, blUpdate);
      } catch (syncErr) {
        console.warn("Erreur sync update blacklist depuis therapie EMS:", syncErr.message);
      }
    }

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

    // Quand la thérapie est validée, on retire l'entrée de blacklist liée.
    if (completed && updated?.blacklistEntryId) {
      try {
        const removedBlacklist = await removeBlacklistEntryWithHistory(updated.blacklistEntryId);
        if (removedBlacklist) {
          await logAudit({
            req,
            action: "delete",
            entity: "blacklist",
            entityId: updated.blacklistEntryId,
            before: removedBlacklist
          });
        }
      } catch (syncErr) {
        console.warn("Erreur retrait blacklist apres therapie validee:", syncErr.message);
      }
    }

    // Si on décoche (retour en attente), on remet en blacklist permanente.
    if (!completed && updated) {
      let stillExists = null;
      if (updated.blacklistEntryId) {
        stillExists = await Blacklist.findById(updated.blacklistEntryId).lean();
      }

      if (!stillExists) {
        try {
          const bl = await createEmsBlacklistEntry({
            prenom: updated.prenom,
            nom: updated.nom,
            raison: updated.raison,
            photoUrl: updated.photoUrl
          });

          const newBlacklistEntryId = bl?._id?.toString() || "";
          if (newBlacklistEntryId) {
            await TherapieEms.findByIdAndUpdate(req.params.id, { blacklistEntryId: newBlacklistEntryId });
            updated.blacklistEntryId = newBlacklistEntryId;
          }

          await logAudit({
            req,
            action: "create",
            entity: "blacklist",
            entityId: newBlacklistEntryId,
            after: bl
          });
        } catch (syncErr) {
          console.warn("Erreur re-ajout blacklist apres decochage therapie:", syncErr.message);
        }
      }
    }

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

    if (removed?.blacklistEntryId) {
      try {
        const removedBlacklist = await removeBlacklistEntryWithHistory(removed.blacklistEntryId);
        if (removedBlacklist) {
          await logAudit({
            req,
            action: "delete",
            entity: "blacklist",
            entityId: removed.blacklistEntryId,
            before: removedBlacklist
          });
        }
      } catch (syncErr) {
        console.warn("Erreur sync suppression blacklist lors suppression therapie EMS:", syncErr.message);
      }
    }

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
