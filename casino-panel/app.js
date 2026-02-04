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

// Views + static
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// currentPath pour navbar
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

(async () => {
  // DB
  await connectDB();

  // Session
  const sessionMiddleware = await createSessionMiddleware();
  app.use(sessionMiddleware);

  // session dans EJS
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

  // Routes publiques
  app.use("/", authRoutes);

  // Routes privées
  app.use(protectRoutes);
  app.get("/dashboard", (req, res) => res.render("dashboard"));

  app.use("/blacklist", blacklistRoutes);
  app.use("/employes", partenariatEmployerRoutes);
  app.use("/entreprises", partenariatEntrepriseRoutes);

  // Home -> dashboard
  app.get("/", (req, res) => res.redirect("/dashboard"));

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log("Serveur lancé sur", PORT));
})();
