/* HireLens preview helpers: icons, count-ups, score ring, fills, scroll reveals, tabs, toasts, password ticks, confetti.
   Plain classic script, no network. Icons need Lucide's UMD build loaded first by the page (pinned: lucide@0.460.0). */
(function () {
  var W = window, D = document;
  var EASE = function (t) { return 1 - Math.pow(1 - t, 4); };
  function reduce() { return !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* Lucide renamed some icons over time; try the current name first, then the older alias. */
  var ALIAS = {
    'check-circle-2': ['circle-check', 'check-circle-2', 'check-circle'],
    'check-circle': ['circle-check', 'check-circle'],
    'x-circle': ['circle-x', 'x-circle'],
    'alert-triangle': ['triangle-alert', 'alert-triangle'],
    'alert-circle': ['circle-alert', 'alert-circle'],
    'upload-cloud': ['cloud-upload', 'upload-cloud'],
    'bar-chart-3': ['chart-column', 'bar-chart-3', 'bar-chart'],
    'bar-chart-horizontal': ['chart-bar', 'bar-chart-horizontal'],
    'help-circle': ['circle-help', 'help-circle'],
    'more-horizontal': ['ellipsis', 'more-horizontal'],
    'more-vertical': ['ellipsis-vertical', 'more-vertical'],
    'circle-slash': ['circle-slash', 'circle-slash-2'],
    'minus-circle': ['circle-minus', 'minus-circle'],
    'filter': ['funnel', 'filter'],
    'pie-chart': ['chart-pie', 'pie-chart'],
    'home': ['house', 'home'],
    'edit': ['pencil', 'edit']
  };
  function pascal(n) { return String(n).replace(/(^|-)([a-z0-9])/g, function (_, a, b) { return b.toUpperCase(); }); }

  function icons(root) {
    var L = W.lucide;
    if (!L || !L.createIcons) return false;
    var pool = {};
    Object.keys(L).forEach(function (k) { if (typeof L[k] !== 'function' && /^[A-Z]/.test(k)) pool[k] = L[k]; });
    if (L.icons) Object.keys(L.icons).forEach(function (k) { pool[k] = L.icons[k]; });
    (root || D).querySelectorAll('[data-icon]').forEach(function (el) {
      var name = el.getAttribute('data-icon');
      var cands = (ALIAS[name] || []).concat([name]);
      for (var i = 0; i < cands.length; i++) {
        if (pool[pascal(cands[i])]) { el.setAttribute('data-lucide', cands[i]); el.removeAttribute('data-icon'); return; }
      }
    });
    L.createIcons({ icons: pool, nameAttr: 'data-lucide', attrs: { 'stroke-width': 1.75, 'aria-hidden': 'true', focusable: 'false' } });
    return true;
  }

  function tween(ms, step, done) {
    if (reduce() || ms <= 0) { step(1); if (done) done(); return; }
    var t0 = null;
    function f(t) { if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / ms); step(EASE(p)); if (p < 1) W.requestAnimationFrame(f); else if (done) done(); }
    W.requestAnimationFrame(f);
  }

  function countUp(el, to, ms) {
    var target = to != null ? Number(to) : Number(el.getAttribute('data-count'));
    var dec = Number(el.getAttribute('data-decimals') || 0), suf = el.getAttribute('data-suffix') || '', pre = el.getAttribute('data-prefix') || '';
    tween(ms || 600, function (p) { el.textContent = pre + (target * p).toFixed(dec) + suf; });
  }

  function band(score) {
    if (score >= 85) return { key: 'excellent', label: 'Excellent', icon: 'badge-check' };
    if (score >= 70) return { key: 'good', label: 'Good', icon: 'thumbs-up' };
    if (score >= 50) return { key: 'average', label: 'Average', icon: 'minus-circle' };
    return { key: 'poor', label: 'Poor', icon: 'alert-circle' };
  }

  var ringId = 0;
  function ring(el, score) {
    var s = score != null ? Number(score) : Number(el.getAttribute('data-score'));
    var size = el.classList.contains('hl-ring--sm') ? 44 : el.classList.contains('hl-ring--md') ? 96 : 144;
    var sw = size === 44 ? 4 : size === 96 ? 8 : 11, r = (size - sw) / 2 - 1, c = 2 * Math.PI * r, id = 'hlg' + (++ringId);
    var old = el.querySelector('svg'); if (old) old.remove();
    var ns = 'http://www.w3.org/2000/svg', svg = D.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--primary-soft)"/><stop offset="1" style="stop-color:var(--primary)"/></linearGradient></defs>' +
      '<circle class="hl-ring__track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + sw + '"/>' +
      '<circle class="hl-ring__bar" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-width="' + sw + '" stroke="url(#' + id + ')" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '"/>';
    el.insertBefore(svg, el.firstChild);
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Score ' + s + ' out of 100, ' + band(s).label);
    var bar = svg.querySelector('.hl-ring__bar'), num = el.querySelector('.hl-ring__num');
    tween(600, function (p) { bar.setAttribute('stroke-dashoffset', String(c - c * (s / 100) * p)); if (num) num.textContent = Math.round(s * p); });
    var b = el.parentNode && el.parentNode.querySelector('[data-band]');
    if (b) { var B = band(s); b.className = 'hl-band hl-band--' + B.key; b.innerHTML = '<i data-icon="' + B.icon + '"></i>' + B.label; icons(b); }
  }

  function fill(el) {
    var v = el.getAttribute('data-fill');
    if (reduce()) { el.style.width = v + '%'; return; }
    el.style.width = '0%';
    W.requestAnimationFrame(function () { W.requestAnimationFrame(function () { el.style.width = v + '%'; }); });
  }

  function popIn(container) {
    var kids = container.children;
    for (var i = 0; i < kids.length; i++) { kids[i].style.animationDelay = (i * 90) + 'ms'; kids[i].classList.add('is-pop'); }
  }

  function animateIn(scope) {
    scope.querySelectorAll('[data-count]').forEach(function (e) { if (!e.__hl) { e.__hl = 1; countUp(e); } });
    scope.querySelectorAll('.hl-ring[data-score]').forEach(function (e) { if (!e.__hl) { e.__hl = 1; ring(e); } });
    scope.querySelectorAll('[data-fill]').forEach(function (e) { if (!e.__hl) { e.__hl = 1; fill(e); } });
    scope.querySelectorAll('[data-pop]').forEach(function (e) { if (!e.__hl) { e.__hl = 1; popIn(e); } });
  }

  function reveal(root) {
    var els = (root || D).querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in W) || reduce()) { els.forEach(function (e) { e.classList.add('is-in'); animateIn(e); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); animateIn(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    setTimeout(function () { els.forEach(function (e) { if (!e.classList.contains('is-in')) { e.classList.add('is-in'); animateIn(e); } }); }, 6000);
    els.forEach(function (e, i) { if (!e.style.getPropertyValue('--reveal-delay') && e.hasAttribute('data-reveal-i')) e.style.setProperty('--reveal-delay', (Number(e.getAttribute('data-reveal-i')) * 80) + 'ms'); io.observe(e); });
  }

  function moveInd(bar, ind, btn) {
    ind.style.width = btn.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
  }
  function tabs(bar) {
    var ind = bar.querySelector('.hl-tabs__ind, .hl-seg__ind'), btns = bar.querySelectorAll('[role="tab"]');
    function select(btn, focus) {
      btns.forEach(function (b) {
        var on = b === btn; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        var p = b.getAttribute('aria-controls') && D.getElementById(b.getAttribute('aria-controls'));
        if (p) { p.hidden = !on; if (on) { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; } }
      });
      if (ind) moveInd(bar, ind, btn);
      if (focus) btn.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = btns.length;
        if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); select(btns[(i + (k === 'ArrowRight' ? 1 : n - 1)) % n], true); }
      });
    });
    var cur = bar.querySelector('[aria-selected="true"]') || btns[0];
    if (cur) { if (ind) { ind.style.transition = 'none'; moveInd(bar, ind, cur); void ind.offsetWidth; ind.style.transition = ''; } }
    if (W.ResizeObserver && ind) new ResizeObserver(function () { var c = bar.querySelector('[aria-selected="true"]'); if (c) moveInd(bar, ind, c); }).observe(bar);
  }

  var TONE = { success: 'check-circle-2', error: 'alert-circle', info: 'info' };
  function toast(msg, tone, opts) {
    opts = opts || {};
    var box = opts.container || D.querySelector('.hl-toasts');
    if (!box) { box = D.createElement('div'); box.className = 'hl-toasts'; (D.querySelector('.hl') || D.body).appendChild(box); }
    box.setAttribute('aria-live', 'polite');
    var t = D.createElement('div'); tone = tone || 'success';
    t.className = 'hl-toast hl-toast--' + tone; t.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    t.innerHTML = '<span class="hl-toast__icon"><i data-icon="' + TONE[tone] + '"></i></span><span class="hl-toast__msg"></span><button type="button" aria-label="Dismiss"><i data-icon="x" class="hl-i16"></i></button>';
    t.querySelector('.hl-toast__msg').textContent = msg;
    function close() { if (t.__gone) return; t.__gone = 1; t.classList.add('is-leaving'); setTimeout(function () { t.remove(); }, reduce() ? 0 : 240); }
    t.querySelector('button').addEventListener('click', close);
    box.appendChild(t); icons(t);
    if (opts.duration !== 0) setTimeout(close, opts.duration || 4000);
    return t;
  }

  var RULES = [function (v) { return v.length >= 8; }, function (v) { return /[A-Z]/.test(v); }, function (v) { return /[^A-Za-z0-9\s]/.test(v); }];
  function passwordTicks(input, list) {
    var items = list.querySelectorAll('li');
    function upd() { var v = input.value || ''; items.forEach(function (li, i) { var ok = RULES[i] && RULES[i](v); li.classList.toggle('is-met', !!ok); var s = li.querySelector('.hl-sr'); if (s) s.textContent = ok ? 'met' : 'not met'; }); }
    input.addEventListener('input', upd); upd();
    return upd;
  }

  function confetti(el, n) {
    if (reduce()) return;
    var cols = ['var(--primary)', 'var(--primary-soft)', 'var(--success)', 'var(--amber)', 'var(--info)', 'var(--primary-deep)'];
    for (var i = 0; i < (n || 22); i++) {
      var p = D.createElement('span'), a = (Math.PI * 2 * i) / (n || 22) + Math.random() * 0.4, d = 50 + Math.random() * 60;
      p.className = 'hl-burst__p'; p.style.background = cols[i % cols.length];
      p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d - 20 + 'px'); p.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
      if (i % 3 === 0) p.style.borderRadius = '50%';
      el.appendChild(p); setTimeout(function (x) { return function () { x.remove(); }; }(p), 1000);
    }
  }

  function init(root) {
    root = root || D;
    icons(root);
    var skip = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
    root.querySelectorAll('[data-count]').forEach(function (e) { if (!inside(e)) { if (!e.__hl) { e.__hl = 1; countUp(e); } } });
    root.querySelectorAll('.hl-ring[data-score]').forEach(function (e) { if (!inside(e) && !e.__hl) { e.__hl = 1; ring(e); } });
    root.querySelectorAll('[data-fill]').forEach(function (e) { if (!inside(e) && !e.__hl) { e.__hl = 1; fill(e); } });
    root.querySelectorAll('[data-pop]').forEach(function (e) { if (!inside(e) && !e.__hl) { e.__hl = 1; popIn(e); } });
    function inside(e) { for (var i = 0; i < skip.length; i++) if (skip[i].contains(e)) return true; return false; }
    reveal(root);
    root.querySelectorAll('.hl-tabs, .hl-seg').forEach(function (b) { if (!b.__hl) { b.__hl = 1; tabs(b); } });
  }

  W.HireLens = { init: init, icons: icons, countUp: countUp, ring: ring, band: band, fill: fill, popIn: popIn, animateIn: animateIn, reveal: reveal, tabs: tabs, toast: toast, passwordTicks: passwordTicks, confetti: confetti, reduce: reduce };
})();
