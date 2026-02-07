const Blacklist = require("../models/blacklist");
const initCloudinary = require("../config/cloudinary");

exports.list = async (req, res) => {
  try {
    // Auto-clean expired entries before listing
    await Blacklist.deleteMany({
      permanent: { $ne: true },
      expireAt: { $ne: null, $lte: new Date() }
    });
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
    await Blacklist.create({
      prenom,
      nom,
      raison: raison || "",
      expireAt: !isPermanent && expireAt ? new Date(expireAt) : null,
      permanent: isPermanent,
      photoUrl: finalPhotoUrl
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
    await Blacklist.findByIdAndUpdate(req.params.id, update);
  } catch (err) {
    console.warn("Erreur modification blacklist (DB):", err.message);
  }

  const redirectUrl = token ? `/blacklist?token=${encodeURIComponent(token)}` : "/blacklist";
  res.redirect(redirectUrl);
};

exports.remove = async (req, res) => {
  const token = req.body?.token || req.query?.token || "";
  try {
    await Blacklist.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.warn("Erreur suppression blacklist (DB):", err.message);
  }
  const redirectUrl = token ? `/blacklist?token=${encodeURIComponent(token)}` : "/blacklist";
  res.redirect(redirectUrl);
};
