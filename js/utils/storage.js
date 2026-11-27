(function (root) {
  var calc = (typeof module !== "undefined" && module.exports)
    ? require("./calculations.js")
    : root.IZUMI.calc;

  var KEY = "izumi-karaoke-proposal";
  var VERSION = 2;

  function snapshot(state) {
    var quoted = calc.quote(state);
    return {
      v: VERSION,
      rooms: quoted.rooms,
      karaokeTablets: quoted.karaokeTablets,
      serviceTablets: quoted.serviceTablets,
      soundDevices: quoted.soundDevices,
      modules: quoted.modules
    };
  }

  function restore(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.v !== VERSION) return null;
    var quoted = calc.quote({
      rooms: raw.rooms,
      karaokeTablets: raw.karaokeTablets,
      serviceTablets: raw.serviceTablets,
      soundDevices: raw.soundDevices,
      modules: raw.modules
    });
    return {
      rooms: quoted.rooms,
      karaokeTablets: quoted.karaokeTablets,
      serviceTablets: quoted.serviceTablets,
      soundDevices: quoted.soundDevices,
      modules: quoted.modules,
      mode: "custom"
    };
  }

  function read() {
    try {
      var text = root.localStorage.getItem(KEY);
      if (!text) return null;
      return restore(JSON.parse(text));
    } catch (error) {
      return null;
    }
  }

  function write(state) {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(snapshot(state)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clear() {
    try {
      root.localStorage.removeItem(KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  var api = {
    KEY: KEY,
    VERSION: VERSION,
    snapshot: snapshot,
    restore: restore,
    read: read,
    write: write,
    clear: clear
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.storage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
