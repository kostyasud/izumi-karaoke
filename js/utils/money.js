(function (root) {
  function formatMoney(value) {
    var n = Math.round(Number(value) || 0);
    var sign = n < 0 ? "−" : "";
    var digits = String(Math.abs(n));
    var grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
    return sign + grouped + "\u00A0₽";
  }

  function formatRange(min, max) {
    return formatMoney(min).replace("\u00A0₽", "") + "–" + formatMoney(max);
  }

  var api = { formatMoney: formatMoney, formatRange: formatRange };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.money = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
