const MENU = [
  {
    id: "soft",
    title: "Soft",
    icon: "🥤",
    items: [
      { name: "The", price: 400 },
      { name: "ECola", price: 400 },
      { name: "Sprunk", price: 400 },
      { name: "Limonade", price: 400 },
      { name: "Jus de Fruit", price: 400 },
      { name: "Chocolat Chaud", price: 400 },
      { name: "Boisson Energisante", price: 400 }
    ]
  },
  {
    id: "snacks",
    title: "Snacks",
    icon: "🍽️",
    items: [
      { name: "Cookie", price: 500 },
      { name: "Muffin", price: 500 },
      { name: "Burger", price: 500 },
      { name: "Salade", price: 500 },
      { name: "Tiramisu", price: 500 },
      { name: "CheeseBurger", price: 500 },
      { name: "Caviar", price: 4000 }
    ]
  },
  {
    id: "cocktails",
    title: "Cocktails",
    icon: "🍸",
    items: [
      { name: "Mojito", price: 2000 },
      { name: "Rhum Cola", price: 2000 },
      { name: "Rhum Fruits", price: 2000 },
      { name: "Vodka Fruits", price: 2000 },
      { name: "Vodka Energisante", price: 2000 },
      { name: "Sex On The Beach", price: 2000 }
    ]
  },
  {
    id: "alcool",
    title: "Alcool",
    icon: "🥃",
    items: [
      { name: "Biere", price: 1000 },
      { name: "Rhum", price: 1000 },
      { name: "Vodka", price: 1000 },
      { name: "Shooter", price: 1000 },
      { name: "Tequilla", price: 5000 },
      { name: "Champagne", price: 10000 }
    ]
  }
];

exports.showMenu = (req, res) => {
  res.render("menu", { sections: MENU });
};
