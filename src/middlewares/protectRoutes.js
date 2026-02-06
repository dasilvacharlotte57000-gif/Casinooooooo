module.exports = function protectRoutes(req, res, next) {
  console.log('Session actuelle:', req.session);
  // Routes totalement publiques
  const fullyPublic = ["/", "/login", "/logout"];

  // Préfixes en lecture publique
  const publicPrefixes = ["/blacklist", "/employes", "/entreprises", "/employeurs"];

  // Autoriser home/login/logout
  if (fullyPublic.includes(req.path)) return next();

  // Autoriser uniquement les GET sur ces 3 sections, même déconnecté
  const isPublicSection = publicPrefixes.some(
    (p) => req.path === p || req.path.startsWith(p + "/")
  );

  if (isPublicSection && req.method === "GET") return next();

  // Sinon -> il faut être connecté
  if (!req.user) return res.redirect("/login");

  next();
};
