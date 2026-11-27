(function (root) {
  function lineKey(itemId, modifiers) {
    var ids = (modifiers || []).map(function (mod) { return mod.id; }).sort();
    return itemId + "|" + ids.join(",");
  }

  function lineTotal(line) {
    return line.unitPrice * line.qty;
  }

  function addLine(cart, item, modifiers, qty) {
    var next = cart.map(function (line) {
      return {
        key: line.key,
        itemId: line.itemId,
        title: line.title,
        modifiers: line.modifiers.slice(),
        unitPrice: line.unitPrice,
        qty: line.qty,
        alcohol: line.alcohol
      };
    });
    var mods = (modifiers || []).map(function (mod) {
      return { id: mod.id, title: mod.title, price: mod.price || 0 };
    });
    var extra = mods.reduce(function (sum, mod) { return sum + mod.price; }, 0);
    var key = lineKey(item.id, mods);
    var count = qty > 0 ? qty : 1;
    var found = null;
    next.forEach(function (line) {
      if (line.key === key) found = line;
    });
    if (found) {
      found.qty += count;
    } else {
      next.push({
        key: key,
        itemId: item.id,
        title: item.title,
        modifiers: mods,
        unitPrice: item.price + extra,
        qty: count,
        alcohol: item.alcohol === true
      });
    }
    return next;
  }

  function changeQty(cart, key, qty) {
    if (qty <= 0) {
      return cart.filter(function (line) { return line.key !== key; });
    }
    return cart.map(function (line) {
      if (line.key !== key) return line;
      var copy = {};
      Object.keys(line).forEach(function (name) { copy[name] = line[name]; });
      copy.qty = qty;
      return copy;
    });
  }

  function cartSum(cart) {
    return cart.reduce(function (sum, line) { return sum + lineTotal(line); }, 0);
  }

  function submitCart(cart, comment) {
    var accepted = [];
    var pending = [];
    cart.forEach(function (line) {
      var copy = {
        key: line.key + "#" + (line.alcohol ? "pending" : "accepted"),
        itemId: line.itemId,
        title: line.title,
        modifiers: line.modifiers.slice(),
        unitPrice: line.unitPrice,
        qty: line.qty,
        alcohol: line.alcohol,
        comment: comment || "",
        status: line.alcohol ? "pending" : "accepted"
      };
      if (line.alcohol) pending.push(copy);
      else accepted.push(copy);
    });
    return { accepted: accepted, pending: pending, cart: [] };
  }

  function sumByStatus(lines, status) {
    return lines.reduce(function (sum, line) {
      return line.status === status ? sum + lineTotal(line) : sum;
    }, 0);
  }

  function setAlcoholStatus(lines, key, status) {
    return lines.map(function (line) {
      if (line.key !== key) return line;
      var copy = {};
      Object.keys(line).forEach(function (name) { copy[name] = line[name]; });
      copy.status = status;
      return copy;
    });
  }

  function canFire(lastAt, now, cooldownMs) {
    if (!lastAt) return true;
    return now - lastAt >= cooldownMs;
  }

  var api = {
    lineKey: lineKey,
    addLine: addLine,
    changeQty: changeQty,
    cartSum: cartSum,
    submitCart: submitCart,
    sumByStatus: sumByStatus,
    setAlcoholStatus: setAlcoholStatus,
    canFire: canFire
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IZUMI = root.IZUMI || {};
  root.IZUMI.cart = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
