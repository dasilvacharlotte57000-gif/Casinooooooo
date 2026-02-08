const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema(
  {
    entrepriseName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employer", EmployerSchema);
