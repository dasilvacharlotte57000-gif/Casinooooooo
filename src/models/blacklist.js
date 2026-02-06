const mongoose = require("mongoose");

const BlacklistSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    raison: { type: String, default: "", trim: true },
    expireAt: { type: Date, default: null },
    photoUrl: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blacklist", BlacklistSchema);
