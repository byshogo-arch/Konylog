/*
 * 建材相場ボードの小さな枠（konylog.com など、ほかのサイトに置く用）
 *
 * 使い方（WordPress の「カスタムHTML」ブロック）:
 *   <section class="klt-sec kl-souba-widget" data-items="namacon,tekkin,kouzou_gouhan,cu_pika" data-after-heading="無料ツール">
 *     <h2 class="klt-h2"><span>建材相場</span><a class="klt-more" href="https://base.konylog.com/souba.html">全品目を見る →</a></h2>
 *     <p class="ksw-lead">…</p>
 *     <div class="ksw-grid"><a class="ksw-fallback" href="https://base.konylog.com/souba.html">建材相場ボードを見る →</a></div>
 *   </section>
 *   <script src="https://base.konylog.com/embed/souba-widget.js" defer></script>
 *
 * - data-items          … 出す品目のID（data/souba-items.js の id）。カンマ区切り
 * - data-after-heading  … この文字を見出し（.klt-h2）に含む節のすぐ下へ、枠を移す（なければその場に出す）
 * - data-base           … データとリンクの元（省略時はこのスクリプトと同じ https://base.konylog.com）
 *
 * 相場と指数のデータ（data/souba-items.js・data/souba-trends.js）は、枠が画面に近づいてから読み込む。
 * 読み込めなかったときは、最初から書いてある「建材相場ボードを見る →」のリンクがそのまま残る。
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var SCRIPT_BASE = 'https://base.konylog.com';
  try { if (script && script.src) SCRIPT_BASE = new URL(script.src).origin; } catch (e) { /* そのまま */ }

  var DEFAULT_ITEMS = ['namacon', 'tekkin', 'kouzou_gouhan', 'cu_pika'];
  var KIND_CLASS = { buy: 'ksw-buy', sell: 'ksw-sell', dispose: 'ksw-dispose' };

  var CSS = [
    '.kl-souba-widget{--ink:#0C2336;--ink2:#3B5164;--ink3:#5E7180;--tq:#0E7C7B;--tqf:#17A2A0;--tqp:#D8F1EF;--line:#CBD8DA}',
    '.kl-souba-widget .ksw-lead{margin:0 0 12px!important;font-size:14px;line-height:1.7;color:var(--ink2)}',
    '.kl-souba-widget .ksw-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '@media (min-width:835px){.kl-souba-widget .ksw-grid{grid-template-columns:repeat(4,1fr)}}',
    '.kl-souba-widget a.ksw-card{display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:12px;background:#fff;border:1px solid var(--line);color:var(--ink)!important;text-decoration:none!important;box-shadow:none}',
    '.kl-souba-widget a.ksw-card:hover{border-color:var(--tq)}',
    '.kl-souba-widget .ksw-top{display:flex;align-items:flex-start;gap:6px}',
    '.kl-souba-widget .ksw-badge{flex:none;font-size:11px;font-weight:800;line-height:1;padding:4px 6px;border-radius:6px;white-space:nowrap}',
    '.kl-souba-widget .ksw-buy{background:#0C2336;color:#fff}',
    '.kl-souba-widget .ksw-sell{background:#D8F1EF;color:#0F5E66}',
    '.kl-souba-widget .ksw-dispose{background:#FDEBD8;color:#9A520A}',
    '.kl-souba-widget .ksw-name{min-width:0;font-size:13px;font-weight:700;line-height:1.4}',
    '.kl-souba-widget .ksw-price{font-size:17px;font-weight:900;line-height:1.3;letter-spacing:.01em;word-break:keep-all;overflow-wrap:anywhere}',
    '.kl-souba-widget .ksw-yoy{font-size:12px;line-height:1.4;color:var(--ink3)}',
    '.kl-souba-widget .ksw-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;margin-top:10px}',
    '.kl-souba-widget .ksw-note{margin:0!important;font-size:11.5px;line-height:1.6;color:var(--ink3)}',
    // konylog.com のトップは「.article .entry-content .klt a { color: … !important }」でリンクの色をそろえているので、
    // ボタンと代わりのリンクはそれより強い指定（クラス4つ分）にする
    '.kl-souba-widget .ksw-foot a.ksw-cta.ksw-cta{display:inline-block;padding:9px 16px;border-radius:8px;background:var(--tq);color:#fff!important;font-size:13.5px;font-weight:700;line-height:1.4;text-decoration:none!important}',
    '.kl-souba-widget .ksw-foot a.ksw-cta.ksw-cta:hover{background:#0F5E66}',
    '.kl-souba-widget .ksw-grid a.ksw-fallback.ksw-fallback{grid-column:1/-1;color:var(--tq)!important;font-weight:700;text-decoration:none!important}'
  ].join('\n');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 値段の書き方は建材相場ボードと同じ（10万以上は「万円」）
  function man(n) { return String(+(n / 10000).toFixed(n >= 1000000 ? 0 : n >= 100000 ? 1 : 2)); }
  function priceText(p) {
    if (!p || (p.low == null && p.high == null)) return '';
    var lo = p.low != null ? p.low : p.high;
    var hi = p.high != null ? p.high : p.low;
    var useMan = lo >= 100000 && hi >= 100000;
    var f = function (n) { return useMan ? man(n) : n.toLocaleString('ja-JP', { maximumFractionDigits: 1 }); };
    var unit = useMan ? String(p.unit).replace(/^円/, '万円') : p.unit;
    return (lo === hi ? f(lo) : f(lo) + '〜' + f(hi)) + unit;
  }
  function yoy(T, code) {
    var s = code && T.series[code];
    if (!s) return null;
    var vals = s.values, n = vals.length - 1, prev = vals[n - 12];
    return prev && vals[n] != null ? vals[n] / prev - 1 : null;
  }

  function addStyle() {
    if (document.getElementById('kl-souba-widget-css')) return;
    var st = document.createElement('style');
    st.id = 'kl-souba-widget-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // data-after-heading の節のすぐ下へ移す
  function place(box) {
    var key = box.getAttribute('data-after-heading');
    if (!key) return;
    var heads = document.querySelectorAll('.klt-h2, h2');
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i];
      if (box.contains(h) || h.textContent.indexOf(key) < 0) continue;
      var sec = h.closest('section') || h.parentNode;
      if (sec && sec !== box && sec.parentNode) sec.parentNode.insertBefore(box, sec.nextSibling);
      return;
    }
  }

  var loading = null;
  function loadData(base) {
    if (window.KONYLOG_SOUBA && window.KONYLOG_SOUBA_TRENDS) return Promise.resolve();
    if (loading) return loading;
    var get = function (path) {
      return new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = base + path;
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    };
    loading = Promise.all([
      window.KONYLOG_SOUBA ? null : get('/data/souba-items.js'),
      window.KONYLOG_SOUBA_TRENDS ? null : get('/data/souba-trends.js')
    ]);
    return loading;
  }

  function render(box, base) {
    var D = window.KONYLOG_SOUBA, T = window.KONYLOG_SOUBA_TRENDS;
    if (!D || !T || !D.items) return;
    var board = base + '/souba.html';
    var ids = (box.getAttribute('data-items') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!ids.length) ids = DEFAULT_ITEMS;
    var cards = ids.map(function (id) {
      for (var i = 0; i < D.items.length; i++) if (D.items[i].id === id) return D.items[i];
      return null;
    }).filter(Boolean).map(function (it) {
      var k = (D.kinds || {})[it.kind] || { label: '' };
      var y = yoy(T, it.trend && it.trend.code);
      var ytxt = y == null ? '—' : (y >= 0 ? '▲ +' : '▼ −') + Math.abs(y * 100).toFixed(1) + '%';
      return '<a class="ksw-card" href="' + esc(board + '#' + it.id) + '">' +
        '<span class="ksw-top"><span class="ksw-badge ' + (KIND_CLASS[it.kind] || 'ksw-buy') + '">' + esc(k.label) + '</span>' +
        '<span class="ksw-name">' + esc(it.name) + '</span></span>' +
        '<span class="ksw-price">' + esc(priceText(it.price) || (it.priceNote ? '値上げ情報あり' : '—')) + '</span>' +
        '<span class="ksw-yoy">前年比 ' + esc(ytxt) + '</span>' +
        '</a>';
    }).join('');
    if (!cards) return;
    var grid = box.querySelector('.ksw-grid');
    if (!grid) { grid = document.createElement('div'); grid.className = 'ksw-grid'; box.appendChild(grid); }
    grid.innerHTML = cards;
    var count = box.querySelector('.ksw-count');
    if (count) count.textContent = D.items.length;
    var lm = String(T.latestMonth || '');
    var foot = box.querySelector('.ksw-foot');
    if (!foot) { foot = document.createElement('div'); foot.className = 'ksw-foot'; box.appendChild(foot); }
    foot.innerHTML =
      '<p class="ksw-note">相場目安 ' + esc(String(D.checkedAt || '').replace(/-/g, '.')) + ' 調べ／前年比は日銀の物価指数（' + esc(lm.replace('-', '.')) + '分まで）</p>' +
      '<a class="ksw-cta" href="' + esc(board) + '">建材相場ボードを開く →</a>';
  }

  function init() {
    var boxes = document.querySelectorAll('.kl-souba-widget');
    if (!boxes.length) return;
    addStyle();
    Array.prototype.forEach.call(boxes, function (box) {
      if (box.getAttribute('data-ksw-ready')) return;
      box.setAttribute('data-ksw-ready', '1');
      var base = (box.getAttribute('data-base') || SCRIPT_BASE).replace(/\/+$/, '');
      place(box);
      var go = function () { loadData(base).then(function () { render(box, base); }).catch(function () { /* リンクのまま */ }); };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
        }, { rootMargin: '800px 0px' });
        io.observe(box);
      } else {
        go();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
