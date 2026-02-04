const Employer = require("../models/employer");
const initCloudinary = require("../config/cloudinary");

exports.list = async (req, res) => {
  const items = await Employer.find().sort({ createdAt: -1 }).lean();
  res.render("employes", { items });
};

exports.create = async (req, res) => {
  const { prenom, nom, grade, dateEmbauche } = req.body;

  let photoUrl = "";
  if (req.file) {
    const cloudinary = initCloudinary();
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "casino/employes"
    });

    photoUrl = uploaded.secure_url;
  }

  await Employer.create({
    prenom,
    nom,
    grade: grade || "",
    dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : null,
    photoUrl
  });

  res.redirect("/employes");
};

exports.remove = async (req, res) => {
  await Employer.findByIdAndDelete(req.params.id);
  res.redirect("/employes");
};
