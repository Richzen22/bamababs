/* KalingaPH - js/script.js
   Basic JavaScript only. Every feature is optional: the site works with JavaScript turned off
   (menu stays open, links still work, directory shows a plain message). */
(function () {
  'use strict';
  var root = document.documentElement;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* 1. Light / dark theme (remembered in this browser only) */
  var theme = store('kph-theme'); if (theme) root.dataset.theme = theme;
  var modeBtn = document.getElementById('mode');
  if (modeBtn) modeBtn.addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark'; store('kph-theme', root.dataset.theme);
  });

  /* 2. Text size (100% / 115% / 130%) */
  var sizes = [100, 115, 130], si = +(store('kph-size') || 0);
  function applySize() { root.style.fontSize = sizes[si] + '%'; var b = document.getElementById('fsize'); if (b) b.textContent = 'Text ' + sizes[si] + '%'; }
  applySize();
  var fBtn = document.getElementById('fsize');
  if (fBtn) fBtn.addEventListener('click', function () { si = (si + 1) % sizes.length; store('kph-size', si); applySize(); });

  /* 3. Mobile menu toggle */
  var menu = document.getElementById('menu'), nav = document.getElementById('nav');
  if (menu && nav) menu.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open);
  });

  /* 4. Print button (crisis wallet card) */
  document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* 5. Home search form sends the visitor to the directory with their words */
  var hf = document.getElementById('homeForm');
  if (hf) hf.addEventListener('submit', function (e) {
    e.preventDefault();
    var k = document.getElementById('kind').value.trim(), w = document.getElementById('where').value.trim();
    location.href = 'find-help.html?q=' + encodeURIComponent((k + ' ' + w).trim());
  });

  /* 6. Directory (find-help.html only) */
  var list = document.getElementById('list');
  if (!list || typeof DATA === 'undefined') return;
  var LBL = { free: 'Free', lowcost: 'Low cost', online: 'Online', person: 'In person', hotline: '24/7 hotline', students: 'Students' };
  var q = document.getElementById('q'), place = document.getElementById('place'), count = document.getElementById('count'),
      none = document.getElementById('none'), chips = document.querySelectorAll('[data-f]'), dlg = document.getElementById('dlg');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var regions = []; DATA.forEach(function (x) { if (x.r !== 'Nationwide' && x.r !== 'Online' && regions.indexOf(x.r) < 0) regions.push(x.r); }); regions.sort();
  place.innerHTML = '<option value="">All of the Philippines</option>' + regions.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
  function tags(x) { return x.t.map(function (t) { return '<span class="tag">' + LBL[t] + '</span>'; }).join(''); }
  function run() {
    var on = []; chips.forEach(function (c) { if (c.getAttribute('aria-pressed') === 'true') on.push(c.dataset.f); });
    var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), loc = place.value;
    var out = DATA.filter(function (x) {
      var hay = (x.n + ' ' + x.c + ' ' + x.r + ' ' + x.d + ' ' + (x.addr || '') + ' ' + x.t.map(function (t) { return LBL[t]; }).join(' ')).toLowerCase();
      return on.every(function (f) { return x.t.indexOf(f) > -1; }) && (!loc || x.r === loc || x.r === 'Nationwide' || x.r === 'Online') &&
        words.every(function (w) { return hay.indexOf(w) > -1; });
    });
    list.innerHTML = out.map(function (x) {
      var call = (x.t.indexOf('hotline') > -1 && x.ph) ? '<a class="btn primary" href="tel:' + x.ph[0][1] + '">Call ' + esc(x.ph[0][0].split(' ')[0]) + '</a>' : '';
      return '<li class="card"><h3>' + esc(x.n) + '</h3><div class="tags">' + tags(x) + '</div><p>' + esc(x.c) + '. ' + esc(x.d) +
        '</p><div class="acts">' + call + '<button class="btn" type="button" data-i="' + DATA.indexOf(x) + '">See details</button></div></li>';
    }).join('');
    count.textContent = out.length + (out.length === 1 ? ' place' : ' places') + ' to get help';
    none.hidden = out.length > 0;
  }
  function row(k, v) { return v ? '<dt>' + k + '</dt><dd>' + v + '</dd>' : ''; }
  function links(a, fn) { return a && a.length ? '<div class="links">' + a.map(fn).join('') + '</div>' : ''; }
  function openDetails(i) {
    var x = DATA[i];
    document.getElementById('dtitle').textContent = x.n;
    document.getElementById('dtags').innerHTML = tags(x);
    document.getElementById('dbody').innerHTML =
      row('About', esc(x.d)) + row('Where', esc(x.c) + (x.addr ? '<br>' + esc(x.addr) : '')) + row('Hours', x.hrs && esc(x.hrs)) +
      row('Cost', x.cost && esc(x.cost)) + row('How to get help', x.how && esc(x.how)) +
      row('Call', links(x.ph, function (p) { return '<a href="tel:' + p[1] + '">' + esc(p[0]) + '</a>'; })) +
      row('Email', links(x.em, function (m) { return '<a href="mailto:' + m + '">' + esc(m) + '</a>'; })) +
      row('Online', links(x.web, function (w) { return '<a href="' + w[1] + '" target="_blank" rel="noopener">' + esc(w[0]) + ' (opens in a new tab)</a>'; })) +
      row('Good to know', x.note && esc(x.note));
    dlg.showModal(); dlg.scrollTop = 0;
  }
  list.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) openDetails(+b.dataset.i); });
  document.getElementById('dclose').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  chips.forEach(function (c) { c.addEventListener('click', function () { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); run(); }); });
  q.addEventListener('input', run); place.addEventListener('change', run);
  document.getElementById('clear').addEventListener('click', function () { q.value = ''; place.value = ''; chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); }); run(); });
  /* Pre-fill from the address, e.g. find-help.html?q=manila&f=free */
  var p = new URLSearchParams(location.search);
  if (p.get('q')) q.value = p.get('q');
  (p.get('f') || '').split(',').forEach(function (f) { chips.forEach(function (c) { if (c.dataset.f === f) c.setAttribute('aria-pressed', 'true'); }); });
  run();
})();
