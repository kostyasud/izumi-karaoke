(function (root) {
  var calc = root.IZUMI.calc;
  var storage = root.IZUMI.storage;
  var listeners = [];
  var full = calc.fullQuote();
  var saved = storage.read();
  var state = {
    rooms: full.rooms,
    karaokeTablets: full.karaokeTablets,
    serviceTablets: full.serviceTablets,
    modules: full.modules,
    mode: "full",
    confirm: null
  };

  if (saved) {
    state.rooms = saved.rooms;
    state.karaokeTablets = saved.karaokeTablets;
    state.serviceTablets = saved.serviceTablets;
    state.modules = saved.modules;
    state.mode = calc.detectMode(saved.rooms, saved.karaokeTablets, saved.serviceTablets);
  }

  function emit() {
    var snapshot = get();
    listeners.forEach(function (fn) { fn(snapshot); });
  }

  function applyQuote() {
    var quoted = calc.quote(state);
    state.rooms = quoted.rooms;
    state.karaokeTablets = quoted.karaokeTablets;
    state.serviceTablets = quoted.serviceTablets;
    state.modules = quoted.modules;
  }

  function get() {
    applyQuote();
    return {
      rooms: state.rooms,
      karaokeTablets: state.karaokeTablets,
      serviceTablets: state.serviceTablets,
      modules: state.modules,
      mode: state.mode,
      confirm: state.confirm,
      quote: calc.quote(state)
    };
  }

  function setRooms(value) {
    state.rooms = value;
    state.mode = "custom";
    state.confirm = null;
    applyQuote();
    emit();
  }

  function setTablets(kind, value) {
    if (kind === "karaoke") state.karaokeTablets = value;
    if (kind === "service") state.serviceTablets = value;
    state.mode = "custom";
    state.confirm = null;
    applyQuote();
    emit();
  }

  function setMode(mode) {
    if (mode === "pilot") {
      state.rooms = 1;
      state.karaokeTablets = 0;
      state.serviceTablets = 1;
      state.mode = "pilot";
    } else if (mode === "full") {
      state.rooms = 5;
      state.karaokeTablets = 0;
      state.serviceTablets = 5;
      state.mode = "full";
    }
    state.confirm = null;
    applyQuote();
    emit();
  }

  function toggleModule(id) {
    var current = state.modules[id] === true;
    var result = calc.toggleModule(state.modules, id, !current);
    if (result.confirm) {
      state.confirm = result.confirm;
      emit();
      return;
    }
    state.modules = result.modules;
    state.confirm = null;
    emit();
  }

  function resolveConfirm(accept) {
    if (accept && state.confirm === "disable-both") {
      state.modules = calc.disablePaymentPair(state.modules);
    }
    state.confirm = null;
    emit();
  }

  function reset() {
    state.rooms = 5;
    state.karaokeTablets = 0;
    state.serviceTablets = 5;
    state.modules = calc.emptyModules();
    state.mode = "full";
    state.confirm = null;
    emit();
  }

  function save() {
    return storage.write(state);
  }

  function clearSaved() {
    return storage.clear();
  }

  root.IZUMI = root.IZUMI || {};
  root.IZUMI.proposalState = {
    get: get,
    setRooms: setRooms,
    setTablets: setTablets,
    setMode: setMode,
    toggleModule: toggleModule,
    resolveConfirm: resolveConfirm,
    reset: reset,
    save: save,
    clearSaved: clearSaved,
    subscribe: function (fn) { listeners.push(fn); }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
