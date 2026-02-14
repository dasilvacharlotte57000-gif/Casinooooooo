const reglementEmployes = {
  titre: "Règlement Employés",
  sections: [
    {
      titre: "1. Tenue et Fonctions",
      regles: [
        "Les employés du casino sont tenus de porter une tenue adaptée à leur fonction pendant toute la durée de leur service.",
        "Leur mission consiste à accueillir, orienter et assurer la sécurité des clients."
      ]
    },
    {
      titre: "2. Interdictions Strictes",
      regles: [
        "Il est strictement interdit aux employés de jouer pendant leurs heures de service.",
        "Tout employé surpris en train de jouer pendant son service, y compris lorsque le casino est fermé, sera licencié sans indemnité et blacklist.",
        "Le port ou l'utilisation d'armes est interdit, sauf autorisation exceptionnelle de la direction ou des responsables légaux.",
        "Le vol dans les coffres, la possession de jetons pendant le service, ainsi que toute forme de violence envers la clientèle, entraîneront un licenciement sans indemnité."
      ]
    },
    {
      titre: "3. Service et Pauses",
      regles: [
        "Les pauses sont autorisées mais doivent rester courtes et raisonnables, sauf autorisation préalable de la direction.",
        "Les employés ayant oublié d'activer leur service ne seront pas rémunérés.",
        "Il est de la responsabilité de chacun d'activer et désactiver son service via le menu F6.",
        "Un temps de détente permettant de jouer pourra être accordé aux employés uniquement sur décision de la direction."
      ]
    },
    {
      titre: "4. Usage des Installations",
      regles: [
        "Les installations du casino sont réservées à un usage strictement professionnel.",
        "Il est interdit aux employés d'utiliser les espaces privés (appartement, rooftop, zones restreintes) à des fins personnelles.",
        "En dehors des heures d'ouverture, l'accès aux installations du casino est strictement interdit, sauf autorisation expresse de la direction.",
        "Aucun avantage ou privilège n'est accordé aux proches des employés, qui seront traités comme tous les autres clients."
      ]
    },
    {
      titre: "5. Absences et Licenciements",
      regles: [
        "Les absences sont tolérées à condition qu'elles ne soient ni répétées ni prolongées sans justification.",
        "En cas d'insuffisance d'heures de service, la direction se réserve le droit de procéder à un licenciement."
      ]
    },
    {
      titre: "6. Confidentialité et Sanctions",
      regles: [
        "Toute divulgation d'informations confidentielles concernant la gestion ou la direction du casino entraînera un licenciement immédiat et pourra faire l'objet de poursuites judiciaires.",
        "Toute insulte, tricherie ou nuisance portant atteinte au casino entraînera un licenciement immédiat, avec d'éventuelles sanctions judiciaires.",
        "Les faits graves portant atteinte à l'image du casino entraîneront un licenciement sans indemnité."
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
