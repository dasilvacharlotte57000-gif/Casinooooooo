const session = require("express-session");

module.exports = async function createSessionMiddleware() {
  let secret = process.env.SESSION_SECRET;
  const mongoUrl = process.env.MONGODB_URI;

  if (!secret) {
    console.warn("SESSION_SECRET manquant – utilisation d'un secret de dev (ne pas utiliser en production).");
    secret = "dev-secret";
  }

  const options = {
    name: "casino.sid",
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 jours en ms
    }
  };

  // Ne pas utiliser MongoStore si MongoDB n'est pas disponible
  if (mongoUrl) {
    try {
      const MongoStore = require("connect-mongo");
      options.store = MongoStore.create({
        mongoUrl,
        ttl: 60 * 60 * 24 * 30 // 30 jours
      });
      console.log("✅ Session store connecté à MongoDB");
    } catch (err) {
      console.warn("⚠️  MongoStore non disponible – sessions en mémoire:", err.message);
    }
  } else {
    console.warn("MONGODB_URI manquant – sessions stockées en mémoire (reset lors du redémarrage).");
  }

  return session(options);
};
