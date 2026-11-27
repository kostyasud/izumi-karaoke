(function (root) {
  var pricing = (typeof module !== "undefined" && module.exports)
    ? require("../data/pricing.js")
    : root.IZUMI.pricing;

  var MODULE_IDS = pricing.modules.map(function (item) { return item.id; });

  function emptyModules() {
    var modules = {};
    MODULE_IDS.forEach(function (id) { modules[id] = false; });
    return modules;
  }

  function clampRooms(value) {
    var n = Math.floor(Number(value));
    if (!isFinite(n)) return pricing.roomsMax;
    if (n < pricing.roomsMin) return pricing.roomsMin;
    if (n > pricing.roomsMax) return pricing.roomsMax;
    return n;
  }

  function clampTablets(value, rooms) {
    var n = Math.floor(Number(value));
    if (!isFinite(n) || n < 0) return 0;
    if (n > rooms) return rooms;
    return n;
  }

  function normalizeModules(input) {
    var modules = emptyModules();
    var source = input || {};
    MODULE_IDS.forEach(function (id) {
      modules[id] = source[id] === true;
    });
    if (modules.split) modules.sbp = true;
    return modules;
  }

  function worksCost(rooms) {
    return pricing.platformWork + pricing.perRoomWork * clampRooms(rooms);
  }

  function equipmentCost(rooms, karaokeTablets, serviceTablets) {
    var count = clampRooms(rooms);
    return pricing.sharedInfra
      + pricing.perRoomEquip * count
      + pricing.tabletKaraoke * clampTablets(karaokeTablets, count)
      + pricing.tabletService * clampTablets(serviceTablets, count);
  }

  function modulePrice(id) {
    var found = pricing.modules.filter(function (item) { return item.id === id; })[0];
    return found ? found.price : 0;
  }

  function modulesCost(modules) {
    var normalized = normalizeModules(modules);
    return MODULE_IDS.reduce(function (sum, id) {
      return sum + (normalized[id] ? modulePrice(id) : 0);
    }, 0);
  }

  function quote(config) {
    var source = config || {};
    var rooms = clampRooms(source.rooms);
    var karaokeTablets = clampTablets(source.karaokeTablets, rooms);
    var serviceTablets = clampTablets(source.serviceTablets, rooms);
    var modules = normalizeModules(source.modules);
    var works = worksCost(rooms);
    var equipment = equipmentCost(rooms, karaokeTablets, serviceTablets);
    var extras = modulesCost(modules);
    return {
      rooms: rooms,
      karaokeTablets: karaokeTablets,
      serviceTablets: serviceTablets,
      modules: modules,
      works: works,
      equipment: equipment,
      extras: extras,
      total: works + extras,
      from: extras > 0,
      research: modules.singing === true
    };
  }

  function pilotQuote() {
    return quote({ rooms: 1, karaokeTablets: 0, serviceTablets: 1, modules: emptyModules() });
  }

  function fullQuote() {
    return quote({ rooms: 5, karaokeTablets: 0, serviceTablets: 5, modules: emptyModules() });
  }

  function expansionCost() {
    return fullQuote().total - pilotQuote().total;
  }

  function detectMode(rooms, karaokeTablets, serviceTablets, explicit) {
    if (explicit === "custom") return "custom";
    if (rooms === 1 && karaokeTablets === 0 && serviceTablets === 1) return "pilot";
    if (rooms === 5 && karaokeTablets === 0 && serviceTablets === 5) return "full";
    return "custom";
  }

  function toggleModule(modules, id, nextOn) {
    var current = normalizeModules(modules);
    if (MODULE_IDS.indexOf(id) === -1) {
      return { modules: current, confirm: null };
    }
    if (id === "sbp" && nextOn === false && current.split) {
      return { modules: current, confirm: "disable-both" };
    }
    var next = {};
    MODULE_IDS.forEach(function (key) { next[key] = current[key]; });
    next[id] = nextOn === true;
    if (id === "split" && next.split) next.sbp = true;
    return { modules: next, confirm: null };
  }

  function disablePaymentPair(modules) {
    var next = normalizeModules(modules);
    next.sbp = false;
    next.split = false;
    return next;
  }

  function paymentPilot() {
    var works = worksCost(1);
    var part = Math.round(works * 0.4);
    return [
      { share: "40%", amount: part, when: "при подписании" },
      { share: "40%", amount: part, when: "после демонстрации основного функционала" },
      { share: "20%", amount: works - part * 2, when: "после приёмки" }
    ];
  }

  function paymentRollout() {
    var delta = worksCost(5) - worksCost(1);
    var half = Math.round(delta / 2);
    return [
      { share: "50%", amount: half, when: "перед началом" },
      { share: "50%", amount: delta - half, when: "после приёмки" }
    ];
  }

  function scopeTotal() {
    return pricing.scope.reduce(function (sum, item) { return sum + item.price; }, 0);
  }

  var api = {
    emptyModules: emptyModules,
    clampRooms: clampRooms,
    clampTablets: clampTablets,
    normalizeModules: normalizeModules,
    worksCost: worksCost,
    equipmentCost: equipmentCost,
    modulesCost: modulesCost,
    quote: quote,
    pilotQuote: pilotQuote,
    fullQuote: fullQuote,
    expansionCost: expansionCost,
    detectMode: detectMode,
    toggleModule: toggleModule,
    disablePaymentPair: disablePaymentPair,
    paymentPilot: paymentPilot,
    paymentRollout: paymentRollout,
    scopeTotal: scopeTotal
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.calc = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
