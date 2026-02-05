const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const connectDB = require("./config/database");
const createSessionMiddleware = require("./config/session");
const protectRoutes = require("./middlewares/protectRoutes");

const authRoutes = require("./routes/authRoutes");
const blacklistRoutes = require("./routes/blacklistRoutes");
const partenariatEmployerRoutes = require("./routes/partenariatEmployerRoutes");
const partenariatEntrepriseRoutes = require("./routes/partenariatEntrepriseRoutes");

const app = express();

// 🔥 IMPORTANT POUR RENDER (HTTPS + sessions)
app.set("trust proxy", 1);

// 🔥 VIEWS & STATIC (FIX DEFINITIF)
app.set("view engine", "ejs");
app.set("views", [
  path.join(process.cwd(), "views"),
  path.join(process.cwd(), "views", "partials")
]);

app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Pour la navbar / active link
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

(async () => {
  // DB
  await connectDB();

  // Sessions
  const sessionMiddleware = await createSessionMiddleware();
  app.use(sessionMiddleware);

  // Session dispo dans EJS
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

  // 🔓 Routes publiques
  app.use("/", authRoutes);

  // 🔒 Routes privées
  app.use(protectRoutes);

  app.get("/dashboard", (req, res) => res.render("dashboard"));
  app.use("/blacklist", blacklistRoutes);
  app.use("/employes", partenariatEmployerRoutes);
  app.use("/entreprises", partenariatEntrepriseRoutes);

  // Home
  app.get("/", (req, res) => {
    if (req.session && req.session.userId) return res.redirect("/dashboard");
    return res.redirect("/login");
  });

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log("Serveur lancé sur", PORT);
  });
})();
