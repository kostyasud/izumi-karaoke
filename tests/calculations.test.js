var test = require("node:test");
var assert = require("node:assert/strict");
var calc = require("../js/utils/calculations.js");
var cart = require("../js/utils/cart.js");
var storage = require("../js/utils/storage.js");
var menu = require("../js/data/demoMenu.js");
var exporter = require("../js/utils/exportConfiguration.js");

function item(id) {
  return menu.items.filter(function (entry) { return entry.id === id; })[0];
}

test("полный объект без модулей", function () {
  var quoted = calc.fullQuote();
  assert.equal(quoted.karaokeTablets, 0);
  assert.equal(quoted.serviceTablets, 5);
  assert.equal(quoted.works, 1160000);
  assert.equal(quoted.equipment, 110000);
  assert.equal(quoted.total, 1160000);
  assert.equal(quoted.early, 1102000);
  assert.equal(quoted.from, false);
});

test("пилот без модулей", function () {
  var quoted = calc.pilotQuote();
  assert.equal(quoted.works, 860000);
  assert.equal(quoted.karaokeTablets, 0);
  assert.equal(quoted.serviceTablets, 1);
  assert.equal(quoted.equipment, 22000);
  assert.equal(quoted.total, 860000);
  assert.equal(quoted.early, 817000);
});

test("пять комнат без новых планшетов", function () {
  var quoted = calc.quote({ rooms: 5, karaokeTablets: 0, serviceTablets: 0, modules: {} });
  assert.equal(quoted.equipment, 0);
  assert.equal(quoted.total, 1160000);
});

test("расширение пилота считается разницей", function () {
  assert.equal(calc.expansionCost(), 1160000 - 860000);
  assert.equal(calc.expansionCost(), 300000);
});

test("объект плюс СБП и разделение счёта", function () {
  var quoted = calc.quote({
    rooms: 5,
    karaokeTablets: 5,
    serviceTablets: 5,
    modules: { sbp: true, split: true }
  });
  assert.equal(quoted.extras, 320000);
  assert.equal(quoted.total, 1480000);
  assert.equal(quoted.from, true);
});

test("комнаты и планшеты не выходят за границы", function () {
  assert.equal(calc.clampRooms(0), 1);
  assert.equal(calc.clampRooms(9), 5);
  assert.equal(calc.clampRooms(-3), 1);
  assert.equal(calc.clampTablets(-1, 3), 0);
  assert.equal(calc.clampTablets(8, 3), 3);
  var quoted = calc.quote({ rooms: -4, karaokeTablets: 20, serviceTablets: -2, modules: {} });
  assert.equal(quoted.rooms, 1);
  assert.equal(quoted.karaokeTablets, 1);
  assert.equal(quoted.serviceTablets, 0);
  assert.equal(quoted.total > 0, true);
});

test("разделение счёта включает СБП и не даёт снять его отдельно", function () {
  var turned = calc.toggleModule({}, "split", true);
  assert.equal(turned.modules.split, true);
  assert.equal(turned.modules.sbp, true);
  assert.equal(turned.confirm, null);
  var blocked = calc.toggleModule(turned.modules, "sbp", false);
  assert.equal(blocked.confirm, "disable-both");
  assert.equal(blocked.modules.sbp, true);
  assert.equal(blocked.modules.split, true);
  var both = calc.disablePaymentPair(blocked.modules);
  assert.equal(both.sbp, false);
  assert.equal(both.split, false);
  var onlySbp = calc.toggleModule(both, "split", false);
  assert.equal(onlySbp.modules.split, false);
});

test("повторное восстановление не ломает суммы", function () {
  var original = {
    rooms: 5,
    karaokeTablets: 5,
    serviceTablets: 5,
    modules: { sbp: true, split: true }
  };
  var once = storage.restore(storage.snapshot(original));
  var twice = storage.restore(storage.snapshot(once));
  assert.deepEqual(calc.quote(once).total, calc.quote(twice).total);
  assert.equal(calc.quote(twice).total, 1480000);
  assert.equal(storage.restore(null), null);
  assert.equal(storage.restore({ v: 0, rooms: 5 }), null);
  var clamped = storage.restore(storage.snapshot({
    rooms: 99,
    karaokeTablets: -5,
    serviceTablets: 4,
    modules: {}
  }));
  assert.equal(clamped.rooms, 5);
  assert.equal(clamped.karaokeTablets, 0);
  assert.equal(clamped.serviceTablets, 4);
});

test("алкоголь не входит в подтверждённую сумму до одобрения", function () {
  var fries = item("fries");
  var shots = item("shots");
  var withCart = cart.addLine([], fries, [{ id: "ketchup", title: "Кетчуп", price: 0 }], 1);
  withCart = cart.addLine(withCart, shots, [], 1);
  var sent = cart.submitCart(withCart, "");
  var lines = sent.accepted.concat(sent.pending);
  assert.equal(cart.sumByStatus(lines, "accepted"), 350);
  assert.equal(cart.sumByStatus(lines, "pending"), 1800);
  var confirmed = cart.setAlcoholStatus(lines, sent.pending[0].key, "accepted");
  assert.equal(cart.sumByStatus(confirmed, "accepted"), 2150);
  var rejected = cart.setAlcoholStatus(lines, sent.pending[0].key, "rejected");
  assert.equal(cart.sumByStatus(rejected, "accepted"), 350);
  assert.equal(cart.sumByStatus(rejected, "rejected"), 1800);
});

test("разные модификаторы не сливаются в одну строку", function () {
  var fries = item("fries");
  var next = cart.addLine([], fries, [{ id: "ketchup", title: "Кетчуп", price: 0 }], 2);
  next = cart.addLine(next, fries, [{ id: "cheese", title: "Сырный", price: 50 }], 1);
  assert.equal(next.length, 2);
  assert.equal(next[0].unitPrice, 350);
  assert.equal(next[1].unitPrice, 400);
  assert.equal(cart.cartSum(next), 1100);
});

test("состав работ на весь объект совпадает с формулой пяти комнат", function () {
  assert.equal(calc.scopeTotal(), 1160000);
  assert.equal(calc.worksCost(5), calc.scopeTotal());
  assert.equal(calc.paymentPilot()[0].amount, 326800);
  assert.equal(calc.paymentPilot()[2].amount, 163400);
  assert.equal(calc.paymentRollout()[0].amount, 142500);
  assert.equal(calc.quote({ rooms: 5, karaokeTablets: 5, serviceTablets: 5, modules: { sbp: true, split: true } }).early, 1406000);
});

test("текст расчёта не содержит старую сумму пилота", function () {
  var text = exporter.buildText({ rooms: 1, karaokeTablets: 1, serviceTablets: 1, modules: {} });
  assert.equal(text.indexOf("1 418 000"), -1);
  assert.equal(text.indexOf("1418000"), -1);
  assert.equal(text.indexOf("1\u202f320\u202f400"), -1);
  assert.ok(text.indexOf("860\u202f000") !== -1);
  assert.ok(text.indexOf("не входит") !== -1);
});
