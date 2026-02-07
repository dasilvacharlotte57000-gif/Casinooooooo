const Blacklist = require("../models/blacklist");
const initCloudinary = require("../config/cloudinary");

exports.list = async (req, res) => {
  try {
    // Auto-clean expired entries before listing
    await Blacklist.deleteMany({ expireAt: { $ne: null, $lte: new Date() } });
    const items = await Blacklist.find().sort({ createdAt: -1 }).lean();
    return res.render("blacklist", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage de la blacklist vide", err.message);
    return res.render("blacklist", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { prenom, nom, raison, expireAt, photoUrl } = req.body;
  let finalPhotoUrl = photoUrl || "";
  const token = req.body?.token || req.query?.token || "";

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
      expireAt: expireAt ? new Date(expireAt) : null,
      photoUrl: finalPhotoUrl
    });
  } catch (err) {
    console.warn("Erreur création blacklist (DB):", err.message);
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
