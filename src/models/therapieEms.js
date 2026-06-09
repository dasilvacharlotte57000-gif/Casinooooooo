const mongoose = require("mongoose");

const TherapieEmsSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    raison: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "", trim: true },
    blacklistEntryId: { type: String, default: "", trim: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TherapieEms", TherapieEmsSchema);
