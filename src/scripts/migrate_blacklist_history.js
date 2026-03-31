/**
 * Script de migration : peuple BlacklistHistory à partir des logs d'audit.
 * Récupère toutes les suppressions de blacklist effectuées AVANT la mise en
 * place du système d'historique automatique.
 *
 * Usage : node src/scripts/migrate_blacklist_history.js
 */

const path   = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const mongoose      = require("mongoose");
const connectDB     = require("../config/database");
const AuditLog      = require("../models/auditLog");
const BlacklistHistory = require("../models/blacklistHistory");

async function run() {
  await connectDB();
  console.log("✅ Connecté à MongoDB\n");

  // Toutes les suppressions de blacklist dans les logs
  const deleteLogs = await AuditLog.find({
    entity: "blacklist",
    action: "delete"
  }).sort({ createdAt: 1 }).lean();

  console.log(`📋 ${deleteLogs.length} suppression(s) trouvée(s) dans les logs d'audit\n`);

  let inserted = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const log of deleteLogs) {
    const before = log.changes?.before;
    if (!before || !before.prenom || !before.nom) {
      console.warn(`  ⚠️  Log ${log._id} — pas de données 'before', ignoré`);
      skipped++;
      continue;
    }

    // Évite les doublons : même entityId déjà importé
    const exists = await BlacklistHistory.findOne({
      prenom:   { $regex: new RegExp(`^${before.prenom}$`, "i") },
      nom:      { $regex: new RegExp(`^${before.nom}$`, "i") },
      addedAt:  before.createdAt ? new Date(before.createdAt) : undefined,
      removedAt: { $gte: new Date(log.createdAt.getTime() - 60000),
                   $lte: new Date(log.createdAt.getTime() + 60000) }
    });

    if (exists) {
      console.log(`  ⏭️  ${before.prenom} ${before.nom} — déjà dans l'historique, ignoré`);
      skipped++;
      continue;
    }

    try {
      await BlacklistHistory.create({
        prenom:      before.prenom,
        nom:         before.nom,
        raison:      before.raison || "",
        addedAt:     before.createdAt ? new Date(before.createdAt) : log.createdAt,
        expireAt:    before.expireAt  ? new Date(before.expireAt)  : null,
        permanent:   before.permanent || false,
        photoUrl:    before.photoUrl  || "",
        removedAt:   log.createdAt,
        removalType: "manual"
      });
      inserted++;
      console.log(`  ✅ Importé : ${before.prenom} ${before.nom} (supprimé le ${new Date(log.createdAt).toLocaleDateString("fr-FR")})`);
    } catch (err) {
      errors++;
      console.error(`  ❌ Erreur pour ${before.prenom} ${before.nom} :`, err.message);
    }
  }

  console.log(`\n📊 Résultat :`);
  console.log(`   Importés  : ${inserted}`);
  console.log(`   Ignorés   : ${skipped}`);
  console.log(`   Erreurs   : ${errors}`);

  await mongoose.disconnect();
  console.log("\n🔌 Déconnecté. Migration terminée.");
}

run().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
