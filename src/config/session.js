const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = async function createSessionMiddleware() {
  const secret = process.env.SESSION_SECRET;
  const mongoUrl = process.env.MONGODB_URI;

  if (!secret) throw new Error("SESSION_SECRET manquant");
  if (!mongoUrl) throw new Error("MONGODB_URI manquant");

  return session({
    name: "casino.sid",
    secret,
    resave: false,
    saveUninitialized: false,
    // Garder la session persistante côté client (cookie) pendant 30 jours
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 jours en ms
    },
    // TTL du store doit correspondre à la durée du cookie (en secondes)
    store: MongoStore.create({
      mongoUrl,
      ttl: 60 * 60 * 24 * 30 // 30 jours
    })
  });
};
