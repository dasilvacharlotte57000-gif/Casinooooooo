const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI manquant – mode développement sans MongoDB (sessions/users en mémoire).");
    return;
  }

  await mongoose.connect(uri);
  console.log("MongoDB connecté");
};
