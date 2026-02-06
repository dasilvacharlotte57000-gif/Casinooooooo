const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Charge le .env à la racine du workspace (utile quand npm est lancé depuis /src)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./config/database");
const createSessionMiddleware = require("./config/session");
const protectRoutes = require("./middlewares/protectRoutes");

const authRoutes = require("./routes/authRoutes");
const blacklistRoutes = require("./routes/blacklistRoutes");
const partenariatEmployerRoutes = require("./routes/partenariatEmployerRoutes");
const partenariatEntrepriseRoutes = require("./routes/partenariatEntrepriseRoutes");

const app = express();

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

    // Session (DOIT être avant les routes)
    const sessionMiddleware = await createSessionMiddleware();
    app.use(sessionMiddleware);

    // Locals EJS
    app.use((req, res, next) => {
      res.locals.currentPath = req.path;
      res.locals.user = req.session?.userId
        ? { id: req.session.userId, email: req.session.email }
        : null;
      next();
    });

    // HOME public
    app.get("/", (req, res) => res.render("home"));

    // AUTH public
    app.use("/", authRoutes);

    // ✅ Pages publiques en lecture (AVANT la protection globale)
    app.use("/blacklist", blacklistRoutes);
    app.use("/employes", partenariatEmployerRoutes);
    app.use("/entreprises", partenariatEntrepriseRoutes);

    // 🔒 MIDDLEWARE DE PROTECTION GLOBAL (pour tout ce qui suit)
    app.use(protectRoutes);

    // 🔒 Pages protégées
    app.get("/dashboard", (req, res) => res.render("dashboard"));

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, "0.0.0.0", () => console.log("✅ Serveur lancé sur", PORT));
  } catch (err) {
    console.error("❌ ERREUR LORS DU DÉMARRAGE:", err);
    process.exit(1);
  }
})();
