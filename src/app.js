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

app.set("trust proxy", 1);

// Views + static (Render safe)
app.set("view engine", "ejs");
app.set("views", [path.join(process.cwd(), "views"), path.join(process.cwd(), "views", "partials")]);
app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

(async () => {
  await connectDB();

  const sessionMiddleware = await createSessionMiddleware();
  app.use(sessionMiddleware);

  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

  // ✅ HOME PUBLIQUE (quand tu ouvres le site)
  app.get("/", (req, res) => res.render("home"));

  // ✅ AUTH (login/logout) public
  app.use("/", authRoutes);

  // ✅ PROTECTION UNIQUEMENT SUR LE PANEL
  app.use("/dashboard", protectRoutes);
  app.use("/blacklist", protectRoutes);
  app.use("/employes", protectRoutes);
  app.use("/entreprises", protectRoutes);

  // Panel routes
  app.get("/dashboard", (req, res) => res.render("dashboard"));
  app.use("/blacklist", blacklistRoutes);
  app.use("/employes", partenariatEmployerRoutes);
  app.use("/entreprises", partenariatEntrepriseRoutes);

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => console.log("Serveur lancé sur", PORT));
})();
