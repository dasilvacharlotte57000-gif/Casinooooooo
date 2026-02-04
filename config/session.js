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
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    },
    store: MongoStore.create({
      mongoUrl,
      ttl: 60 * 60 * 24 * 7 // 7 jours
    })
  });
};
