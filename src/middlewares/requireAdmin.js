module.exports = function requireAdmin(req, res, next) {
  if (req.user && req.user.admin === true) return next();
  return res.redirect("/admin/login");
};
