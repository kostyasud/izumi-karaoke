(function (root) {
  var timeline = [
    { id: "design", title: "Проектирование", duration: "1,5 недели", text: "Проверяем оборудование, доступы, iiko и текущую коммутацию. Собираем окончательную спецификацию." },
    { id: "build", title: "Основная разработка", duration: "4,5 недели", text: "Делаем гостевой интерфейс, панель персонала, интеграцию заказов и управляющие компоненты." },
    { id: "pilot", title: "Интеграция и пилот", duration: "2–3 недели", text: "Подключаем одну комнату и проверяем звук, заказы и AI-контент." },
    { id: "check", title: "Проверка в эксплуатации", duration: "1,5 недели", text: "Собираем замечания персонала и гостей и исправляем найденные ошибки." },
    { id: "scale", title: "Тиражирование", duration: "2–3 недели", text: "Разворачиваем проверенную конфигурацию в остальных комнатах." }
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = timeline;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.timeline = timeline;
})(typeof globalThis !== "undefined" ? globalThis : this);
