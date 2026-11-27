(function (root) {
  var cartApi = root.IZUMI.cart;
  var menu = root.IZUMI.menu;
  var proposal = root.IZUMI.proposal;
  var listeners = [];
  var seq = 1;

  function freshMics() {
    return [
      { on: true, volume: 65, effect: 30, preset: "standard" },
      { on: true, volume: 65, effect: 30, preset: "standard" }
    ];
  }

  function fresh() {
    return {
      mics: freshMics(),
      soundNotice: "",
      cart: [],
      comment: "",
      picks: {},
      lines: [],
      requests: [],
      cooldowns: {},
      now: Date.now()
    };
  }

  var state = fresh();

  function emit() {
    listeners.forEach(function (fn) { fn(get()); });
  }

  function get() {
    return state;
  }

  function itemById(id) {
    return menu.items.filter(function (item) { return item.id === id; })[0];
  }

  function setMic(index, patch, silent) {
    var mic = state.mics[index];
    if (!mic) return;
    if (patch.volume != null) mic.volume = Math.max(0, Math.min(100, Math.round(patch.volume)));
    if (patch.effect != null) mic.effect = Math.max(0, Math.min(100, Math.round(patch.effect)));
    if (patch.on != null) mic.on = patch.on === true;
    if (patch.preset) {
      var preset = proposal.presets.filter(function (entry) { return entry.id === patch.preset; })[0];
      if (preset) {
        mic.preset = preset.id;
        mic.effect = preset.effect;
      }
    }
    state.soundNotice = "";
    if (!silent) emit();
  }

  function resetSound() {
    state.mics = freshMics();
    state.soundNotice = "Стандартные настройки восстановлены в демонстрации.";
    emit();
  }

  function setComment(value) {
    state.comment = String(value || "").slice(0, 180);
  }

  function setPick(itemId, optionId) {
    state.picks[itemId] = optionId;
    emit();
  }

  function addItem(itemId) {
    var item = itemById(itemId);
    if (!item) return;
    var mods = [];
    if (item.modifier) {
      var picked = state.picks[itemId] || item.modifier.options[0].id;
      var option = item.modifier.options.filter(function (entry) { return entry.id === picked; })[0];
      if (!option) return;
      mods = [option];
    }
    state.cart = cartApi.addLine(state.cart, item, mods, 1);
    emit();
  }

  function changeQty(key, qty) {
    state.cart = cartApi.changeQty(state.cart, key, qty);
    emit();
  }

  function submitOrder() {
    if (!state.cart.length) return;
    var sent = cartApi.submitCart(state.cart, state.comment.trim());
    state.lines = state.lines.concat(sent.accepted).concat(sent.pending);
    state.cart = [];
    state.comment = "";
    state.requests.push({
      id: "r" + (seq++),
      title: "Новый заказ из комнаты 1",
      status: "new"
    });
    emit();
  }

  function helpRequest() {
    state.requests.push({ id: "r" + (seq++), title: "Нужна помощь с караоке", status: "new" });
    emit();
  }

  function quick(actionId, title) {
    var now = Date.now();
    state.now = now;
    if (!cartApi.canFire(state.cooldowns[actionId], now, 10000)) return;
    state.cooldowns[actionId] = now;
    state.requests.push({ id: "r" + (seq++), title: title, status: "new" });
    emit();
  }

  function setRequest(id, status) {
    state.requests.forEach(function (request) {
      if (request.id === id) request.status = status;
    });
    emit();
  }

  function setAlcohol(key, status) {
    state.lines = cartApi.setAlcoholStatus(state.lines, key, status);
    emit();
  }

  function reset() {
    state = fresh();
    emit();
  }

  function tick() {
    state.now = Date.now();
    emit();
  }

  root.IZUMI.demo = {
    get: get,
    setMic: setMic,
    resetSound: resetSound,
    setComment: setComment,
    setPick: setPick,
    addItem: addItem,
    changeQty: changeQty,
    submitOrder: submitOrder,
    helpRequest: helpRequest,
    quick: quick,
    setRequest: setRequest,
    setAlcohol: setAlcohol,
    reset: reset,
    tick: tick,
    subscribe: function (fn) { listeners.push(fn); }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
