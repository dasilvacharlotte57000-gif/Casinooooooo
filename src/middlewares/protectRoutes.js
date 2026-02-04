module.exports = function protectRoutes(req, res, next) {
  const publicPaths = ["/login", "/logout"];
  if (publicPaths.includes(req.path)) return next();

  if (!req.session.userId) return res.redirect("/login");
  next();
};
