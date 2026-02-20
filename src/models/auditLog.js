const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: "" },
    actorId: { type: String, default: "" },
    actorEmail: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    changes: { type: Object, default: {} },
    changesText: { type: String, default: "" }
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entity: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
