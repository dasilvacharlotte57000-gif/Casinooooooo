const AuditLog = require("../models/auditLog");
const { createToken } = require("../utils/authToken");

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

exports.getLogin = (req, res) => {
  res.render("admin_login", { error: null });
};

exports.postLogin = (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_CONSOLE_PASSWORD;

  if (!adminPass) {
    return res.status(500).render("admin_login", {
      error: "Console admin non configuree"
    });
  }

  if (!password || password !== adminPass) {
    return res.status(401).render("admin_login", {
      error: "Mot de passe invalide"
    });
  }

  const adminEmail = process.env.ADMIN_CONSOLE_EMAIL || "admin@console.local";
  const token = createToken({ sub: "console-admin", email: adminEmail, admin: true });
  return res.redirect(`/admin?token=${encodeURIComponent(token)}`);
};

exports.listAudit = async (req, res) => {
  const { action, entity, actor, q, from, to } = req.query;
  const limitRaw = Number(req.query.limit || 200);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 50), 1000) : 200;

  const query = {};

  if (action) query.action = action;
  if (entity) query.entity = entity;
  if (actor) query.actorEmail = { $regex: actor, $options: "i" };

  const fromDate = toDateOrNull(from);
  const toDate = toDateOrNull(to);
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = fromDate;
    if (toDate) query.createdAt.$lte = toDate;
  }

  if (q) {
    query.$or = [
      { entityId: { $regex: q, $options: "i" } },
      { actorEmail: { $regex: q, $options: "i" } },
      { actorId: { $regex: q, $options: "i" } },
      { ip: { $regex: q, $options: "i" } },
      { userAgent: { $regex: q, $options: "i" } },
      { changesText: { $regex: q, $options: "i" } }
    ];
  }

  let items = [];
  try {
    items = await AuditLog.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  } catch (err) {
    console.warn("AuditLog indisponible:", err.message);
  }

  res.render("admin", {
    items,
    filters: {
      action: action || "",
      entity: entity || "",
      actor: actor || "",
      q: q || "",
      from: from || "",
      to: to || "",
      limit
    },
    actions: ["create", "update", "delete"],
    entities: ["blacklist", "employeur", "employer", "entreprise", "avertissement"]
  });
};
