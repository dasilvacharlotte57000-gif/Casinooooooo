const mongoose = require("mongoose");

const AvertissementSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    type: { type: String, enum: ["temporaire", "definitif"], required: true },
    expireAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avertissement", AvertissementSchema);
