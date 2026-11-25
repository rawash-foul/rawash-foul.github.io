(function () {
  var BREADS = ['شامي', 'بلدي', 'كيزر'];
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return AR[+d]; }); }
  var KEY = 'rawash.cart.v1';
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }
  var data, hotline;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function add(k, name, price, prov) { var l = cart[k] || { name: name, price: price, qty: 0, prov: prov }; l.qty++; cart[k] = l; save(); refresh(); }
  function rem(k) { var l = cart[k]; if (!l) return; l.qty--; if (l.qty <= 0) delete cart[k]; save(); refresh(); }

  function stepper(k, name, price, prov) {
    var s = el('span', 'step'), l = cart[k], q = l ? l.qty : 0;
    if (q > 0) { var m = el('button', '', '−'); m.type = 'button'; m.setAttribute('aria-label', 'إنقاص ' + name); m.onclick = function () { rem(k); }; s.appendChild(m); s.appendChild(el('span', 'q', ar(q))); }
    var p = el('button', 'add', '+'); p.type = 'button'; p.setAttribute('aria-label', 'إضافة ' + name); p.onclick = function () { add(k, name, price, prov); }; s.appendChild(p);
    return s;
  }

  function render() {
    var nav = $('cats'), menu = $('menu'); nav.textContent = ''; menu.textContent = '';
    data.categories.forEach(function (c) {
      var prov = !!(c.note && c.note.indexOf('أبريل') > -1);
      var a = el('a', '', c.title); a.href = '#c-' + c.id; nav.appendChild(a);
      var sec = el('section', 'cat'); sec.id = 'c-' + c.id; sec.appendChild(el('h2', '', c.title));
      if (c.note) sec.appendChild(el('p', 'sub', c.note));
      c.items.forEach(function (it) {
        var row = el('div', 'item' + (it.prices ? '' : ' single'));
        if (it.prices) {
          row.appendChild(el('div', 'name', it.name));
          if (it.detail) row.appendChild(el('div', 'detail', it.detail));
          var opts = el('div', 'opts');
          it.prices.forEach(function (p, i) {
            var o = el('div', 'opt'); o.appendChild(el('span', 'lbl', BREADS[i] + ' ' + ar(p) + ' ج'));
            var k = c.id + '|' + it.name + '|' + BREADS[i];
            o.appendChild(stepper(k, it.name + ' (' + BREADS[i] + ')', p, prov)); opts.appendChild(o);
          });
          row.appendChild(opts);
        } else {
          var info = el('div', 'name'); info.appendChild(document.createTextNode(it.name));
          var pr = el('div', 'price', ar(it.price) + ' ج'); info.appendChild(pr);
          if (it.detail) info.appendChild(el('div', 'detail', it.detail));
          row.appendChild(info);
          row.appendChild(stepper(c.id + '|' + it.name, it.name, it.price, prov));
        }
        sec.appendChild(row);
      });
      menu.appendChild(sec);
    });
    var b = $('branches'); b.textContent = ''; b.appendChild(el('h2', '', 'الفروع والهوت لاين'));
    var ul = el('ul'); data.branches.forEach(function (x) { ul.appendChild(el('li', '', x.name + ': ' + x.detail)); }); b.appendChild(ul);
    b.appendChild(el('p', '', 'هوت لاين وواتساب: ' + data.hotline));
    var m = el('a', '', 'افتح الفروع على خرائط جوجل'); m.href = data.maps; m.target = '_blank'; m.rel = 'noopener'; b.appendChild(m);
    $('note').textContent = 'الأسعار دي لفروع السويس والملاحة الجديدة والسلام بس. فرع مدينتي ليه منيو وأسعار مختلفة مش موجودة هنا. أسعار الأطباق والسندوتشات من المنيو المطبوع في نوفمبر ٢٠٢٦، وأقسام علب الفول وأقراص الطعمية والطاسات والحلو والمشروبات لسه بأسعار منيو أبريل ٢٠٢٦.';
  }

  function totals() {
    var n = 0, t = 0, prov = false, lines = Object.keys(cart).map(function (k) { return cart[k]; });
    lines.forEach(function (l) { n += l.qty; t += l.qty * l.price; if (l.prov) prov = true; });
    return { n: n, t: t, prov: prov, lines: lines };
  }

  function refresh() {
    var y = window.scrollY; render(); window.scrollTo(0, y);
    var s = totals();
    $('cartbar').hidden = s.n === 0;
    $('cart-count').textContent = 'طلبك (' + ar(s.n) + ')';
    $('cart-total').textContent = ar(s.t) + ' ج';
    var L = $('lines'); L.textContent = '';
    s.lines.forEach(function (l) { var r = el('div', 'line'); r.appendChild(el('span', '', ar(l.qty) + ' × ' + l.name + (l.prov ? ' (سعر مبدئي)' : ''))); r.appendChild(el('span', '', ar(l.qty * l.price) + ' ج')); L.appendChild(r); });
    $('total').textContent = 'الإجمالي: ' + ar(s.t) + ' ج (بدون التوصيل)';
    $('prov').hidden = !s.prov;
    if (s.n === 0) $('sheet').hidden = true;
    buildLink();
  }

  function buildLink() {
    var s = totals();
    var body = s.lines.map(function (l) { return l.qty + ' × ' + l.name + (l.prov ? ' (سعر مبدئي)' : '') + ' = ' + (l.qty * l.price) + ' ج'; }).join('\n');
    var text = 'أهلاً، عايز أطلب من فول محمود رواش\nالفرع: ' + $('branch').value + '\n\n' + body + '\n\nالإجمالي: ' + s.t + ' ج (بدون التوصيل)\nالعنوان: ' + $('address').value;
    $('send').href = 'https://wa.me/2' + hotline + '?text=' + encodeURIComponent(text);
  }

  $('open-cart').onclick = function () { $('sheet').hidden = false; };
  $('close-cart').onclick = function () { $('sheet').hidden = true; };
  $('sheet').onclick = function (e) { if (e.target === $('sheet')) $('sheet').hidden = true; };
  $('clear').onclick = function () { cart = {}; save(); refresh(); };
  $('branch').onchange = buildLink; $('address').oninput = buildLink;

  var deferred;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; $('install').hidden = false; });
  $('install').onclick = function () { if (deferred) { deferred.prompt(); deferred = null; $('install').hidden = true; } };
  window.addEventListener('appinstalled', function () { $('install').hidden = true; });

  fetch('menu.json').then(function (r) { return r.json(); }).then(function (d) { data = d; hotline = d.hotline; refresh(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
