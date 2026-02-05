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

// VIEWS + STATIC
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// currentPath + user pour navbar
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.user = req.session?.userId || null;
  next();
});

(async () => {
  await connectDB();
  const sessionMiddleware = await createSessionMiddleware();
  app.use(sessionMiddleware);

  /* =========================
     ROUTES PUBLIQUES
  ========================== */

  // HOME PUBLIC
  app.get("/", (req, res) => {
    res.render("home");
  });

  // LOGIN / LOGOUT
  app.use("/", authRoutes);

  /* =========================
     ROUTES PROTÉGÉES
  ========================== */
  app.use(protectRoutes);

  app.get("/dashboard", (req, res) => {
    res.render("dashboard");
  });

  app.use("/blacklist", blacklistRoutes);
  app.use("/employes", partenariatEmployerRoutes);
  app.use("/entreprises", partenariatEntrepriseRoutes);

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => console.log("Serveur lancé sur", PORT));
})();
