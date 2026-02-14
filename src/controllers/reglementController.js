const reglementEmployes = {
  titre: "Règlement Employés",
  sections: [
    {
      titre: "1. Tenue et Présentation",
      regles: [
        "Port obligatoire de l'uniforme du casino en toutes circonstances",
        "Présentation soignée et professionnelle à tout moment",
        "Badge d'identification visible"
      ]
    },
    {
      titre: "2. Horaires et Ponctualité",
      regles: [
        "Respect strict des horaires de travail",
        "Signaler toute absence ou retard à l'avance",
        "Les pauses doivent être respectées"
      ]
    },
    {
      titre: "3. Comportement Professionnel",
      regles: [
        "Courtoisie et respect envers les clients et collègues",
        "Interdiction de consommer de l'alcool pendant le service",
        "Discrétion sur les informations confidentielles du casino"
      ]
    },
    {
      titre: "4. Sécurité",
      regles: [
        "Respecter les procédures de sécurité",
        "Signaler tout comportement suspect",
        "Ne pas partager les codes d'accès"
      ]
    },
    {
      titre: "5. Sanctions",
      regles: [
        "1er manquement : Avertissement verbal",
        "2ème manquement : Avertissement écrit",
        "3ème manquement : Suspension",
        "Manquement grave : Licenciement immédiat"
      ]
    }
  ]
};

const reglementClients = {
  titre: "Règlement Clients",
  sections: [
    {
      titre: "1. Accès au Casino",
      regles: [
        "Accès réservé aux personnes majeures (18 ans minimum)",
        "Présentation d'une pièce d'identité valide obligatoire",
        "Tenue correcte exigée (pas de short, tongs, débardeur)"
      ]
    },
    {
      titre: "2. Conduite à l'Intérieur",
      regles: [
        "Comportement respectueux envers le personnel et les autres clients",
        "Interdiction de filmer ou photographier sans autorisation",
        "Consommation d'alcool avec modération"
      ]
    },
    {
      titre: "3. Jeux",
      regles: [
        "Respecter les règles de chaque jeu",
        "Les décisions des croupiers et superviseurs sont finales",
        "Interdiction de tricher ou de manipuler l'équipement"
      ]
    },
    {
      titre: "4. Sécurité",
      regles: [
        "Ne pas laisser d'objets de valeur sans surveillance",
        "Signaler tout comportement inapproprié au personnel",
        "Respecter les consignes de sécurité"
      ]
    },
    {
      titre: "5. Exclusions",
      regles: [
        "Le casino se réserve le droit de refuser l'entrée",
        "Tout comportement inapproprié entraîne une exclusion immédiate",
        "Les personnes inscrites sur la blacklist ne peuvent pas entrer"
      ]
    }
  ]
};

const showReglement = (req, res) => {
  res.render("reglements", {
    reglementEmployes,
    reglementClients
  });
};

module.exports = { showReglement };
