const mongoose = require("mongoose");

const AvertissementSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    motif: { type: String, default: "", trim: true },
    grade: {
      type: String,
      enum: [
        "stagiaire",
        "agent polyvalent",
        "agent polyvalent confirme",
        "responsable securite",
        "manager",
        "adjoint de direction"
      ],
      default: "stagiaire"
    },
    type: { type: String, enum: ["temporaire", "definitif"], required: true },
    expireAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avertissement", AvertissementSchema);
