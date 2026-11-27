(function () {
  var view = IZUMI.view;
  var stateApi = IZUMI.proposalState;
  var demo = IZUMI.demo;
  var exporter = IZUMI.exporter;
  var ui = {
    audience: "guest",
    layer: "all",
    node: "karaoke",
    demoTab: "karaoke",
    karaokePane: "sound",
    menuCat: "food",
    animeStyle: "neon",
    animeFormat: "photo",
    pathStep: 0,
    timeline: "design",
    payment: "pilot",
    summary: false,
    catalog: false,
    endAsk: false
  };
  var modalKey = "";
  var modalReturn = null;
  var observer = null;
  var renderLock = false;
  var seenBands = {};
  var revealObserver = null;

  document.getElementById("header-mount").innerHTML = view.header();
  document.getElementById("content").innerHTML = view.page(stateApi.get(), demo.get(), ui);
  document.getElementById("dock-mount").innerHTML = view.dock(stateApi.get());
  watch();
  armReveal();

  stateApi.subscribe(function () { patchBudget(); });
  demo.subscribe(function () {
    if (renderLock) return;
    patchDemo();
  });

  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  document.addEventListener("keydown", onKey);
  document.addEventListener("mouseover", function (event) {
    var button = event.target.closest && event.target.closest(".tip");
    if (button) showTip(button);
  });
  document.addEventListener("mouseout", function (event) {
    var button = event.target.closest && event.target.closest(".tip");
    if (button && document.activeElement !== button) hideTip();
  });
  document.addEventListener("focusin", function (event) {
    if (event.target.classList && event.target.classList.contains("tip")) showTip(event.target);
  });
  document.addEventListener("focusout", function (event) {
    if (event.target.classList && event.target.classList.contains("tip")) hideTip();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  setInterval(function () {
    var cooldowns = demo.get().cooldowns;
    var hot = Object.keys(cooldowns).some(function (id) {
      return Date.now() - cooldowns[id] < 10000;
    });
    if (hot) demo.tick();
  }, 1000);

  function setHTML(id, html) {
    var node = document.getElementById(id);
    if (node) node.innerHTML = html;
    armReveal();
  }

  function patchBudget() {
    var snapshot = stateApi.get();
    setHTML("budget-root", view.budget(snapshot, ui));
    setHTML("print-root", view.printSheet(snapshot));
    setHTML("dock-mount", view.dock(snapshot));
    paintOverlays();
    watch();
  }

  function patchDemo() {
    var active = document.activeElement;
    var key = active && active.getAttribute && active.getAttribute("data-key");
    var pos = active && active.selectionStart;
    setHTML("demo-root", view.demo(demo.get(), ui));
    if (key) {
      var next = document.querySelector('[data-key="' + key + '"]');
      if (next) {
        next.focus();
        if (pos != null && next.setSelectionRange) next.setSelectionRange(pos, pos);
      }
    }
    watch();
  }

  function paintOverlays() {
    var snapshot = stateApi.get();
    var html = "";
    var key = "";
    if (snapshot.confirm) {
      html = view.confirmBox();
      key = "confirm";
    } else if (ui.summary) {
      html = view.summary(snapshot);
      key = "summary";
    } else if (ui.catalog) {
      html = view.catalogModal();
      key = "catalog";
    } else if (ui.endAsk) {
      html = view.endModal();
      key = "end";
    } else if (ui.pathStep) {
      html = view.pathModal(ui.pathStep);
      key = "path-" + ui.pathStep;
    }
    if (key && key === modalKey) return;
    document.getElementById("overlay-mount").innerHTML = html;
    if (key && !modalKey) modalReturn = document.activeElement;
    if (key) {
      document.body.classList.add("modal-open");
      var button = document.querySelector("#overlay-mount button");
      if (button) button.focus();
    } else if (modalKey) {
      document.body.classList.remove("modal-open");
      if (modalReturn && modalReturn.focus) modalReturn.focus();
      modalReturn = null;
    }
    modalKey = key;
  }

  function onClick(event) {
    var tip = event.target.closest && event.target.closest(".tip");
    if (tip) {
      event.preventDefault();
      showTip(tip);
      return;
    }
    var menuButton = event.target.closest && event.target.closest("#menu-btn");
    if (menuButton) {
      var panel = document.getElementById("menu-panel");
      var open = panel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
    if (event.target.closest && event.target.closest("#menu-panel")) {
      document.getElementById("menu-panel").classList.remove("is-open");
      document.getElementById("menu-btn").setAttribute("aria-expanded", "false");
    }
    if (event.target.closest && event.target.closest("#print-btn")) {
      setHTML("print-root", view.printSheet(stateApi.get()));
      window.print();
      return;
    }

    var audience = event.target.closest && event.target.closest("[data-audience]");
    if (audience) {
      ui.audience = audience.getAttribute("data-audience");
      setHTML("audience-root", view.audience(ui));
      watch();
      return;
    }
    var layer = event.target.closest && event.target.closest("[data-layer]");
    if (layer) {
      ui.layer = layer.getAttribute("data-layer");
      setHTML("scheme-root", view.scheme(ui));
      return;
    }
    var node = event.target.closest && event.target.closest("[data-node]");
    if (node) {
      ui.node = node.getAttribute("data-node");
      setHTML("scheme-root", view.scheme(ui));
      return;
    }
    var demoTab = event.target.closest && event.target.closest("[data-demo-tab]");
    if (demoTab) {
      ui.demoTab = demoTab.getAttribute("data-demo-tab");
      patchDemo();
      return;
    }
    var pane = event.target.closest && event.target.closest("[data-pane]");
    if (pane) {
      ui.karaokePane = pane.getAttribute("data-pane");
      patchDemo();
      return;
    }
    var cat = event.target.closest && event.target.closest("[data-cat]");
    if (cat) {
      ui.menuCat = cat.getAttribute("data-cat");
      patchDemo();
      return;
    }
    var pick = event.target.closest && event.target.closest("[data-pick]");
    if (pick) {
      demo.setPick(pick.getAttribute("data-pick"), pick.getAttribute("data-option"));
      return;
    }
    var add = event.target.closest && event.target.closest("[data-add]");
    if (add) {
      demo.addItem(add.getAttribute("data-add"));
      return;
    }
    var qty = event.target.closest && event.target.closest("[data-qty]");
    if (qty) {
      var key = qty.getAttribute("data-qty");
      var line = demo.get().cart.filter(function (item) { return item.key === key; })[0];
      if (line) demo.changeQty(key, line.qty + Number(qty.getAttribute("data-delta")));
      return;
    }
    var remove = event.target.closest && event.target.closest("[data-remove]");
    if (remove) {
      demo.changeQty(remove.getAttribute("data-remove"), 0);
      return;
    }
    var preset = event.target.closest && event.target.closest("[data-preset]");
    if (preset) {
      demo.setMic(Number(preset.getAttribute("data-mic")), { preset: preset.getAttribute("data-preset") });
      return;
    }
    var micOn = event.target.closest && event.target.closest("[data-mic-on]");
    if (micOn) {
      var index = Number(micOn.getAttribute("data-mic-on"));
      demo.setMic(index, { on: !demo.get().mics[index].on });
      return;
    }
    var quick = event.target.closest && event.target.closest("[data-quick]");
    if (quick) {
      demo.quick(quick.getAttribute("data-quick"), quick.getAttribute("data-title"));
      return;
    }
    var request = event.target.closest && event.target.closest("[data-request]");
    if (request) {
      demo.setRequest(request.getAttribute("data-request"), request.getAttribute("data-next"));
      return;
    }
    var alcohol = event.target.closest && event.target.closest("[data-alcohol]");
    if (alcohol) {
      demo.setAlcohol(alcohol.getAttribute("data-alcohol"), alcohol.getAttribute("data-next"));
      return;
    }
    var step = event.target.closest && event.target.closest("[data-step]");
    if (step) {
      var kind = step.getAttribute("data-step");
      var delta = Number(step.getAttribute("data-delta"));
      var current = stateApi.get();
      if (kind === "rooms") stateApi.setRooms(current.rooms + delta);
      if (kind === "karaoke") stateApi.setTablets("karaoke", current.karaokeTablets + delta);
      if (kind === "service") stateApi.setTablets("service", current.serviceTablets + delta);
      if (kind === "sound") stateApi.setTablets("sound", current.soundDevices + delta);
      return;
    }
    var mode = event.target.closest && event.target.closest("[data-mode]");
    if (mode) {
      var value = mode.getAttribute("data-mode");
      if (value === "custom") {
        toast("Своя конфигурация включается, когда меняете число комнат или планшетов.");
        return;
      }
      stateApi.setMode(value);
      return;
    }
    var moduleButton = event.target.closest && event.target.closest("[data-module]");
    if (moduleButton) {
      stateApi.toggleModule(moduleButton.getAttribute("data-module"));
      return;
    }
    var style = event.target.closest && event.target.closest("[data-style]");
    if (style) {
      ui.animeStyle = style.getAttribute("data-style");
      setHTML("anime-root", view.anime(ui));
      return;
    }
    var format = event.target.closest && event.target.closest("[data-format]");
    if (format) {
      ui.animeFormat = format.getAttribute("data-format");
      setHTML("anime-root", view.anime(ui));
      return;
    }
    var time = event.target.closest && event.target.closest("[data-time]");
    if (time) {
      ui.timeline = time.getAttribute("data-time");
      setHTML("timeline-root", view.timelineView(ui));
      watch();
      return;
    }
    var pay = event.target.closest && event.target.closest("[data-pay]");
    if (pay) {
      ui.payment = pay.getAttribute("data-pay");
      setHTML("payment-root", view.payment(ui));
      return;
    }
    if (event.target.closest && event.target.closest("#sound-reset")) { demo.resetSound(); return; }
    if (event.target.closest && event.target.closest("#karaoke-help")) { demo.helpRequest(); toast("Обращение появилось в демонстрационной панели персонала."); return; }
    if (event.target.closest && event.target.closest("#send-order")) { demo.submitOrder(); return; }
    if (event.target.closest && event.target.closest("#end-session")) { ui.endAsk = true; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#end-yes")) { ui.endAsk = false; demo.reset(); paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#end-no")) { ui.endAsk = false; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("[data-catalog]")) { ui.catalog = true; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#catalog-close")) { ui.catalog = false; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#guest-path")) { ui.pathStep = 1; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#path-next")) { ui.pathStep = Math.min(5, ui.pathStep + 1); paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#path-prev")) { ui.pathStep = Math.max(1, ui.pathStep - 1); paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#path-close")) { ui.pathStep = 0; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#summary-copy")) { copyQuote(); return; }
    if (event.target.closest && event.target.closest("#reset-config")) { stateApi.reset(); toast("Базовая конфигурация: 5 комнат."); return; }
    if (event.target.closest && event.target.closest("#clear-config")) {
      stateApi.clearSaved();
      toast("Сохранённые настройки удалены.");
      return;
    }
    if (event.target.closest && event.target.closest("#open-summary, #pick-summary")) { ui.summary = true; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#summary-close")) { ui.summary = false; paintOverlays(); return; }
    if (event.target.closest && event.target.closest("#confirm-both")) { stateApi.resolveConfirm(true); return; }
    if (event.target.closest && event.target.closest("#confirm-keep")) { stateApi.resolveConfirm(false); return; }
    if (event.target.closest && event.target.closest("#pick-pilot")) { stateApi.setMode("pilot"); go("budget"); return; }
    if (event.target.closest && event.target.closest("#pick-full")) { stateApi.setMode("full"); go("budget"); return; }
  }

  function onInput(event) {
    var volume = event.target.getAttribute && event.target.getAttribute("data-mic-volume");
    var effect = event.target.getAttribute && event.target.getAttribute("data-mic-effect");
    if (volume != null) {
      renderLock = true;
      demo.setMic(Number(volume), { volume: Number(event.target.value) }, true);
      renderLock = false;
      var volumeLabel = event.target.parentElement && event.target.parentElement.querySelector("b");
      if (volumeLabel) volumeLabel.textContent = event.target.value;
    }
    if (effect != null) {
      renderLock = true;
      demo.setMic(Number(effect), { effect: Number(event.target.value) }, true);
      renderLock = false;
      var effectLabel = event.target.parentElement && event.target.parentElement.querySelector("b");
      if (effectLabel) effectLabel.textContent = event.target.value;
    }
    if (event.target.id === "cart-comment") demo.setComment(event.target.value);
  }

  function onKey(event) {
    if (event.key === "Escape") {
      hideTip();
      var snapshot = stateApi.get();
      if (snapshot.confirm) { stateApi.resolveConfirm(false); return; }
      if (ui.summary || ui.catalog || ui.endAsk || ui.pathStep) {
        ui.summary = false;
        ui.catalog = false;
        ui.endAsk = false;
        ui.pathStep = 0;
        paintOverlays();
      }
      return;
    }
    if (event.key !== "Tab") return;
    var dialog = document.querySelector("#overlay-mount [role='dialog']");
    if (!dialog) return;
    var items = [].slice.call(dialog.querySelectorAll("button, a, input, textarea, select")).filter(function (el) {
      return !el.disabled;
    });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function copyQuote() {
    exporter.copyText(stateApi.get()).then(function (ok) {
      toast(ok ? "Расчёт скопирован. Данные никуда не отправлены." : "Не удалось скопировать. Скачайте TXT.");
    });
  }

  function showTip(button) {
    var pop = document.getElementById("tip-pop");
    pop.textContent = button.getAttribute("data-tip");
    pop.hidden = false;
    var rect = button.getBoundingClientRect();
    var left = Math.max(8, Math.min(rect.left, window.innerWidth - 296));
    pop.style.left = left + "px";
    pop.style.top = (rect.bottom + 6) + "px";
  }

  function hideTip() {
    var pop = document.getElementById("tip-pop");
    if (pop) pop.hidden = true;
  }

  function toast(text) {
    var node = document.getElementById("toast");
    node.hidden = false;
    node.textContent = text;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { node.hidden = true; }, 3400);
  }

  function go(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function watch() {
    if (observer) observer.disconnect();
    if (!("IntersectionObserver" in window)) return;
    var links = [].slice.call(document.querySelectorAll("[data-nav]"));
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("data-nav") === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 });
    ["solution", "demo", "scope", "budget", "timeline", "terms"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  function armReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var band = entry.target;
          band.classList.add("play");
          if (band.id) seenBands[band.id] = true;
          revealObserver.unobserve(band);
          setTimeout(function () {
            band.classList.remove("play");
            band.classList.add("seen");
          }, 1400);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    }
    var bands = document.querySelectorAll(".band");
    for (var i = 0; i < bands.length; i++) {
      var band = bands[i];
      if (band.classList.contains("hero") || band.classList.contains("play") || band.classList.contains("seen")) continue;
      if (band.id && seenBands[band.id]) {
        band.classList.add("seen");
        continue;
      }
      revealObserver.observe(band);
    }
  }

  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var bar = document.getElementById("progress");
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    var header = document.querySelector(".site-header");
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
})();
