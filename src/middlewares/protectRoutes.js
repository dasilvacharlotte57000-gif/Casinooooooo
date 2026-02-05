module.exports = function protectRoutes(req, res, next) {
  // Routes totalement publiques
  const fullyPublic = ["/", "/login", "/logout"];

  // Préfixes publics (lecture)
  const publicPrefixes = ["/blacklist", "/employes", "/entreprises"];

  // Autorise les routes publiques
  if (fullyPublic.includes(req.path)) return next();
  if (publicPrefixes.some((p) => req.path === p || req.path.startsWith(p + "/"))) {
    // MAIS on bloque les méthodes qui modifient si pas connecté
    if (req.method === "GET") return next();
  }

  // Si pas connecté → redirige login
  if (!req.session.userId) return res.redirect("/login");

  next();
};
