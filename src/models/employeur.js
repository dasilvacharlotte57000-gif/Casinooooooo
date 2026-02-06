const mongoose = require("mongoose");

const EmployeurSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    dateEntree: { type: Date, default: null },
    photoUrl: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employeur", EmployeurSchema);
