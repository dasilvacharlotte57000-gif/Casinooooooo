const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { verifyToken } = require("./utils/authToken");

// Charge le .env à la racine du workspace (utile quand npm est lancé depuis /src)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./config/database");
const protectRoutes = require("./middlewares/protectRoutes");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const blacklistRoutes = require("./routes/blacklistRoutes");
const partenariatEmployerRoutes = require("./routes/partenariatEmployerRoutes");
const partenariatEntrepriseRoutes = require("./routes/partenariatEntrepriseRoutes");
const employeurRoutes = require("./routes/employeurRoutes");
const menuRoutes = require("./routes/menuRoutes");
const reglementRoutes = require("./routes/reglementRoutes");
const avertissementRoutes = require("./routes/avertissementRoutes");
const therapieEmsRoutes = require("./routes/therapieEmsRoutes");

// ── Migration : importe les anciennes suppressions blacklist depuis l'audit log ──
async function migrateBlacklistHistory() {
  try {
    const AuditLog         = require("./models/auditLog");
    const BlacklistHistory = require("./models/blacklistHistory");

    const deleteLogs = await AuditLog.find({ entity: "blacklist", action: "delete" })
      .sort({ createdAt: 1 })
      .lean();

    if (deleteLogs.length === 0) return;

    let imported = 0;
    for (const log of deleteLogs) {
      const before = log.changes?.before;
      if (!before?.prenom || !before?.nom) continue;

      const ts = new Date(log.createdAt);
      const already = await BlacklistHistory.findOne({
        prenom:    { $regex: new RegExp(`^${before.prenom}$`, "i") },
        nom:       { $regex: new RegExp(`^${before.nom}$`, "i") },
        removedAt: { $gte: new Date(ts - 60000), $lte: new Date(ts.getTime() + 60000) }
      });
      if (already) continue;

      await BlacklistHistory.create({
        prenom:      before.prenom,
        nom:         before.nom,
        raison:      before.raison      || "",
        addedAt:     before.createdAt   ? new Date(before.createdAt) : ts,
        expireAt:    before.expireAt    ? new Date(before.expireAt)  : null,
        permanent:   before.permanent   || false,
        photoUrl:    before.photoUrl    || "",
        removedAt:   ts,
        removalType: "manual"
      });
      imported++;
    }
    if (imported > 0) {
      console.log(`✅ Migration blacklist history : ${imported} ancienne(s) entrée(s) importée(s)`);
    }
  } catch (err) {
    console.warn("⚠️  Migration blacklist history ignorée :", err.message);
  }
}

const app = express();

// Render/Proxy HTTPS : nécessaire pour que les cookies secure soient acceptés
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Views + static (tout est dans src/)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

(async () => {
  try {
    // DB
    await connectDB();

    // Migration one-shot : récupère les anciennes suppressions depuis l'audit log
    await migrateBlacklistHistory();

    // User from token (no cookies)
    app.use((req, res, next) => {
      const auth = req.headers.authorization || "";
      const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      const token = req.query.token || req.body?.token || req.cookies?.admin_token || bearer || null;
      const payload = token ? verifyToken(token) : null;

      req.user = payload
        ? {
            id: payload.sub,
            email: payload.email,
            admin: payload.admin === true
          }
        : null;
      res.locals.currentPath = req.path;
      res.locals.user = req.user;
      res.locals.authToken = payload ? token : null;
      next();
    });

    // HOME public
    app.get("/", (req, res) => res.render("home"));

    // AUTH public
    app.use("/", authRoutes);

    // ADMIN console (login public, console protegee)
    app.use("/admin", adminRoutes);

    // ✅ Pages publiques en lecture (AVANT la protection globale)
    app.use("/blacklist", blacklistRoutes);
    app.use("/employes", partenariatEmployerRoutes);
    app.use("/entreprises", partenariatEntrepriseRoutes);
    app.use("/employeurs", employeurRoutes);
    app.use("/menu", menuRoutes);
    app.use("/reglement", reglementRoutes);
    app.use("/therapie-ems", therapieEmsRoutes);

    // 🔒 MIDDLEWARE DE PROTECTION GLOBAL (pour tout ce qui suit)
    app.use(protectRoutes);

    // 🔒 Pages protégées
    app.get("/dashboard", (req, res) => res.render("dashboard"));
    app.use("/avertissements", avertissementRoutes);

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, "0.0.0.0", () => console.log("✅ Serveur lancé sur", PORT));
  } catch (err) {
    console.error("❌ ERREUR LORS DU DÉMARRAGE:", err);
    process.exit(1);
  }
})();
