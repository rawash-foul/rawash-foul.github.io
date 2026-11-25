(function () {
  var BREADS = ['شامي', 'بلدي', 'كيزر'];
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return AR[+d]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim(); }
  var KEY = 'rawash.cart.v1', PKEY = 'rawash.profile.v1', LKEY = 'rawash.last.v1';
  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var cart = load(KEY, {}), prof = load(PKEY, { mode: 'توصيل' }), last = load(LKEY, null);
  var data, hotline, steppers = [], mode = prof.mode || 'توصيل';
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var toastT;
  function toast(m) { var t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 1400); }
  function buzz() { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }

  function add(k, name, price, prov) { var l = cart[k] || { name: name, price: price, qty: 0, prov: prov }; l.qty++; cart[k] = l; store(KEY, cart); buzz(); if (l.qty === 1) toast('اتضاف: ' + name); refresh(); }
  function rem(k) { var l = cart[k]; if (!l) return; l.qty--; if (l.qty <= 0) delete cart[k]; store(KEY, cart); buzz(); refresh(); }

  function stepper(k, name, price, prov) {
    var s = el('span', 'step');
    function draw() {
      s.textContent = ''; var q = cart[k] ? cart[k].qty : 0;
      if (q > 0) { var m = el('button', '', '−'); m.type = 'button'; m.setAttribute('aria-label', 'إنقاص ' + name); m.onclick = function () { rem(k); }; s.appendChild(m); s.appendChild(el('span', 'q', ar(q))); }
      var p = el('button', 'add', '+'); p.type = 'button'; p.setAttribute('aria-label', 'إضافة ' + name); p.onclick = function () { add(k, name, price, prov); }; s.appendChild(p);
    }
    draw(); steppers.push(draw); return s;
  }

  function render() {
    var nav = $('cats'), menu = $('menu'); nav.textContent = ''; menu.textContent = ''; steppers = [];
    data.categories.forEach(function (c) {
      var prov = !!(c.note && c.note.indexOf('أبريل') > -1);
      var a = el('a', '', c.title); a.href = '#c-' + c.id; a.dataset.id = c.id; nav.appendChild(a);
      var sec = el('section', 'cat'); sec.id = 'c-' + c.id; sec.dataset.id = c.id; sec.appendChild(el('h2', '', c.title));
      if (c.note) sec.appendChild(el('p', 'sub', c.note));
      c.items.forEach(function (it) {
        var row = el('div', 'item' + (it.prices ? '' : ' single')); row.dataset.s = norm(it.name + ' ' + c.title);
        if (it.prices) {
          row.appendChild(el('div', 'name', it.name));
          if (it.detail) row.appendChild(el('div', 'detail', it.detail));
          var opts = el('div', 'opts');
          it.prices.forEach(function (p, i) {
            var o = el('div', 'opt'); var lb = el('span', 'lbl', BREADS[i]); lb.appendChild(el('b', '', ar(p) + ' ج')); o.appendChild(lb);
            o.appendChild(stepper(c.id + '|' + it.name + '|' + BREADS[i], it.name + ' (' + BREADS[i] + ')', p, prov)); opts.appendChild(o);
          });
          row.appendChild(opts);
        } else {
          var info = el('div', 'name'); info.appendChild(document.createTextNode(it.name));
          info.appendChild(el('div', 'price', ar(it.price) + ' ج'));
          if (it.detail) info.appendChild(el('div', 'detail', it.detail));
          row.appendChild(info);
          row.appendChild(stepper(c.id + '|' + it.name, it.name, it.price, prov));
        }
        sec.appendChild(row);
      });
      menu.appendChild(sec);
    });
    var b = $('branches'); b.textContent = ''; b.appendChild(el('h2', '', 'الفروع والتواصل'));
    data.branches.forEach(function (x) { var c = el('div', 'bcard' + (x.name.indexOf('مدينتي') > -1 ? ' warn' : '')); c.appendChild(el('b', '', x.name)); c.appendChild(el('span', '', x.detail)); b.appendChild(c); });
    var r = el('div', 'brow');
    var w = el('a', '', 'واتساب'); w.href = 'https://wa.me/2' + hotline; w.target = '_blank'; w.rel = 'noopener'; r.appendChild(w);
    var t = el('a', '', 'اتصل ' + hotline); t.href = 'tel:' + hotline; r.appendChild(t);
    var m = el('a', '', 'الفروع على الخريطة'); m.href = data.maps; m.target = '_blank'; m.rel = 'noopener'; r.appendChild(m);
    b.appendChild(r);
    if (data.talabat) { var tl = el('div', 'brow'); var ta = el('a', '', 'اطلب من طلبات'); ta.href = data.talabat; ta.target = '_blank'; ta.rel = 'noopener'; tl.appendChild(ta); b.appendChild(tl); }
    $('note').textContent = 'الأسعار دي لفروع السويس والملاحة الجديدة والسلام بس. فرع مدينتي ليه منيو وأسعار مختلفة مش موجودة هنا. أسعار الأطباق والسندوتشات من المنيو المطبوع في نوفمبر ٢٠٢٦، وأقسام علب الفول وأقراص الطعمية والطاسات والحلو والمشروبات لسه بأسعار منيو أبريل ٢٠٢٦.';
    spy();
  }

  function totals() {
    var n = 0, t = 0, prov = false, lines = Object.keys(cart).map(function (k) { var l = cart[k]; l.k = k; return l; });
    lines.forEach(function (l) { n += l.qty; t += l.qty * l.price; if (l.prov) prov = true; });
    return { n: n, t: t, prov: prov, lines: lines };
  }

  function refresh() {
    steppers.forEach(function (d) { d(); });
    var s = totals();
    $('cartbar').hidden = s.n === 0;
    $('cart-count').textContent = ar(s.n); $('cart-total').textContent = ar(s.t) + ' ج';
    var L = $('lines'); L.textContent = '';
    s.lines.forEach(function (l) {
      var r = el('div', 'line'); var nm = el('div', 'l-name', l.name); nm.appendChild(el('small', '', ar(l.price) + ' ج للواحد' + (l.prov ? ' · سعر مبدئي' : ''))); r.appendChild(nm);
      var st = el('span', 'step'); var m = el('button', '', '−'); m.type = 'button'; m.onclick = function () { rem(l.k); }; var q = el('span', 'q', ar(l.qty)); var p = el('button', 'add', '+'); p.type = 'button'; p.onclick = function () { add(l.k, l.name, l.price, l.prov); };
      st.appendChild(m); st.appendChild(q); st.appendChild(p); r.appendChild(st); L.appendChild(r);
    });
    $('total').textContent = 'الإجمالي: ' + ar(s.t) + ' ج (بدون التوصيل)';
    $('prov').hidden = !s.prov;
    if (s.n === 0) $('sheet').hidden = true;
    buildLink(); reorderBtn();
  }

  function ready() { var s = totals(); if (!s.n) return false; if (mode === 'توصيل' && !$('address').value.trim()) return false; return true; }
  function orderText(lines, t) {
    var body = lines.map(function (l) { return l.qty + ' × ' + l.name + (l.prov ? ' (سعر مبدئي)' : '') + ' = ' + (l.qty * l.price) + ' ج'; }).join('\n');
    var x = 'أهلاً، عايز أطلب من فول محمود رواش\nالفرع: ' + $('branch').value + '\nالطلب: ' + mode + '\n\n' + body + '\n\nالإجمالي: ' + t + ' ج (بدون التوصيل)';
    if ($('name').value.trim()) x += '\nالاسم: ' + $('name').value.trim();
    if ($('phone').value.trim()) x += '\nالموبايل: ' + $('phone').value.trim();
    if (mode === 'توصيل') x += '\nالعنوان: ' + $('address').value.trim();
    if ($('notes').value.trim()) x += '\nملاحظات: ' + $('notes').value.trim();
    return x;
  }
  function buildLink() {
    var s = totals(); var a = $('send');
    a.href = 'https://wa.me/2' + hotline + '?text=' + encodeURIComponent(orderText(s.lines, s.t));
    var ok = ready(); a.classList.toggle('dis', !ok);
    a.textContent = s.n && mode === 'توصيل' && !$('address').value.trim() ? 'اكتب العنوان الأول' : 'ابعت الطلب على واتساب';
    $('addr-f').hidden = mode !== 'توصيل';
  }
  function saveProf() { store(PKEY, { mode: mode, name: $('name').value, phone: $('phone').value, address: $('address').value, branch: $('branch').value }); }
  function onSent() { var s = totals(); if (!s.n) return; last = { lines: s.lines.map(function (l) { return { k: l.k, name: l.name, price: l.price, qty: l.qty, prov: l.prov }; }) }; store(LKEY, last); saveProf(); }
  function reorderBtn() {
    var b = $('reorder'); var s = totals();
    if (last && last.lines && last.lines.length && !s.n) { var n = 0; last.lines.forEach(function (l) { n += l.qty; }); b.hidden = false; b.textContent = 'اطلب تاني زي آخر مرة (' + ar(n) + ' أصناف)'; } else b.hidden = true;
  }

  function spy() {
    if (!('IntersectionObserver' in window)) return;
    var links = {}; Array.prototype.forEach.call($('cats').children, function (a) { links[a.dataset.id] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { Object.keys(links).forEach(function (k) { links[k].classList.remove('on'); }); var a = links[e.target.dataset.id]; if (a) { a.classList.add('on'); var nav = $('cats'); nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' }); } } });
    }, { rootMargin: '-130px 0px -70% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('section.cat'), function (s) { io.observe(s); });
  }

  function search() {
    var q = norm($('q').value), any = false;
    Array.prototype.forEach.call(document.querySelectorAll('section.cat'), function (sec) {
      var vis = 0; Array.prototype.forEach.call(sec.querySelectorAll('.item'), function (it) { var m = !q || it.dataset.s.indexOf(q) > -1; it.hidden = !m; if (m) vis++; });
      sec.hidden = vis === 0; if (vis) any = true;
    });
    $('empty').hidden = any;
  }

  $('open-cart').onclick = function () { $('sheet').hidden = false; };
  $('close-cart').onclick = function () { $('sheet').hidden = true; };
  $('sheet').onclick = function (e) { if (e.target === $('sheet')) $('sheet').hidden = true; };
  $('clear').onclick = function () { cart = {}; store(KEY, cart); refresh(); };
  ['branch', 'name', 'phone', 'address', 'notes'].forEach(function (id) { $(id).addEventListener('input', function () { buildLink(); saveProf(); }); $(id).addEventListener('change', function () { buildLink(); saveProf(); }); });
  Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (b) { b.onclick = function () { mode = b.dataset.m; Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (x) { x.classList.toggle('on', x === b); }); saveProf(); buildLink(); }; });
  $('send').addEventListener('click', function (e) { if (!ready()) { e.preventDefault(); toast('اكتب العنوان الأول'); $('address').focus(); return; } onSent(); });
  $('reorder').onclick = function () { if (!last) return; last.lines.forEach(function (l) { cart[l.k] = { name: l.name, price: l.price, qty: l.qty, prov: l.prov }; }); store(KEY, cart); refresh(); $('sheet').hidden = false; };
  $('q').addEventListener('input', search);
  $('top').onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.addEventListener('scroll', function () { $('top').hidden = window.scrollY < 700; }, { passive: true });
  function net() { $('offline').hidden = navigator.onLine !== false; } window.addEventListener('online', net); window.addEventListener('offline', net); net();

  var deferred, standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; $('install').hidden = false; });
  $('install').onclick = function () { if (deferred) { deferred.prompt(); deferred = null; $('install').hidden = true; } };
  window.addEventListener('appinstalled', function () { $('install').hidden = true; $('getapp').hidden = true; });
  if (navigator.share) { $('share').hidden = false; $('share').onclick = function () { navigator.share({ title: 'فول محمود رواش', text: 'منيو فول محمود رواش واطلب على واتساب', url: location.href.split('#')[0] }).catch(function () {}); }; }

  ['name', 'phone', 'address'].forEach(function (id) { if (prof[id]) $(id).value = prof[id]; });
  if (prof.branch) $('branch').value = prof.branch;
  Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (x) { x.classList.toggle('on', x.dataset.m === mode); });


  /* install guide */
  var ua = navigator.userAgent, isIOS = /iphone|ipad|ipod/i.test(ua), isAnd = /android/i.test(ua), inApp = /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(ua);
  function showGuide() {
    $('os-ios').hidden = !isIOS && isAnd; $('os-android').hidden = isIOS;
    $('guide-web').hidden = !inApp; $('guide-install').hidden = !deferred;
    $('guide').hidden = false;
  }
  if (!standalone) {
    $('getapp').hidden = false; $('getapp').onclick = showGuide;
    if (!load('rawash.bar', false)) {
      var bar = el('div', 'installbar'); bar.appendChild(el('span', '', 'ثبّت رواش كتطبيق على موبايلك'));
      var go = el('button', 'go', 'إزاي؟'); go.type = 'button'; go.onclick = showGuide; bar.appendChild(go);
      var x = el('button', 'x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'إغلاق'); x.onclick = function () { bar.remove(); store('rawash.bar', true); }; bar.appendChild(x);
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }
  $('guide-x').onclick = function () { $('guide').hidden = true; };
  $('guide').onclick = function (e) { if (e.target === $('guide')) $('guide').hidden = true; };
  $('guide-install').onclick = function () { if (deferred) { deferred.prompt(); deferred = null; } $('guide').hidden = true; };

  /* feedback to WhatsApp */
  var rating = 0, sb = $('stars');
  for (var i = 1; i <= 5; i++) (function (n) { var b = el('button', '', '★'); b.type = 'button'; b.setAttribute('aria-label', n + ' من ٥'); b.onclick = function () { rating = n; Array.prototype.forEach.call(sb.children, function (x, j) { x.classList.toggle('on', j < n); }); fb(); }; sb.appendChild(b); })(i);
  function fb() {
    var t = $('fb-text').value.trim(), msg = 'رأي في فول محمود رواش\n' + (rating ? 'التقييم: ' + rating + ' من ٥\n' : '') + (t ? 'التعليق: ' + t + '\n' : '') + ($('fb-name').value.trim() ? 'الاسم: ' + $('fb-name').value.trim() : '');
    var a = $('fb-send'); a.href = 'https://wa.me/2' + (hotline || '01280855559') + '?text=' + encodeURIComponent(msg); a.classList.toggle('dis', !rating && !t);
  }
  ['fb-text', 'fb-name'].forEach(function (id) { $(id).addEventListener('input', fb); }); fb();

  fetch('menu.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d; hotline = d.hotline;
    $('hero-wa').href = 'https://wa.me/2' + hotline + '?text=' + encodeURIComponent('أهلاً، عايز أطلب من فول محمود رواش');
    $('hero-call').href = 'tel:' + hotline;
    render(); refresh();
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
