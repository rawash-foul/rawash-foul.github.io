(function () {
  var BREADS = ['شامي', 'بلدي', 'كيزر'];
  var AR = '٠١٢٣٤٥٦٧٨٩';
  function ar(n) { return String(n).replace(/[0-9]/g, function (d) { return AR[+d]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim(); }
  var KEY = 'rawash.cart.v1', PKEY = 'rawash.profile.v1', LKEY = 'rawash.last.v1';
  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var cart = load(KEY, {}), prof = load(PKEY, { mode: 'توصيل' }), last = load(LKEY, null);
  var ENDPOINT = '', TOKEN = '';
  var pay = 'كاش عند الاستلام';
  var geo = null, data, hotline, steppers = [], mode = prof.mode || 'توصيل';
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

  function buildItem(it, c, prov) {
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
    return row;
  }

  function render() {
    var nav = $('cats'), menu = $('menu'); nav.textContent = ''; menu.textContent = ''; steppers = [];
    data.categories.forEach(function (c) {
      var prov = !!(c.note && c.note.indexOf('أبريل') > -1);
      var a = el('a', '', c.title); a.href = '#c-' + c.id; a.dataset.id = c.id; nav.appendChild(a);
      var sec = el('section', 'cat'); sec.id = 'c-' + c.id; sec.dataset.id = c.id; sec.appendChild(el('h2', '', c.title));
      if (c.note) sec.appendChild(el('p', 'sub', c.note));
      c.items.forEach(function (it) { sec.appendChild(buildItem(it, c, prov)); });
      menu.appendChild(sec);
    });
    var b = $('branches'); b.textContent = ''; b.appendChild(el('h2', '', 'الفروع والتواصل'));
    data.branches.forEach(function (x) { var c = el('div', 'bcard' + (x.name.indexOf('مدينتي') > -1 ? ' warn' : '')); c.appendChild(el('b', '', x.name)); c.appendChild(el('span', '', x.detail));
      var T = x.name.indexOf('السويس') > -1 ? ['https://www.talabat.com/ar/egypt/restaurant/795372/mahmoud-rawash-express-al-safaa?aid=6965', 'اطلب من طلبات (رواش إكسبريس)'] : x.name.indexOf('الملاحة') > -1 ? ['https://www.talabat.com/ar/egypt/restaurant/784729/foul-mahmoud-rawash-el-corniche-el-gedid?aid=6965', 'اطلب من طلبات'] : x.name.indexOf('السلام') > -1 ? ['https://www.talabat.com/ar/egypt/restaurant/784728/foul-mahmoud-rawash-sharea-othman-ebn-afaan?aid=6975', 'اطلب من طلبات'] : null;
      if (T) { var tr = el('div', 'brow'); var ta = el('a', '', T[1]); ta.href = T[0]; ta.target = '_blank'; ta.rel = 'noopener'; tr.appendChild(ta); c.appendChild(tr); }
      b.appendChild(c); });
    var r = el('div', 'brow');
    var w = el('a', '', 'واتساب'); w.href = 'https://wa.me/2' + hotline; w.target = '_blank'; w.rel = 'noopener'; r.appendChild(w);
    var t = el('a', '', 'اتصل ' + hotline); t.href = 'tel:' + hotline; r.appendChild(t);
    var m = el('a', '', 'الفروع على الخريطة'); m.href = data.maps; m.target = '_blank'; m.rel = 'noopener'; r.appendChild(m);
    b.appendChild(r);
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
    var x = 'أهلاً، عايز أطلب من فول محمود رواش\nالفرع: ' + $('branch').value + '\nالطلب: ' + mode + '\nالدفع: ' + (pay === 'إنستاباي أو محفظة' ? 'دفع إنستاباي أو محفظة (هبعت الإيصال)' : pay) + '\n\n' + body + '\n\nالإجمالي: ' + t + ' ج (بدون التوصيل)';
    if ($('name').value.trim()) x += '\nالاسم: ' + $('name').value.trim();
    if ($('phone').value.trim()) x += '\nالموبايل: ' + $('phone').value.trim();
    if (mode === 'توصيل') x += '\nالعنوان: ' + $('address').value.trim();
    if (geo && mode === 'توصيل') x += '\nموقعي على الخريطة: https://www.google.com/maps?q=' + geo.lat.toFixed(5) + ',' + geo.lon.toFixed(5);
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
  function sendToSheet(s) {
    if (!ENDPOINT || !$('consent').checked) return;
    var items = s.lines.map(function (l) { return l.qty + ' × ' + l.name + (l.prov ? ' (سعر مبدئي)' : ''); }).join('\n');
    try { fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ t: TOKEN, consent: true, name: $('name').value, phone: $('phone').value, branch: $('branch').value, mode: mode + ' / ' + pay, address: mode === 'توصيل' ? $('address').value + (geo ? ' | https://www.google.com/maps?q=' + geo.lat.toFixed(5) + ',' + geo.lon.toFixed(5) : '') : '', items: items, total: s.t, notes: $('notes').value }), keepalive: true }); } catch (e) {}
  }
  function onSent() { var s = totals(); if (!s.n) return; sendToSheet(s); last = { lines: s.lines.map(function (l) { return { k: l.k, name: l.name, price: l.price, qty: l.qty, prov: l.prov }; }) }; store(LKEY, last); saveProf(); }
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
  Array.prototype.forEach.call(document.querySelectorAll('#payseg button'), function (b) { b.onclick = function () { pay = b.dataset.p; Array.prototype.forEach.call(document.querySelectorAll('#payseg button'), function (x) { x.classList.toggle('on', x === b); }); $('payinfo').hidden = pay !== 'إنستاباي أو محفظة'; buildLink(); }; });
  $('paycopy').onclick = function () { var n = '01001844656'; function ok() { toast('اتنسخ الرقم'); } if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(n).then(ok, function () { toast(n); }); else { var t = document.createElement('textarea'); t.value = n; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast(n); } t.remove(); } };
  $('send').addEventListener('click', function (e) { if (!ready()) { e.preventDefault(); toast('اكتب العنوان الأول'); $('address').focus(); return; } onSent(); });
  if (ENDPOINT) $('consent-w').hidden = false;
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



  /* smart suggestions (rule-based) */
  var TAGS = {
    veg: { label: 'صيامي / نباتي', note: 'مفيش فيها بيض ولا جبن ولا سمن ولا لحوم مصنعة حسب اسم الصنف.' },
    light: { label: 'خفيف', note: 'من غير قلي ولا لحوم مصنعة ولا سمن حسب اسم الصنف. ده مش تصنيف صحي أو سعرات.' },
    full: { label: 'شبعان', note: 'أطباق وطاسات وميكس فيها أكتر من مكوّن.' },
    quick: { label: 'سريع', note: 'ساندوتشات ورولات تاكلها وانت ماشي.' },
    sweet: { label: 'حلو', note: 'سندوتشات الحلو.' },
    drink: { label: 'مشروبات', note: 'المشروبات الساخنة والباردة.' },
    cheap: { label: 'الأرخص', note: 'أقل الأصناف سعراً.' }
  };
  var MEAT = /بسطرم|سجق|سوسيس|لية|لحوم|فراخ/, DAIRY = /بيض|جبن|موتز|روم|شيدر|كيري|قريش|قشطة|سمن|سمنة|لبن|حليب|عجة|بيتزا|شكشوكة|مدحرج/, FRY = /مقلي|مقلية|صوابع|شيبسي|طعمية|جريل|جريلد|مقلية/;
  var UNKNOWN = /ميكس|ميجا|ماجنم|ماكس|دايناميت|حكاية|محشية|رواش/;
  function lowest(it) { return it.prices ? Math.min.apply(null, it.prices) : it.price; }
  function tagsOf(it, c) {
    var n = it.name, t = [];
    var food = ['foul-dishes', 'foul-sandwiches', 'taameya-sandwiches', 'potato-dishes', 'egg-dishes', 'side-dishes', 'potato-sandwiches', 'extra-sandwiches', 'foul-boxes', 'taameya-pieces'].indexOf(c.id) > -1;
    if (food && !MEAT.test(n) && !DAIRY.test(n) && !UNKNOWN.test(n) && c.id !== 'egg-dishes') t.push('veg');
    if (food && !MEAT.test(n) && !FRY.test(n) && !/سمن|سمنة|شيدر|موتز|قشطة|لية|ميكس|بيتزا|مقلي/.test(n) && c.id !== 'taameya-pieces') t.push('light');
    if (c.id === 'pans' || /ميكس|ميجا|ماجنم/.test(n) || (/بيض/.test(n) && MEAT.test(n))) t.push('full');
    if (/sandwiches|rolls/.test(c.id)) t.push('quick');
    if (c.id === 'sweet-sandwiches') t.push('sweet');
    if (c.id === 'drinks') t.push('drink');
    return t;
  }
  var ALL = [];
  function indexMenu() { ALL = []; data.categories.forEach(function (c) { var prov = !!(c.note && c.note.indexOf('أبريل') > -1); c.items.forEach(function (it) { ALL.push({ it: it, c: c, prov: prov, tags: tagsOf(it, c), s: norm(it.name), low: lowest(it) }); }); }); }
  var KW = [
    [/صيام|نباتي|نباتى|vegan/, 'veg'], [/خفيف|صحي|صحى|دايت|لايت|رجيم/, 'light'], [/شبعان|جعان|جوعان|وجبه كامله|وجبه كبيره|غدا|عشا|كبير/, 'full'],
    [/سريع|ساندوتش|سندوتش|ماشي|رول/, 'quick'], [/حلو|حلويات|نوتيلا|قشطه|عسل|سكر/, 'sweet'], [/مشروب|شاي|قهوه|عصير|اعشاب/, 'drink'], [/ارخص|رخيص|اقتصادي|ميزانيه|وفر/, 'cheap']
  ];
  var WORDS = { 'لحمه': 'بسطرم|سجق|سوسيس', 'لحوم': 'بسطرم|سجق|سوسيس', 'جبنه': 'جبن', 'فلافل': 'طعمي', 'طعميه': 'طعمي', 'بطاطس': 'بطاطس|مهروس', 'بيض': 'بيض', 'فول': 'فول', 'سجق': 'سجق', 'بسطرمه': 'بسطرم', 'باذنجان': 'باذنجان', 'مسقعه': 'مسقع' };
  function suggest(q) {
    var n = norm(q), tags = [], words = [], budget = null;
    var m = n.replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); }).match(/(\d{2,3})/); if (m) budget = +m[1];
    KW.forEach(function (k) { if (k[0].test(n)) tags.push(k[1]); });
    Object.keys(WORDS).forEach(function (w) { if (n.indexOf(w) > -1) words.push(new RegExp(WORDS[w])); });
    var res = ALL.filter(function (x) {
      if (budget && x.low > budget) return false;
      var ok = true;
      tags.forEach(function (t) { if (t !== 'cheap' && x.tags.indexOf(t) < 0) ok = false; });
      words.forEach(function (r) { if (!r.test(x.s)) ok = false; });
      return ok;
    });
    if (!tags.length && !words.length && budget) { res = ALL.filter(function (x) { return x.low <= budget && x.c.id !== 'drinks'; }); res.sort(function (a, b) { return b.low - a.low; }); }
    else if (!tags.length && !words.length) {
      var toks = n.split(' ').filter(function (t) { return t.length > 1 && !/^\d+$/.test(t); });
      res = ALL.filter(function (x) { return (!budget || x.low <= budget) && toks.length && toks.every(function (t) { return x.s.indexOf(t) > -1; }); });
    }
    if (!(budget && !tags.length && !words.length)) res.sort(function (a, b) { return a.low - b.low; });
    if (tags.indexOf('cheap') < 0 && tags.indexOf('sweet') < 0 && tags.indexOf('drink') < 0) { var seen = {}, pick = []; res.forEach(function (x) { if (!seen[x.c.id] || seen[x.c.id] < 2) { seen[x.c.id] = (seen[x.c.id] || 0) + 1; pick.push(x); } }); res = pick; }
    return { items: res.slice(0, 8), tags: tags, total: res.length, budget: budget };
  }
  function showSug(r, q) {
    steppers = steppers.filter(function (d) { return !d.sug; });
    var box = $('sug-res'); box.textContent = '';
    if (!r.items.length) { box.appendChild(el('p', 'empty', 'ملقيناش حاجة بالوصف ده. جرّب كلمة تانية (مثلاً: بيض، طعمية، حلو) أو كلمنا واتساب.')); return; }
    var notes = r.tags.filter(function (t) { return TAGS[t]; }).map(function (t) { return TAGS[t].label + ': ' + TAGS[t].note; });
    if (r.budget) notes.push('في حدود ' + ar(r.budget) + ' ج للصنف.');
    if (notes.length) box.appendChild(el('p', 'sugnote', notes.join(' ')));
    r.items.forEach(function (x) { var row = buildItem(x.it, x.c, x.prov); steppers[steppers.length - 1].sug = true; row.classList.add('sugitem'); var cat = el('div', 'detail', x.c.title); row.insertBefore(cat, row.firstChild); box.appendChild(row); });
    box.appendChild(el('p', 'muted', 'التصنيف حسب اسم الصنف بس. اسأل المطعم عن المكونات لو عندك حساسية أو صيام.'));
  }
  (function () {
    var chips = $('sug-chips'); ['veg', 'light', 'full', 'quick', 'sweet', 'drink', 'cheap'].forEach(function (t) { var b = el('button', '', TAGS[t].label); b.type = 'button'; b.onclick = function () { $('sug-q').value = TAGS[t].label; run(t); }; chips.appendChild(b); });
    function run(t) { if (!data) return; var q = $('sug-q').value; var r = t ? suggest(t === 'veg' ? 'صيامي' : t === 'light' ? 'خفيف' : t === 'full' ? 'شبعان' : t === 'quick' ? 'سريع' : t === 'sweet' ? 'حلو' : t === 'drink' ? 'مشروب' : 'ارخص') : suggest(q); showSug(r, q); $('sug-res').scrollIntoView({ block: 'nearest' }); }
    $('sug-go').onclick = function () { run(); };
    $('sug-q').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
  })();


  /* location + nearest branch (kept in memory only) */
  var BR = [
    { v: 'السويس (التحرير)', lat: 29.9661587, lon: 32.5542186 },
    { v: 'الملاحة الجديدة', lat: 29.9655853, lon: 32.5402279 },
    { v: 'السلام', lat: 29.9986616, lon: 32.4905024 }
  ];
  function km(a, b, c, d) { var r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r, h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) * Math.sin(y / 2); return 12742 * Math.asin(Math.sqrt(h)); }
  $('geo-btn').onclick = function () {
    var res = $('geo-res'); res.hidden = false;
    if (geo) { geo = null; res.hidden = true; $('geo-btn').textContent = '📍 حدد موقعي'; buildLink(); return; }
    if (!navigator.geolocation) { res.textContent = 'المتصفح ده مش بيدعم تحديد الموقع. اكتب العنوان بإيدك.'; return; }
    res.textContent = 'بنحدد موقعك...';
    navigator.geolocation.getCurrentPosition(function (p) {
      geo = { lat: p.coords.latitude, lon: p.coords.longitude };
      var best = null; BR.forEach(function (b) { var d = km(geo.lat, geo.lon, b.lat, b.lon); if (!best || d < best.d) best = { b: b, d: d }; });
      var msg = 'تمام، هنضيف رابط موقعك على رسالة الطلب (التوصيل بس).';
      if (best.d <= 40) { $('branch').value = best.b.v; msg += ' أقرب فرع ليك: ' + best.b.v + ' (حوالي ' + ar(best.d < 10 ? best.d.toFixed(1) : Math.round(best.d)) + ' كم). اخترناه، وتقدر تغيّره.'; }
      else msg += ' إنت بعيد عن فروعنا في السويس، اختار الفرع بإيدك.';
      res.textContent = msg; $('geo-btn').textContent = 'إلغاء الموقع'; buildLink(); saveProf();
    }, function (e) { geo = null; res.textContent = e && e.code === 1 ? 'ماوافقتش على الموقع، عادي. اكتب العنوان بإيدك.' : 'مقدرناش نحدد موقعك. اكتب العنوان بإيدك.'; }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };

  /* optional AI suggestion: one per device per day, falls back to the rule-based answer */
  var AIURL = 'https://rawash-suggest.karimanpary.workers.dev/';
  $('ai-btn').onclick = function () {
    var q = $('sug-q').value.trim(), btn = $('ai-btn'), day = new Date().toISOString().slice(0, 10);
    if (q.length < 2) { $('sug-res').textContent = ''; $('sug-res').appendChild(el('p', 'sugnote', 'اكتب الأول إنت عايز إيه في الخانة اللي فوق.')); return; }
    var used = load('rawash.ai.v1', ''); if (used === day) { $('sug-res').textContent = ''; $('sug-res').appendChild(el('p', 'sugnote', 'استخدمت الاقتراح بالذكاء الاصطناعي النهاردة. جرّب بكرة، أو استخدم زر رشّحلي العادي.')); return; }
    btn.disabled = true; btn.textContent = 'بنفكر...';
    var ctl = new AbortController(); var tm = setTimeout(function () { ctl.abort(); }, 15000);
    fetch(AIURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q, n: ALL.length }), signal: ctl.signal }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (o) {
      clearTimeout(tm); if (!o.ok || !o.j.ids || !o.j.ids.length) throw new Error('x');
      store('rawash.ai.v1', day);
      var items = o.j.ids.map(function (i) { return ALL[i]; }).filter(Boolean);
      showSug({ items: items, tags: [], total: items.length, budget: null }, q);
      var box = $('sug-res'); box.insertBefore(el('p', 'sugnote', 'اقتراح بالذكاء الاصطناعي من أسماء الأصناف بس، ممكن يغلط. اسأل المطعم عن المكونات.'), box.firstChild);
    }).catch(function () {
      showSug(suggest(q), q); var box = $('sug-res'); box.insertBefore(el('p', 'sugnote', 'الذكاء الاصطناعي مش متاح دلوقتي، ده الترشيح العادي.'), box.firstChild);
    }).then(function () { clearTimeout(tm); btn.disabled = false; btn.textContent = 'جرّب الاقتراح بالذكاء الاصطناعي (مرة في اليوم)'; });
  };

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
    render(); indexMenu(); refresh();
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
