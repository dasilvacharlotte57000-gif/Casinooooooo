const mongoose = require("mongoose");

const EmployeurSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      trim: true, 
      lowercase: true,
      sparse: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    telephone: { type: String, trim: true, default: "" },
    poste: { type: String, trim: true, default: "" },
    grade: { 
      type: String, 
      trim: true, 
      default: "",
      enum: ['', 'Employé', 'Manager', 'Responsable Sécurité', 'Chef d\'Équipe', 'Directeur', 'Cadre Supérieur', 'Autre']
    },
    departement: { 
      type: String, 
      trim: true, 
      default: "",
      enum: ['', 'Direction', 'Finances', 'RH', 'Marketing', 'Ventes', 'IT', 'Operations', 'Service Client', 'Autre']
    },
    salaire: { type: Number, default: null },
    dateEntree: { type: Date, default: null },
    dateDepart: { type: Date, default: null },
    photoUrl: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

// Index pour recherche
EmployeurSchema.index({ prenom: 'text', nom: 'text', poste: 'text', departement: 'text', grade: 'text' });

// Méthode virtuelle pour nom complet
EmployeurSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

// Méthode pour vérifier si l'employeur est actif (pas de date de départ)
EmployeurSchema.methods.estActif = function() {
  return !this.dateDepart;
};

module.exports = mongoose.model("Employeur", EmployeurSchema);
