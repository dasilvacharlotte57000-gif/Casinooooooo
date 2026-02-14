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
      titre: "1. Accès et Admission",
      regles: [
        "L'accès au casino est payant et soumis à un nombre de places limité. Toute sortie est définitive.",
        "L'accès est autorisé uniquement aux personnes disposant d'une carte d'identité valide, comportant une photo fidèle à votre apparence.",
        "En l'absence de carte d'identité, le personnel se réserve le droit de refuser l'entrée."
      ]
    },
    {
      titre: "2. Tenue et Comportement",
      regles: [
        "Une tenue correcte, élégante et chic est obligatoire (chemise, costume, tenue de soirée).",
        "Sont strictement interdits : la nudité / les masques / les couvre-chefs / les objets fantaisistes / sac 36",
        "Toute forme de violence, menace ou comportement inapproprié entraînera une expulsion immédiate."
      ]
    },
    {
      titre: "3. Sécurité",
      regles: [
        "L'accès au casino est soumis à une fouille obligatoire. Le paiement du droit d'entrée est effectué lors de celle-ci.",
        "Toute arme est strictement interdite dans l'enceinte du casino.",
        "Sont également interdits : les armes de service / les menottes / les bidons d'essence / boombox",
        "La possession ou l'utilisation d'armes entraînera des sanctions graves."
      ]
    },
    {
      titre: "4. Règles Internes",
      regles: [
        "Il est interdit de demander des jetons aux employés ou aux autres clients.",
        "Les zones arrière sont strictement réservées au personnel. Toute tentative d'intrusion entraînera une expulsion ou un blacklist.",
        "Le nombre de tables de jeu étant limité, merci de faire preuve de civisme et de patience afin que chacun puisse jouer."
      ]
    },
    {
      titre: "5. Responsabilité",
      regles: [
        "En cas de perte ou de vol de jetons, le casino décline toute responsabilité, que ce soit pendant les jeux ou au sein de l'établissement."
      ]
    },
    {
      titre: "6. Infractions Graves",
      regles: [
        "Il est strictement interdit de forcer l'entrée, d'exercer des violences ou de menacer les agents de sécurité, y compris à l'extérieur du casino.",
        "Toute infraction de ce type entraînera un blacklist."
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
