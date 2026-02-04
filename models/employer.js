const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    grade: { type: String, default: "", trim: true },
    dateEmbauche: { type: Date, default: null },
    photoUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employer", EmployerSchema);
