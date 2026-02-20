const AuditLog = require("../models/auditLog");

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (err) {
    return "";
  }
}

function normalizeDoc(value) {
  if (!value) return null;
  if (typeof value.toObject === "function") return value.toObject();
  return value;
}

async function logAudit({ req, action, entity, entityId, before, after }) {
  try {
    const actorId = req?.user?.id || "";
    const actorEmail = req?.user?.email || "";
    const ip =
      (req?.headers && req.headers["x-forwarded-for"]) ||
      req?.ip ||
      req?.connection?.remoteAddress ||
      "";
    const userAgent = (req?.headers && req.headers["user-agent"]) || "";

    const changes = {
      before: normalizeDoc(before),
      after: normalizeDoc(after)
    };
    const changesText = safeStringify(changes);

    await AuditLog.create({
      action,
      entity,
      entityId: entityId || "",
      actorId,
      actorEmail,
      ip,
      userAgent,
      changes,
      changesText
    });
  } catch (err) {
    console.warn("AuditLog indisponible:", err.message);
  }
}

module.exports = { logAudit };
