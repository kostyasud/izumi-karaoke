(function (root) {
  var calc = root.IZUMI.calc;
  var money = root.IZUMI.money;
  var pricing = root.IZUMI.pricing;
  var proposal = root.IZUMI.proposal;
  var menu = root.IZUMI.menu;
  var timeline = root.IZUMI.timeline;
  var faq = root.IZUMI.faq;
  var cartApi = root.IZUMI.cart;

  function e(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ru(text) {
    return String(text).replace(/(^|[\s«(])([A-Za-zА-Яа-яЁё])\s+/g, "$1$2\u00A0");
  }

  function t(text) { return e(ru(text)); }
  function m(value) { return e(money.formatMoney(value)); }

  function tip(key) {
    var text = proposal.tips[key];
    if (!text) return "";
    return '<button type="button" class="tip" aria-label="' + e("Пояснение. " + text) + '" data-tip="' + e(text) + '">' +
      '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7.2" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M7 7.1a2 2 0 1 1 2.4 2v1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="9" cy="12.6" r="0.7" fill="currentColor"/></svg></button>';
  }

  function header() {
    return '<a class="skip no-print" href="#content">К содержанию</a>' +
      '<header class="site-header no-print">' +
        '<a class="brand" href="#content"><b><span>' + proposal.mark + '</span>' + proposal.brand + '</b><small>' + t(proposal.navLabel) + '</small></a>' +
        '<nav class="nav" aria-label="Разделы">' +
          '<div class="nav-links">' +
            '<a href="#solution" data-nav="solution">Решение</a>' +
            '<a href="#demo" data-nav="demo">Демонстрация</a>' +
            '<a href="#scope" data-nav="scope">Состав работ</a>' +
            '<a href="#budget" data-nav="budget">Бюджет</a>' +
            '<a href="#timeline" data-nav="timeline">Этапы</a>' +
            '<a href="#terms" data-nav="terms">Условия</a>' +
          '</div>' +
          '<a class="btn btn-light btn-small" href="#budget">Настроить предложение</a>' +
          '<div class="header-tools">' +
            '<button type="button" class="icon-btn" id="print-btn" aria-label="Печать">Печать</button>' +
            '<button type="button" class="menu-btn" id="menu-btn" aria-expanded="false" aria-label="Меню">Меню</button>' +
          '</div>' +
        '</nav>' +
        '<div class="menu-panel" id="menu-panel">' +
          '<a href="#solution">Решение</a><a href="#demo">Демонстрация</a><a href="#scope">Состав работ</a>' +
          '<a href="#budget">Бюджет</a><a href="#timeline">Этапы</a><a href="#terms">Условия</a>' +
        '</div>' +
      '</header>' +
      '<div class="progress no-print" aria-hidden="true"><span id="progress"></span></div>';
  }

  function hero() {
    var full = calc.fullQuote();
    return '<section class="band band-night hero" id="top">' +
      '<div class="wrap">' +
        '<p class="kicker">Коммерческое предложение</p>' +
        '<h1>Пять караоке-комнат.<br>Два планшета в каждой.<br>Один понятный сервис.</h1>' +
        '<p class="lead">Собираем караоке, звук, заказы в iiko ' + tip("iiko") + ' и AI-развлечения в одном гостевом сервисе.</p>' +
        '<ul class="catalog">' +
          '<li>Сохраняем EVOBOX' + tip("evobox") + ', Apple TV, iPad mini 4 и пульт</li>' +
          '<li>Подключаем действующую iiko</li>' +
          '<li>Начинаем с одной комнаты</li>' +
        '</ul>' +
        '<div class="actions">' +
          '<a class="btn btn-light" href="#demo">Посмотреть, как это работает</a>' +
          '<a class="btn btn-line" href="#budget">Рассчитать комплектацию</a>' +
        '</div>' +
        '<p class="note">Предложение от ' + t(pricing.proposalDate) + '. Стоимость работ фиксируется договором. Оборудование заведение покупает самостоятельно.</p>' +
        '<div class="metrics-block"><p class="tag">Базовый проект</p><div class="metrics">' +
          metric(full.rooms + " комнат", "единая платформа управления") +
          metric(full.serviceTablets + " новых планшетов", "заказ и AI, караоке остаётся на iPad mini 4") +
          metric("8–9 недель", "ориентир запуска пилота") +
          metric(m(full.early), "при подписании до 11 декабря", "Без скидки\u00A0— " + m(full.total) + ". Оборудование в эту сумму не входит.") +
        '</div></div>' +
      '</div></section>';
  }

  function metric(value, caption, extra) {
    return '<article class="metric"><b>' + value + '</b><span>' + t(caption) + '</span>' +
      (extra ? '<p class="note">' + t(extra) + '</p>' : '') +
      '</article>';
  }

  function audience(ui) {
    var current = proposal.audiences.filter(function (item) { return item.id === ui.audience; })[0] || proposal.audiences[0];
    return '<section class="band" id="solution">' +
      '<div class="wrap">' +
        '<h2>Гость отдыхает. Команда контролирует процесс.</h2>' +
        '<p class="lead rule">Вместо разрозненных действий — понятные шаги на планшетах и общая панель персонала.</p>' +
        '<div class="tabs" role="tablist">' + proposal.audiences.map(function (item) {
          return '<button type="button" role="tab" data-audience="' + item.id + '" aria-selected="' + (item.id === current.id) + '">' + t(item.title) + '</button>';
        }).join("") + '</div>' +
        '<div class="cards">' + current.cards.map(function (card) {
          return '<article class="card"><h3>' + t(card.title) + '</h3><p>' + t(card.text) + '</p></article>';
        }).join("") + '</div>' +
      '</div></section>';
  }

  var spots = {
    karaoke: [4, 4], service: [62, 4], evobox: [4, 24], apple: [32, 24],
    mic1: [4, 46], mic2: [32, 46], mixer: [16, 66], speakers: [16, 84],
    iiko: [62, 28], remarked: [80, 28], staff: [62, 52], ai: [80, 52]
  };

  function scheme(ui) {
    var selected = ui.node;
    var lines = proposal.links.map(function (pair) {
      var on = pair[0] === selected || pair[1] === selected;
      var a = center(pair[0]);
      var b = center(pair[1]);
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="' + (on ? "is-on" : "") + '"></line>';
    }).join("");
    var nodes = proposal.nodes.map(function (node) {
      var spot = spots[node.id];
      return '<button type="button" class="node' + (node.id === selected ? " is-on" : "") + '" data-node="' + node.id + '" style="left:' + spot[0] + '%;top:' + spot[1] + '%" aria-pressed="' + (node.id === selected) + '">' + t(node.title) + '</button>';
    }).join("");
    var visible = proposal.nodes.filter(function (node) { return node.layer.indexOf(ui.layer) !== -1; });
    var list = visible.map(function (node) {
      return '<button type="button" class="node' + (node.id === selected ? " is-on" : "") + '" data-node="' + node.id + '" aria-pressed="' + (node.id === selected) + '">' + t(node.title) + '</button>';
    }).join("");
    var current = proposal.nodes.filter(function (node) { return node.id === selected; })[0];
    return '<section class="band band-night" id="room">' +
      '<div class="wrap">' +
        '<h2>Как устроена одна комната</h2>' +
        '<p class="lead">Нажмите на устройство, чтобы увидеть его роль и связи.</p>' +
        '<div class="layer-switch" role="tablist">' + proposal.layers.map(function (layer) {
          return '<button type="button" data-layer="' + layer.id + '" aria-selected="' + (layer.id === ui.layer) + '">' + t(layer.title) + '</button>';
        }).join("") + '</div>' +
        '<div class="scheme-board"><svg class="scheme-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' + nodes + '</div>' +
        '<div class="scheme-list">' + list + '</div>' +
        (current ? '<article class="card explain"><h3>' + t(current.title) + '</h3><p>' + t(current.text) + '</p></article>' : '') +
        '<p class="note">Схема показывает проектную архитектуру. Окончательную коммутацию исполнитель уточняет при технической проверке.</p>' +
      '</div></section>';
  }

  function center(id) {
    var spot = spots[id];
    return [spot[0] + 9, spot[1] + 4];
  }

  function demo(demoState, ui) {
    var tab = ui.demoTab;
    var stage = tab === "staff" ? staff(demoState) : '<div class="tablet">' + (tab === "order" ? serviceTablet(demoState, ui) : karaokeTablet(demoState, ui)) + '</div>';
    return '<section class="band band-night demo" id="demo">' +
      '<div class="wrap">' +
        '<div class="demo-head"><div><h2>Попробуйте будущий интерфейс</h2>' +
        '<p class="lead">Интерактивная демонстрация сценариев. Она не подключена к оборудованию, iiko или AI-сервисам.</p></div></div>' +
        '<div class="tabs" role="tablist">' +
          tabBtn("karaoke", "Караоке и звук", tab) +
          tabBtn("order", "Меню и заказ", tab) +
          tabBtn("staff", "Панель персонала", tab) +
        '</div>' +
        '<div class="demo-stage">' + stage + '</div>' +
        '<div class="print-only"><h3>Демонстрация интерфейсов</h3><p>На странице есть учебные макеты планшета караоке, планшета сервиса и панели персонала. Данные никуда не отправляются и к оборудованию не подключены.</p></div>' +
      '</div></section>';
  }

  function tabBtn(id, label, current) {
    return '<button type="button" data-demo-tab="' + id + '" aria-selected="' + (id === current) + '">' + label + '</button>';
  }

  function karaokeTablet(demoState, ui) {
    var pane = ui.karaokePane;
    return tabletHead("Комната 1", "Караоке") +
      '<div class="tabs pane-tabs">' +
        paneBtn("catalog", "Каталог", pane) + paneBtn("sound", "Звук", pane) + paneBtn("help", "Помощь", pane) +
      '</div>' +
      (pane === "catalog" ? catalog() : pane === "help" ? helpPane() : soundPane(demoState));
  }

  function paneBtn(id, label, current) {
    return '<button type="button" data-pane="' + id + '" aria-selected="' + (id === current) + '">' + label + '</button>';
  }

  function icon(name) {
    var body = {
      trash: '<path d="M4.5 6.5h11M7 6.5V5.2A1.2 1.2 0 0 1 8.2 4h3.6A1.2 1.2 0 0 1 13 5.2v1.3M7.4 6.5l.6 8.2a1 1 0 0 0 1 .8h1.9a1 1 0 0 0 1-.8l.6-8.2"/>',
      plus: '<path d="M10 4.5v11M4.5 10h11"/>',
      power: '<path d="M10 3.5v6"/><path d="M6.4 5.6a5.2 5.2 0 1 0 7.2 0"/>',
      check: '<path d="M4.5 10.5 8 14l7.5-8"/>',
      x: '<path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/>',
      bell: '<path d="M10 16.5a1.4 1.4 0 0 0 1.4-1.4H8.6A1.4 1.4 0 0 0 10 16.5z"/><path d="M6.2 13.2h7.6a1 1 0 0 0 .7-1.7 5 5 0 0 1-1.3-2.8V7.4a3.2 3.2 0 0 0-6.4 0v1.3a5 5 0 0 1-1.3 2.8 1 1 0 0 0 .7 1.7z"/>',
      mic: '<rect x="7.2" y="3.2" width="5.6" height="8.2" rx="2.8"/><path d="M5.2 9.2a4.8 4.8 0 0 0 9.6 0M10 14v2.6"/>',
      receipt: '<path d="M6 3.5h8v13l-1.6-1.1L10.8 16.5 9.2 15.4 7.6 16.5 6 15.4z"/><path d="M8 7h4M8 10h4"/>',
      drop: '<path d="M10 3.2s4.2 4.4 4.2 7.2a4.2 4.2 0 0 1-8.4 0C5.8 7.6 10 3.2 10 3.2z"/>'
    };
    return '<svg class="ico" viewBox="0 0 20 20" aria-hidden="true">' + body[name] + '</svg>';
  }

  function tabletHead(room, title) {
    return '<div class="tablet-top"><div class="tablet-id"><b>' + room + '</b><span>' + title + '</span></div><span class="badge">Демо</span></div>';
  }

  function soundPane(demoState) {
    return '<p class="note">Репертуар открывается в EvoControl и Joy Sound. Громкость и эхо пульта появятся здесь после докупки цифрового прибора в цепь микрофона.</p>' +
      demoState.mics.map(function (mic, index) {
      var n = index + 1;
      return '<div class="mic"><div class="row"><b>Микрофон ' + n + '</b>' +
        '<button type="button" class="icon-round" data-mic-on="' + index + '" aria-pressed="' + mic.on + '" aria-label="' + (mic.on ? "Включён" : "Выключен") + '">' + icon("power") + '</button></div>' +
        '<label class="slider">Громкость <b>' + mic.volume + '</b><input data-key="vol-' + index + '" data-mic-volume="' + index + '" type="range" min="0" max="100" value="' + mic.volume + '"' + (mic.on ? "" : " disabled") + ' aria-label="Громкость микрофона ' + n + '"></label>' +
        '<label class="slider">Эффект <b>' + mic.effect + '</b><input data-key="fx-' + index + '" data-mic-effect="' + index + '" type="range" min="0" max="100" value="' + mic.effect + '"' + (mic.on ? "" : " disabled") + ' aria-label="Эффект микрофона ' + n + '"></label>' +
        '<div class="tabs preset-tabs">' + proposal.presets.map(function (preset) {
          return '<button type="button" data-preset="' + preset.id + '" data-mic="' + index + '" aria-pressed="' + (mic.preset === preset.id) + '">' + t(preset.title) + '</button>';
        }).join("") + '</div></div>';
    }).join("") +
      '<button type="button" class="btn btn-light" id="sound-reset">Вернуть стандартный звук</button>' +
      (demoState.soundNotice ? '<p role="status">' + t(demoState.soundNotice) + '</p>' : '');
  }

  function catalog() {
    return '<div class="catalog"><article class="card"><div class="card-head"><b>Evolution</b>' + tip("evocontrol") + '</div><p>Открывается в EvoControl</p><button type="button" class="btn btn-light btn-small" data-catalog="evo">Что откроется</button></article>' +
      '<article class="card"><div class="card-head"><b>JOYSOUND</b>' + tip("joysound") + '</div><p>Открывается в существующем приложении</p><button type="button" class="btn btn-light btn-small" data-catalog="joy">Что откроется</button></article></div>';
  }

  function helpPane() {
    return '<p>Если песня не находится или звук ведёт себя странно, оставьте обращение. В демонстрации оно появится в панели персонала.</p>' +
      '<button type="button" class="btn btn-light" id="karaoke-help">Нужна помощь с караоке</button>';
  }

  function serviceTablet(demoState, ui) {
    var sums = sumsOf(demoState.lines);
    var cat = ui.menuCat || "food";
    return tabletHead("Комната 1", "Меню и сервис") +
      '<p class="note">Учебное меню: названия и цены используются только для демонстрации интерфейса.</p>' +
      '<div class="tabs cat-tabs">' + menu.categories.map(function (item) {
        return '<button type="button" data-cat="' + item.id + '" aria-selected="' + (item.id === cat) + '">' + t(item.title) + '</button>';
      }).join("") + '</div>' +
      menu.items.filter(function (item) { return item.category === cat; }).map(function (item) { return itemCard(item, demoState); }).join("") +
      '<h3>Корзина</h3>' + cartBlock(demoState) +
      sumRow(sums) +
      '<h3>Быстрые действия</h3><div class="quick">' + menu.actions.map(function (action) {
        var wait = cooldownLeft(demoState, action.id);
        var glyph = action.id === "waiter" ? "bell" : action.id === "karaoke" ? "mic" : action.id === "bill" ? "receipt" : "drop";
        return '<button type="button" class="btn btn-line" data-quick="' + action.id + '" data-title="' + e(action.title) + '"' + (wait ? ' disabled' : '') + '>' +
          icon(glyph) + '<span>' + t(action.title) + (wait ? ' · ' + wait + ' с' : '') + '</span></button>';
      }).join("") + '</div>';
  }

  function itemCard(item, demoState) {
    var mods = "";
    if (item.modifier) {
      var picked = demoState.picks[item.id] || item.modifier.options[0].id;
      mods = '<div class="tabs mod-tabs" role="group" aria-label="' + e(item.modifier.title) + '">' + item.modifier.options.map(function (option) {
        var price = option.price ? " · " + m(option.price) : "";
        return '<button type="button" data-pick="' + item.id + '" data-option="' + option.id + '" aria-pressed="' + (picked === option.id) + '">' + t(option.title) + price + '</button>';
      }).join("") + '</div>';
    }
    return '<article class="menu-item" data-cat-item="' + item.category + '"><div class="row"><b>' + t(item.title) + '</b><span class="price">' + m(item.price) + '</span></div>' +
      (item.alcohol ? '<span class="badge">Подтверждает официант</span>' : '') + mods +
      '<button type="button" class="btn btn-light icon-round" data-add="' + item.id + '" aria-label="Добавить">' + icon("plus") + '</button></article>';
  }

  function cartBlock(demoState) {
    if (!demoState.cart.length) return '<p class="empty">Корзина пуста.</p>';
    var lines = demoState.cart.map(function (line) {
      var mods = line.modifiers.map(function (mod) { return mod.title; }).join(", ");
      return '<div class="cart-line"><div class="row"><b>' + t(line.title) + '</b><span>' + m(line.unitPrice * line.qty) + '</span></div>' +
        (mods ? '<span>' + t(mods) + '</span>' : '') +
        '<div class="qty"><button type="button" data-qty="' + e(line.key) + '" data-delta="-1" aria-label="Меньше">−</button><span>' + line.qty + '</span>' +
        '<button type="button" data-qty="' + e(line.key) + '" data-delta="1" aria-label="Больше">+</button>' +
        '<button type="button" data-remove="' + e(line.key) + '" aria-label="Удалить">' + icon("trash") + '</button></div></div>';
    }).join("");
    return lines +
      '<label>Комментарий <textarea data-key="comment" id="cart-comment" maxlength="180">' + e(demoState.comment) + '</textarea></label>' +
      '<button type="button" class="btn btn-light" id="send-order">Отправить заказ · ' + m(cartApi.cartSum(demoState.cart)) + '</button>';
  }

  function sumRow(sums) {
    return '<div class="stat-row"><div><span>Принято</span><b>' + m(sums.accepted) + '</b></div>' +
      '<div><span>Ждёт подтверждения</span><b>' + m(sums.pending) + '</b></div></div>';
  }

  function sumsOf(lines) {
    return {
      accepted: cartApi.sumByStatus(lines, "accepted"),
      pending: cartApi.sumByStatus(lines, "pending")
    };
  }

  function cooldownLeft(demoState, id) {
    var last = demoState.cooldowns[id];
    if (!last) return 0;
    var remain = 10000 - (demoState.now - last);
    return remain > 0 ? Math.ceil(remain / 1000) : 0;
  }

  function staff(demoState) {
    var sums = sumsOf(demoState.lines);
    var rooms = [1, 2, 3, 4, 5].map(function (number) {
      var live = number === 1;
      return '<article class="room-card' + (live ? ' is-live' : '') + '"><b>Комната ' + number + '</b><span class="status ' + (live ? 'status-live' : 'status-no') + '">' +
        (live ? 'Активна · демо' : 'Нет активной демосессии') + '</span></article>';
    }).join("");
    var requests = demoState.requests.map(function (request) {
      return '<div class="request"><div class="row"><b>' + t(request.title) + '</b><span class="status ' + (request.status === 'done' ? 'status-live' : 'status-wait') + '">' + requestLabel(request.status) + '</span></div>' +
        '<div class="row-actions">' +
        (request.status === 'new' ? '<button type="button" class="icon-round" data-request="' + request.id + '" data-next="accepted" aria-label="Принять">' + icon("check") + '</button>' : '') +
        (request.status === 'accepted' ? '<button type="button" class="icon-round" data-request="' + request.id + '" data-next="done" aria-label="Выполнить">' + icon("check") + '</button>' : '') +
        '</div></div>';
    }).join("") || '<p class="empty">Обращений пока нет.</p>';
    var lines = demoState.lines.map(function (line) {
      var mods = line.modifiers.map(function (mod) { return mod.title; }).join(", ");
      var actions = '';
      if (line.status === 'pending') {
        actions = '<div class="row-actions"><button type="button" class="icon-round" data-alcohol="' + e(line.key) + '" data-next="accepted" aria-label="Подтвердить">' + icon("check") + '</button>' +
          '<button type="button" class="icon-round" data-alcohol="' + e(line.key) + '" data-next="rejected" aria-label="Отклонить">' + icon("x") + '</button></div>';
      }
      return '<div class="request"><div class="row"><span>' + t(line.title) + (mods ? ' · ' + t(mods) : '') + ' × ' + line.qty + '</span><span>' + m(line.unitPrice * line.qty) + '</span></div>' +
        '<span class="status ' + statusClass(line.status) + '">' + lineLabel(line.status) + '</span>' + actions + '</div>';
    }).join("") || '<p class="empty">Заказанных позиций нет.</p>';
    return '<div class="tablet tablet-wide">' + tabletHead("Панель персонала", "Пять комнат") +
      '<div class="staff-grid">' + rooms + '</div>' +
      '<h3>Комната 1</h3>' + sumRow(sums) +
      '<h3>Обращения</h3>' + requests + '<h3>Позиции</h3>' + lines +
      '<button type="button" class="btn btn-line" id="end-session">Завершить демосессию</button></div>';
  }

  function requestLabel(status) {
    if (status === "accepted") return "Принято";
    if (status === "done") return "Выполнено";
    return "Новое";
  }
  function lineLabel(status) {
    if (status === "pending") return "Ожидает подтверждения";
    if (status === "rejected") return "Отклонено";
    return "Принято";
  }
  function statusClass(status) {
    if (status === "rejected") return "status-no";
    if (status === "pending") return "status-wait";
    return "status-live";
  }

  function anime(ui) {
    var style = proposal.animeStyles.filter(function (item) { return item.id === ui.animeStyle; })[0];
    var format = proposal.animeFormats.filter(function (item) { return item.id === ui.animeFormat; })[0];
    return '<section class="band anime" id="anime"><div class="wrap"><h2>Впечатление, которое гость забирает с собой</h2>' +
      '<p class="lead">На втором планшете гость выбирает стиль изображения, делает фото и получает аниме-портрет, GIF или короткий оформленный ролик по личной ссылке.</p>' +
      '<div class="anime-layout"><div class="frame frame-' + format.id + '">' + illustration(style.id) +
      '<p class="note">Концептуальная иллюстрация стиля, не результат работы AI-модуля.</p></div><div>' +
      '<div class="tabs">' + proposal.animeStyles.map(function (item) {
        return '<button type="button" data-style="' + item.id + '" aria-pressed="' + (item.id === style.id) + '">' + t(item.title) + '</button>';
      }).join("") + '</div>' +
      '<div class="tabs">' + proposal.animeFormats.map(function (item) {
        return '<button type="button" data-format="' + item.id + '" aria-pressed="' + (item.id === format.id) + '">' + t(item.title) + '</button>';
      }).join("") + '</div>' +
      '<p>' + t(format.text) + '</p><button type="button" class="btn" id="guest-path">Показать путь гостя</button></div></div>' +
      '<div class="limits"><article class="card"><h3>Что входит в базовый модуль</h3><ul>' + proposal.animeIn.map(function (line) { return '<li>' + t(line) + '</li>'; }).join("") + '</ul></article>' +
      '<article class="card"><h3>Что не входит</h3><ul>' + proposal.animeOut.map(function (line) { return '<li>' + t(line) + '</li>'; }).join("") + '</ul></article></div>' +
      '</div></section>';
  }

  function illustration(id) {
    var file = id === "poster" ? "poster" : id === "space" ? "space" : "neon";
    var label = id === "poster" ? "Концепт: аниме-постер" : id === "space" ? "Концепт: космический герой" : "Концепт: неоновый город";
    return '<img src="img/' + file + '.jpg" alt="' + label + '" width="955" height="1280">';
  }

  function scope() {
    return '<section class="band" id="scope"><div class="wrap"><h2>Что входит в разработку</h2><div class="scope-grid">' +
      pricing.scope.map(function (item, index) {
        return '<article class="acc"><div class="acc-head"><h3>' + (index + 1) + '. ' + t(item.title) + '</h3><b class="price">' + m(item.price) + '</b></div>' +
          '<p>' + t(item.text) + '</p></article>';
      }).join("") +
      '</div><p class="scope-sum"><span>Работы на весь объект</span><b>' + m(calc.scopeTotal()) + '</b></p>' +
      '<p class="scope-sum"><span>При подписании договора до 11 декабря скидка −5%</span><b>' + m(calc.earlyPrice(calc.scopeTotal())) + '</b></p>' +
      '<p class="rule">Один ресторанный контур iiko и один действующий контур ReMarked ' + tip("remarked") + '. Дополнительные лицензии сторонних систем оплачиваются отдельно.</p></div></section>';
  }

  function billPart(title, amount, qty, tipKey, model) {
    var name = t(title) + (qty > 1 ? " × " + qty : "") + (tipKey ? " " + tip(tipKey) : "");
    var spec = model ? '<small>' + t(model) + '</small>' : '';
    return '<li class="bill-part"><span>' + name + spec + '</span><b>' + m(amount) + '</b></li>';
  }

  function equipmentBill(quoted) {
    var lines = [];
    if (quoted.karaokeTablets) lines.push(billPart("Планшет «Караоке»", pricing.tabletKaraoke * quoted.karaokeTablets, quoted.karaokeTablets, "", "только если решите заменить iPad mini 4"));
    if (quoted.serviceTablets) lines.push(billPart("Планшет заказа и AI", pricing.tabletService * quoted.serviceTablets, quoted.serviceTablets, "", "отдельный планшет с браузером. iPad mini 4 не меняем"));
    pricing.roomParts.forEach(function (part) {
      lines.push(billPart(part.title, part.amount * quoted.rooms, quoted.rooms, part.id === "mixer" ? "mixer" : "", part.model || ""));
    });
    pricing.infraParts.forEach(function (part) {
      lines.push(billPart(part.title, part.amount, 1, part.id === "ai" ? "ai" : ""));
    });
    return lines.join("");
  }

  function roomsWord(n) {
    if (n === 1) return "комната";
    if (n < 5) return "комнаты";
    return "комнат";
  }

  function bill(quoted) {
    var rooms = quoted.rooms + " " + roomsWord(quoted.rooms);
    var extras = "";
    var totalLabel = "Наши работы · " + rooms;
    if (quoted.extras) {
      extras = '<div class="bill-row"><span>Работы · ' + rooms + '</span><b>' + m(quoted.works) + '</b></div>' +
        '<div class="bill-row"><span>+ Дополнительно</span><b>от ' + m(quoted.extras) + '</b></div><ul class="bill-parts">' +
        pricing.modules.filter(function (item) { return quoted.modules[item.id]; }).map(function (item) {
          return billPart(item.title, item.price, 1);
        }).join("") + '</ul>';
      totalLabel = "Вместе";
    }
    var prefix = quoted.from ? "от " : "";
    return '<article class="bill">' +
      extras +
      '<div class="bill-row bill-was"><span>' + totalLabel + '</span><b>' + prefix + m(quoted.total) + '</b></div>' +
      '<div class="bill-row"><span>−5% до 11 декабря</span><b>−' + m(quoted.total - quoted.early) + '</b></div>' +
      '<div class="bill-total"><span>К договору</span><b>' + prefix + m(quoted.early) + '</b></div>' +
      '<p class="bill-note">Скидка на наши работы, если договор подписан до ' + t(pricing.earlyDiscountUntil) + '. Закупка в неё не входит.</p>' +
      '<p class="bill-label">Купить самостоятельно</p>' +
      '<ul class="bill-parts">' + equipmentBill(quoted) + '</ul>' +
      '<div class="bill-row bill-aside"><span>Ориентир закупки ' + tip("estimate") + '</span><b>' + m(quoted.equipment) + '</b></div>' +
      (quoted.research ? '<p class="bill-note">Исследовательский этап не гарантирует готовый модуль.</p>' : '') +
      '</article>';
  }

  function budget(state, ui) {
    var quoted = state.quote;
    return '<section class="band" id="budget"><div class="wrap"><h2>Соберите конфигурацию запуска</h2>' +
      '<div class="seg" role="tablist">' +
        modeBtn("pilot", "Пилот — 1 комната", state.mode) +
        modeBtn("full", "Весь объект — 5 комнат", state.mode) +
        modeBtn("custom", "Своя конфигурация", state.mode) +
      '</div>' +
      stepper("Комнат", state.rooms, "rooms", 1, 5) +
      stepper("Новые планшеты «Караоке»", state.karaokeTablets, "karaoke", 0, state.rooms) +
      stepper("Новые планшеты «Сервис»", state.serviceTablets, "service", 0, state.rooms) +
      bill(quoted) +
      '<h3 class="bill-next">Можно добавить</h3>' +
      '<div class="modules">' + pricing.modules.map(function (item) {
        var on = state.modules[item.id] === true;
        var tipKey = item.id === "sbp" ? "sbp" : item.id === "booth" ? "booth" : "";
        return '<article class="module"><div><h3>' + t(item.title) + (tipKey ? tip(tipKey) : '') + '</h3><b>от ' + m(item.price) + '</b></div>' +
          '<button type="button" class="switch" role="switch" aria-checked="' + on + '" aria-pressed="' + on + '" data-module="' + item.id + '" aria-label="' + (on ? "Включено" : "Выключено") + '"><span>Выкл</span><span>Вкл</span></button></article>';
      }).join("") + '</div>' +
      '<h3 class="bill-next">Регулярные расходы</h3><ul class="quiet">' +
      '<li>Поддержка — ' + m(pricing.supportMonthly) + '/мес. Необязательно.</li>' +
      '<li>Сторонние подписки — по действующим договорам.</li>' +
      '<li>Электроэнергия и интернет — по условиям заведения.</li>' +
      '<li>Подписка Higgsfield — по тарифу сервиса, оплачивает заведение.</li></ul></div></section>';
  }

  function modeBtn(id, label, current) {
    return '<button type="button" data-mode="' + id + '" aria-selected="' + (current === id) + '"' + (id === "custom" ? ' tabindex="-1"' : '') + '>' + label + '</button>';
  }

  function stepper(label, value, id, min, max) {
    return '<div class="row"><span>' + label + '</span><div class="stepper">' +
      '<button type="button" data-step="' + id + '" data-delta="-1" aria-label="Уменьшить: ' + e(label) + '"' + (value <= min ? " disabled" : "") + '>−</button>' +
      '<b>' + value + '</b>' +
      '<button type="button" data-step="' + id + '" data-delta="1" aria-label="Увеличить: ' + e(label) + '"' + (value >= max ? " disabled" : "") + '>+</button></div></div>';
  }

  function compare() {
    var pilot = calc.pilotQuote();
    var full = calc.fullQuote();
    function row(name, a, b) {
      return '<tr><th scope="row">' + name + '</th><td>' + a + '</td><td>' + b + '</td></tr>';
    }
    return '<section class="band" id="compare"><div class="wrap"><h2>Пилот и весь объект</h2><table class="compare"><thead><tr><th>Параметр</th><th>Пилот</th><th>Полный объект</th></tr></thead><tbody>' +
      row("Комнат", "1", "5") +
      row("Новых планшетов к iPad mini 4", String(pilot.karaokeTablets + pilot.serviceTablets), String(full.karaokeTablets + full.serviceTablets)) +
      row("Общая платформа", "Включена", "Включена") +
      row("Интеграция iiko", "Включена", "Включена") +
      row("Базовый AI-модуль", "Включён", "Включён") +
      row("Наши работы", m(pilot.total), m(full.total)) +
      row("При подписании до 11 декабря", m(pilot.early), m(full.early)) +
      row("Закупка на стороне заведения, не входит", m(pilot.equipment), m(full.equipment)) +
      '</tbody></table><p>Общая разработка не оплачивается повторно. Подписку Higgsfield заведение оплачивает само.</p>' +
      '<p><b>Доплата за наши работы с 1 до 5 комнат: ' + m(full.early - pilot.early) + '.</b> Без скидки ' + m(calc.expansionCost()) + '.</p></div></section>';
  }

  function timelineView(ui) {
    var current = timeline.filter(function (item) { return item.id === ui.timeline; })[0] || timeline[0];
    return '<section class="band" id="timeline"><div class="wrap"><h2>От одной комнаты к проверенному решению</h2>' +
      '<div class="timeline">' + timeline.map(function (item) {
        return '<button type="button" data-time="' + item.id + '" aria-selected="' + (item.id === current.id) + '"><b>' + t(item.title) + '</b><span>' + t(item.duration) + '</span></button>';
      }).join("") + '</div>' +
      '<article class="card"><h3>' + t(current.title) + '</h3><p>' + t(current.text) + '</p></article>' +
      '<p>Первый рабочий пилот — ориентировочно через 8–9 недель, полный запуск — через 11–14 недель. Часть работ идёт параллельно. Поставки и согласования сторонних систем могут сдвинуть график.</p></div></section>';
  }

  function payment(ui) {
    var rows = ui.payment === "rollout" ? calc.paymentRollout() : calc.paymentPilot();
    var title = ui.payment === "rollout" ? "Масштабирование" : "Пилот";
    return '<section class="band" id="payment"><div class="wrap"><h2>Поэтапная оплата работ</h2>' +
      '<div class="seg"><button type="button" data-pay="pilot" aria-selected="' + (ui.payment === "pilot") + '">Пилот</button>' +
      '<button type="button" data-pay="rollout" aria-selected="' + (ui.payment === "rollout") + '">Масштабирование</button></div>' +
      '<h3>' + title + '</h3><ul>' + rows.map(function (row) {
        return '<li>' + row.share + ' — ' + m(row.amount) + ' — ' + t(row.when) + '.</li>';
      }).join("") + '</ul>' +
      '<p>Суммы со скидкой 5%, если договор подписан до ' + t(pricing.earlyDiscountUntil) + '. Указан базовый сценарий без дополнительных модулей.</p>' +
      '<p>Оборудование заведение покупает самостоятельно. В стоимость работ оно не входит.</p>' +
      '<p>Налоговый режим и НДС определяются договором и статусом поставщика.</p></div></section>';
  }

  function terms() {
    return '<section class="band" id="terms"><div class="wrap"><h2>Условия и ограничения</h2><div class="faq">' +
      proposal.terms.map(function (item, index) {
        var extra = index === 4 ? tip("operator") : "";
        return '<article class="acc"><h3>' + t(item.title) + extra + '</h3><p class="acc-panel">' + t(item.text) + '</p></article>';
      }).join("") + '</div></div></section>';
  }

  function faqView() {
    return '<section class="band" id="faq"><div class="wrap"><h2>Вопросы</h2><div class="faq">' +
      faq.map(function (item) {
        return '<details><summary>' + t(item.q) + '</summary><p>' + t(item.a) + '</p></details>';
      }).join("") + '</div></div></section>';
  }

  function finalBlock() {
    return '<section class="band band-night" id="final"><div class="wrap final"><div><h2>Начинаем с одной комнаты. Масштабируем проверенное.</h2>' +
      '<p>Пилот проверяет весь гостевой путь: от выбора песни и звука до дозаказа в iiko и получения AI-изображений. После приёмки решение переносится в остальные комнаты.</p>' +
      '<p class="note">Выбор конфигурации на странице не является заключением договора.</p></div>' +
      '<div class="actions"><button type="button" class="btn btn-light" id="pick-pilot">Выбрать пилот</button>' +
      '<button type="button" class="btn btn-line" id="pick-full">Выбрать пять комнат</button>' +
      '<button type="button" class="btn btn-line" id="pick-summary">Открыть итог расчёта</button></div></div></section>';
  }

  function printSheet(state) {
    var text = root.IZUMI.exporter.buildText(state).split("\n").map(function (line) {
      return '<p>' + (line ? t(line) : "") + '</p>';
    }).join("");
    return '<section class="print-only" id="print-sheet"><h1>Коммерческое предложение</h1><h2>Система гостевого самообслуживания караоке-комнат</h2>' +
      '<p>Выбранная конфигурация. Предложение от ' + t(pricing.proposalDate) + '.</p>' + text + '</section>';
  }

  function dock(state) {
    var quoted = state.quote;
    var label = quoted.from ? "от " : "";
    return '<div class="dock"><div><span>К договору</span><br><b>' + label + m(quoted.early) + '</b></div><a class="btn" href="#budget">Расчёт</a></div>';
  }

  function summary(state) {
    var quoted = state.quote;
    var chosen = pricing.modules.filter(function (item) { return quoted.modules[item.id]; });
    return '<div class="modal" id="summary-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="summary-title">' +
      '<h2 id="summary-title">Итог конфигурации</h2>' +
      '<p>Комнат: ' + quoted.rooms + '. Новые планшеты «Караоке»: ' + quoted.karaokeTablets + '. Новые планшеты «Сервис»: ' + quoted.serviceTablets + '.</p>' +
      '<p>Модули: ' + (chosen.length ? chosen.map(function (item) { return t(item.title) + " — от " + m(item.price); }).join("; ") : "не выбраны") + '.</p>' +
      '<p><b>' + (quoted.from ? "К договору от " : "К договору: ") + m(quoted.early) + '</b></p>' +
      '<p>Без скидки\u00A0— ' + m(quoted.total) + '. Скидка 5% до ' + t(pricing.earlyDiscountUntil) + '.</p>' +
      '<p>Закупка на стороне заведения, в сумму не входит. Ориентир ' + m(quoted.equipment) + '.</p>' +
      '<p>Поддержка ' + m(pricing.supportMonthly) + '/мес. Необязательно.</p>' +
      '<p>Модули указаны «от». Предложение от ' + t(pricing.proposalDate) + '.</p>' +
      (quoted.research ? '<p>Исследовательский этап не гарантирует разработку промышленного модуля в пределах указанной суммы.</p>' : '') +
      '<div class="actions"><button type="button" id="summary-copy">Скопировать</button><button type="button" id="summary-close">Закрыть</button></div></div></div>';
  }

  function confirmBox() {
    return '<div class="modal" id="confirm-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">' +
      '<h2 id="confirm-title">Для автоматической оплаты частей счёта требуется платёжный модуль. Отключить оба модуля?</h2>' +
      '<div class="actions"><button type="button" id="confirm-both">Отключить оба</button><button type="button" id="confirm-keep">Оставить</button></div></div></div>';
  }

  function catalogModal() {
    return '<div class="modal" id="catalog-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="catalog-title">' +
      '<h2 id="catalog-title">Штатное приложение</h2><p>В рабочей системе здесь используется управляемый переход в штатное приложение. Каталоги не копируются в собственную базу.</p>' +
      '<button type="button" id="catalog-close">Закрыть</button></div></div>';
  }

  function endModal() {
    return '<div class="modal" id="end-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="end-title">' +
      '<h2 id="end-title">Завершить демонстрационную сессию комнаты 1?</h2><p>Заказ, обращения и гостевые настройки будут очищены.</p>' +
      '<div class="actions"><button type="button" id="end-yes">Завершить демосессию</button><button type="button" id="end-no">Оставить</button></div></div></div>';
  }

  function pathModal(step) {
    var titles = proposal.guestPath;
    var current = titles[step - 1] || titles[0];
    var extra = step === 4 ? '<p>Демонстрация процесса. Реальная генерация не выполняется.</p><div class="path-bar" aria-hidden="true"><span></span></div>' : '';
    var qr = step === 5 ? '<div class="qr" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><p>Здесь появится личная ссылка на готовый результат.</p>' : '';
    return '<div class="modal" id="path-modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="path-title">' +
      '<p>Шаг ' + step + ' из 5</p><h2 id="path-title">' + t(current) + '</h2>' + extra + qr +
      '<div class="actions">' + (step > 1 ? '<button type="button" id="path-prev">Назад</button>' : '') +
      (step < 5 ? '<button type="button" id="path-next">Далее</button>' : '') +
      '<button type="button" id="path-close">Закрыть</button></div></div></div>';
  }

  function page(state, demoState, ui) {
    return '<div id="print-root">' + printSheet(state) + '</div>' + hero() + '<div id="audience-root">' + audience(ui) + '</div>' +
      '<div id="scheme-root">' + scheme(ui) + '</div>' +
      '<div id="demo-root">' + demo(demoState, ui) + '</div>' +
      '<div id="anime-root">' + anime(ui) + '</div>' +
      '<div id="scope-root">' + scope() + '</div>' +
      '<div id="budget-root">' + budget(state, ui) + '</div>' +
      compare() +
      '<div id="timeline-root">' + timelineView(ui) + '</div>' +
      '<div id="payment-root">' + payment(ui) + '</div>' +
      terms() + faqView() + finalBlock();
  }

  root.IZUMI.view = {
    header: header,
    page: page,
    audience: audience,
    scheme: scheme,
    demo: demo,
    anime: anime,
    scope: scope,
    budget: budget,
    timelineView: timelineView,
    payment: payment,
    printSheet: printSheet,
    dock: dock,
    summary: summary,
    confirmBox: confirmBox,
    catalogModal: catalogModal,
    endModal: endModal,
    pathModal: pathModal
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
