(function (root) {
  var calc = (typeof module !== "undefined" && module.exports)
    ? require("./calculations.js")
    : root.IZUMI.calc;
  var money = (typeof module !== "undefined" && module.exports)
    ? require("./money.js")
    : root.IZUMI.money;
  var pricing = (typeof module !== "undefined" && module.exports)
    ? require("../data/pricing.js")
    : root.IZUMI.pricing;

  function moduleLines(quoted) {
    return pricing.modules.filter(function (item) {
      return quoted.modules[item.id];
    }).map(function (item) {
      return item.title + " — от " + money.formatMoney(item.price);
    });
  }

  function purchaseLines(quoted) {
    var lines = [];
    function push(title, amount, qty, model) {
      lines.push(title + (qty > 1 ? " × " + qty : "") + (model ? ", " + model : "") + " — " + money.formatMoney(amount));
    }
    if (quoted.karaokeTablets) push("Планшет «Караоке»", pricing.tabletKaraoke * quoted.karaokeTablets, quoted.karaokeTablets, "только если решите заменить iPad mini 4");
    if (quoted.serviceTablets) push("Планшет заказа и AI", pricing.tabletService * quoted.serviceTablets, quoted.serviceTablets, "отдельный планшет с браузером. iPad mini 4 не меняем");
    pricing.roomParts.forEach(function (part) {
      push(part.title, part.amount * quoted.rooms, quoted.rooms, part.model || "");
    });
    pricing.infraParts.forEach(function (part) {
      push(part.title, part.amount, 1);
    });
    return lines;
  }

  function buildText(config) {
    var quoted = calc.quote(config);
    var extras = moduleLines(quoted);
    var budgetLabel = quoted.from ? "Наша стоимость от " : "Наша стоимость: ";
    var lines = [
      "Коммерческое предложение",
      "Система гостевого самообслуживания караоке-комнат",
      "Предложение от " + pricing.proposalDate,
      "",
      "Комнат: " + quoted.rooms,
      "Новые планшеты «Караоке»: " + quoted.karaokeTablets,
      "Новые планшеты «Сервис»: " + quoted.serviceTablets,
      "",
      "Работы: " + money.formatMoney(quoted.works),
      "Дополнительные модули — минимальная оценка: " + (quoted.extras ? "от " + money.formatMoney(quoted.extras) : money.formatMoney(0)),
      budgetLabel + money.formatMoney(quoted.total),
      "К договору до " + pricing.earlyDiscountUntil + ", скидка 5%: " + (quoted.from ? "от " : "") + money.formatMoney(quoted.early),
      "",
      "Закупка на стороне заведения, в нашу стоимость не входит:"
    ];
    purchaseLines(quoted).forEach(function (line) { lines.push(line); });
    lines.push("Ориентир закупки: " + money.formatMoney(quoted.equipment), "", "Дополнительные модули:");
    if (!extras.length) lines.push("не выбраны");
    extras.forEach(function (line) { lines.push(line); });
    lines.push(
      "",
      "Регулярные расходы, не входят в разовый бюджет:",
      "Поддержка — " + money.formatMoney(pricing.supportMonthly) + "/мес. Необязательно.",
      "Сторонние подписки — по действующим договорам.",
      "Электроэнергия и интернет — по условиям заведения.",
      "Подписка Higgsfield — по тарифу сервиса, оплачивает заведение.",
      "",
      "Оборудование заведение покупает самостоятельно. Ориентир закупки — не счёт и не наша стоимость.",
      "Цены дополнительных модулей указаны «от». Итог уточняется после фиксации объёма."
    );
    if (quoted.research) {
      lines.push("Исследовательский этап не гарантирует разработку промышленного модуля в пределах указанной суммы.");
    }
    lines.push("", "Выбор конфигурации на странице не является заключением договора.");
    return lines.join("\n");
  }

  function downloadText(config) {
    var blob = new Blob([buildText(config)], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "izumi-karaoke-raschet.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function copyText(config) {
    var text = buildText(config);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  var api = { buildText: buildText, downloadText: downloadText, copyText: copyText };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.exporter = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
