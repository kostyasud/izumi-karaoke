(function (root) {
  var menu = {
    categories: [
      { id: "food", title: "Еда" },
      { id: "soft", title: "Безалкогольные" },
      { id: "alcohol", title: "Алкоголь" },
      { id: "service", title: "Услуги" }
    ],
    items: [
      {
        id: "fries",
        title: "Картофель фри",
        price: 350,
        category: "food",
        alcohol: false,
        modifier: {
          id: "sauce",
          title: "Соус",
          options: [
            { id: "ketchup", title: "Кетчуп", price: 0 },
            { id: "cheese", title: "Сырный", price: 50 },
            { id: "none", title: "Без соуса", price: 0 }
          ]
        }
      },
      { id: "snack", title: "Сет закусок", price: 990, category: "food", alcohol: false },
      {
        id: "lemonade",
        title: "Лимонад",
        price: 420,
        category: "soft",
        alcohol: false,
        modifier: {
          id: "taste",
          title: "Вкус",
          options: [
            { id: "citrus", title: "Цитрус", price: 0 },
            { id: "berry", title: "Ягоды", price: 0 }
          ]
        }
      },
      { id: "water", title: "Вода", price: 250, category: "soft", alcohol: false },
      { id: "shots", title: "Сет настоек", price: 1800, category: "alcohol", alcohol: true },
      { id: "anime", title: "Аниме-портрет", price: 490, category: "service", alcohol: false }
    ],
    actions: [
      { id: "waiter", title: "Позвать официанта" },
      { id: "karaoke", title: "Помощь с караоке" },
      { id: "bill", title: "Принести счёт" },
      { id: "water", title: "Вода и бокалы" }
    ]
  };

  if (typeof module !== "undefined" && module.exports) module.exports = menu;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.menu = menu;
})(typeof globalThis !== "undefined" ? globalThis : this);
