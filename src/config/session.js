const session = require("express-session");
const mongoose = require("mongoose");

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

  // Si une URL Mongo existe, n'utiliser MongoStore que si Mongoose est déjà connecté
  if (mongoUrl) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
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
      console.warn("MongoDB non connecté – sessions en mémoire (skip MongoStore)");
    }
  } else {
    console.warn("MONGODB_URI manquant – sessions stockées en mémoire (reset lors du redémarrage).");
  }

  return session(options);
};
