const mongoose = require("mongoose");

const BlacklistHistorySchema = new mongoose.Schema(
  {
    prenom:      { type: String, required: true, trim: true },
    nom:         { type: String, required: true, trim: true },
    raison:      { type: String, default: "", trim: true },
    addedAt:     { type: Date, required: true },
    expireAt:    { type: Date, default: null },
    permanent:   { type: Boolean, default: false },
    photoUrl:    { type: String, default: "", trim: true },
    removedAt:   { type: Date, default: Date.now },
    removalType: { type: String, enum: ["expired", "manual"], default: "manual" }
  },
  { timestamps: true }
);

// Index pour la recherche par nom+prenom (insensible à la casse)
BlacklistHistorySchema.index({ nom: 1, prenom: 1 });

module.exports = mongoose.model("BlacklistHistory", BlacklistHistorySchema);
