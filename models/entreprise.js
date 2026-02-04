const mongoose = require("mongoose");

const EntrepriseSchema = new mongoose.Schema(
  {
    nomEntreprise: { type: String, required: true, trim: true },
    contactNom: { type: String, default: "", trim: true },
    contactEmail: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entreprise", EntrepriseSchema);
