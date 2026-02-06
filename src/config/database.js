const mongoose = require("mongoose");

async function tryConnect(uri, attempts = 5, baseDelayMs = 1000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await mongoose.connect(uri);
      console.log("✅ MongoDB connecté");
      return true;
    } catch (err) {
      console.warn(`Tentative ${i}/${attempts} pour MongoDB échouée: ${err.message}`);
      if (i === attempts) {
        console.warn("⚠️  MongoDB non disponible — abandonné après plusieurs tentatives.");
        return false;
      }
      const delay = baseDelayMs * i;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return false;
}

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI manquant – mode développement sans MongoDB (sessions/users en mémoire).");
    return false;
  }

  // Essayer plusieurs fois avant d'abandonner (utile en CI/containers qui démarrent DB après)
  return await tryConnect(uri, 5, 1000);
};
