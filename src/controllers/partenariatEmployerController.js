const Employer = require("../models/employer");
const initCloudinary = require("../config/cloudinary");

exports.list = async (req, res) => {
  try {
    const items = await Employer.find().sort({ createdAt: -1 }).lean();
    return res.render("employes", { items });
  } catch (err) {
    console.warn("DB non disponible — affichage des employés vide", err.message);
    return res.render("employes", { items: [] });
  }
};

exports.create = async (req, res) => {
  const { entrepriseName, description } = req.body;

  let photoUrl = "";
  if (req.file) {
    try {
      const cloudinary = initCloudinary();
      const b64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;

      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: "casino/employes"
      });

      photoUrl = uploaded.secure_url;
    } catch (err) {
      console.warn("Erreur upload photo (Cloudinary):", err.message);
    }
  }

  try {
    await Employer.create({
      entrepriseName,
      description: description || "",
      photoUrl
    });
  } catch (err) {
    console.warn("Erreur création employé (DB):", err.message);
  }

  res.redirect("/employes");
};

exports.remove = async (req, res) => {
  try {
    await Employer.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.warn("Erreur suppression employé (DB):", err.message);
  }
  res.redirect("/employes");
};
