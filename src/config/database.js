const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI manquant – mode développement sans MongoDB (sessions/users en mémoire).");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.warn("⚠️  MongoDB non disponible – mode développement sans DB persistante");
    console.warn("   Erreur:", err.message);
  }
};
