const Employeur = require("../models/employeur");
const { logAudit } = require("../utils/auditLogger");

// Liste avec filtres et recherche
exports.list = async (req, res) => {
  try {
    const { search, departement, grade, sort = '-createdAt' } = req.query;
    
    let query = {};
    
    // Recherche textuelle
    if (search && search.trim()) {
      query.$or = [
        { prenom: { $regex: search, $options: 'i' } },
        { nom: { $regex: search, $options: 'i' } },
        { poste: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { grade: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par département
    if (departement && departement !== '') {
      query.departement = departement;
    }
    
    // Filtre par grade
    if (grade && grade !== '') {
      query.grade = grade;
    }
    
    const items = await Employeur.find(query).sort(sort).lean();
    
    // Statistiques par grade
    const stats = {
      total: items.length,
      parGrade: items.reduce((acc, e) => {
        const g = e.grade || 'Non défini';
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.render("employeurs", { 
      items, 
      stats,
      filters: { search, departement, grade, sort }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des employeurs:", error);
    res.status(500).send("Erreur serveur");
  }
};

// Créer un employeur
exports.create = async (req, res) => {
  try {
    const { 
      prenom, nom, email, telephone, poste, grade, departement, 
      salaire, dateEntree, photoUrl, notes, token 
    } = req.body;

    const created = await Employeur.create({
      prenom,
      nom,
      email: email || undefined,
      telephone: telephone || "",
      poste: poste || "",
      grade: grade || "",
      departement: departement || "",
      salaire: salaire ? parseFloat(salaire) : null,
      dateEntree: dateEntree ? new Date(dateEntree) : null,
      photoUrl: photoUrl || "",
      notes: notes || ""
    });
    await logAudit({
      req,
      action: "create",
      entity: "employeur",
      entityId: created?._id?.toString(),
      after: created
    });

    const redirectUrl = token ? `/employeurs?token=${encodeURIComponent(token)}` : "/employeurs";
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    if (error.code === 11000) {
      return res.status(400).send("Cette adresse email est déjà utilisée");
    }
    res.status(500).send("Erreur lors de la création");
  }
};

// Obtenir un employeur (pour édition)
exports.getOne = async (req, res) => {
  try {
    const item = await Employeur.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ error: "Employeur non trouvé" });
    }
    res.json(item);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour un employeur
exports.update = async (req, res) => {
  try {
    const { 
      prenom, nom, email, telephone, poste, grade, departement, 
      salaire, dateEntree, dateDepart, photoUrl, notes, token 
    } = req.body;

    const updateData = {
      prenom,
      nom,
      email: email || undefined,
      telephone: telephone || "",
      poste: poste || "",
      grade: grade || "",
      departement: departement || "",
      salaire: salaire ? parseFloat(salaire) : null,
      dateEntree: dateEntree ? new Date(dateEntree) : null,
      dateDepart: dateDepart ? new Date(dateDepart) : null,
      photoUrl: photoUrl || "",
      notes: notes || ""
    };

    const before = await Employeur.findById(req.params.id).lean();
    const updatedDoc = await Employeur.findByIdAndUpdate(req.params.id, updateData, { new: true });
    const updated = updatedDoc ? updatedDoc.toObject() : null;
    await logAudit({
      req,
      action: "update",
      entity: "employeur",
      entityId: req.params.id,
      before,
      after: updated
    });
    const redirectUrl = token ? `/employeurs?token=${encodeURIComponent(token)}` : "/employeurs";
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    if (error.code === 11000) {
      return res.status(400).send("Cette adresse email est déjà utilisée");
    }
    res.status(500).send("Erreur lors de la mise à jour");
  }
};

// Supprimer un employeur
exports.remove = async (req, res) => {
  try {
    const { token } = req.body;
    const removedDoc = await Employeur.findByIdAndDelete(req.params.id);
    const removed = removedDoc ? removedDoc.toObject() : null;
    await logAudit({
      req,
      action: "delete",
      entity: "employeur",
      entityId: req.params.id,
      before: removed
    });
    const redirectUrl = token ? `/employeurs?token=${encodeURIComponent(token)}` : "/employeurs";
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).send("Erreur lors de la suppression");
  }
};
