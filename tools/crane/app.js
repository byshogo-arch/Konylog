/* KONYLOG TOOLS — ラフター吊り荷計算
 * Data: window.CRANE_INDEX (data/index.js) + data/models/<id>.js loaded on demand.
 * Calculation rules (conservative):
 *  - Between two printed radii / boom lengths, the smaller of the neighbouring chart values is used.
 *  - Slew zones: per outrigger state, front/rear ±half-angle rules select another chart (e.g. 最大張出 performance).
 *  - Boom angle and lifting height are geometric estimates (no deflection) — the chart itself is radius based.
 */
(() => {
  'use strict';

  // ---------- utilities ----------
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const EPS = 1e-6;
  const MAKERS = { tadano: 'タダノ', kato: '加藤製作所' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const norm360 = (a) => ((a % 360) + 360) % 360;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => (v === '' || v == null || !isFinite(+v) ? null : +v);
  function fmtT(v) {
    if (v == null || !isFinite(v)) return '—';
    const s = v.toFixed(2);
    return s.endsWith('0') ? v.toFixed(1) : s;
  }
  const fmtM = (v, d = 1) => (v == null || !isFinite(v) ? '—' : v.toFixed(d));
  const fmtL = (L) => (Number.isInteger(L) ? L.toFixed(1) : String(+L.toFixed(2)));
  const fmtKg = (v) => (v == null ? '—' : Math.round(v).toLocaleString('ja-JP'));

  function h(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
    return e;
  }
  function s(tag, attrs = {}, ...kids) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) e.setAttribute(k, v);
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
    return e;
  }
  function toggleGroup(container, items, current, onPick, opts = {}) {
    container.replaceChildren();
    container.setAttribute('role', 'radiogroup');
    for (const it of items) {
      const b = h('button', { type: 'button', role: 'radio', 'aria-checked': String(it.value === current), disabled: it.disabled || null, title: it.title || null },
        it.label, it.sub ? h('span', { class: 'sub' }, it.sub) : null);
      b.addEventListener('click', () => { if (!it.disabled) onPick(it.value); });
      container.append(b);
    }
    if (opts.hideIfSingle) container.hidden = items.length <= 1;
  }

  // ---------- data loading ----------
  const INDEX = (window.CRANE_INDEX || []).slice();
  const cache = new Map();
  const waiting = new Map();
  window.CRANE_MODEL_LOADED = (d) => { cache.set(d.id, d); const w = waiting.get(d.id); if (w) { waiting.delete(d.id); w.forEach((f) => f(d)); } };
  function loadModel(id) {
    if (cache.has(id)) return Promise.resolve(cache.get(id));
    return new Promise((resolve, reject) => {
      if (waiting.has(id)) { waiting.get(id).push(resolve); return; }
      waiting.set(id, [resolve]);
      const sc = document.createElement('script');
      sc.src = `data/models/${id}.js`;
      sc.onerror = () => { waiting.delete(id); reject(new Error('load failed: ' + id)); };
      document.head.append(sc);
    });
  }

  // ---------- state ----------
  const st = {
    maker: 'all', cls: 'all', id: null, m: null,
    ost: 'max', work: 'boom', L: null, mode: null, jib: null, off: null, jibL: null,
    R: 8, slew: 0, H: null, load: null, sling: 0.05, autoL: false, jibMounted: false,
    sf: 1, // 安全率（定格総荷重に掛ける係数）。1 = なし
    parts: null, // 巻掛本数（表が巻掛本数ごとに分かれている機種のみ）
  };
  const SF_KEY = 'konylog-crane-sf';
  try { const v = parseFloat(localStorage.getItem(SF_KEY)); if (v > 0 && v <= 1) st.sf = v; } catch (e) { /* storage unavailable */ }

  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    const g = (k) => p.get(k);
    if (g('m')) st.id = g('m');
    if (g('o')) st.ost = g('o');
    if (g('w')) st.work = g('w');
    if (g('L')) st.L = num(g('L'));
    if (g('md')) st.mode = g('md');
    if (g('j')) st.jib = num(g('j'));
    if (g('of')) st.off = num(g('of'));
    if (g('jl')) st.jibL = num(g('jl'));
    if (g('R')) st.R = num(g('R')) ?? st.R;
    if (g('s')) st.slew = norm360(num(g('s')) ?? 0);
    if (g('H')) st.H = num(g('H'));
    if (g('ld')) st.load = num(g('ld'));
    if (g('sl')) st.sling = num(g('sl')) ?? st.sling;
    st.autoL = g('a') === '1';
    st.jibMounted = g('jm') === '1';
    if (g('sf')) { const v = num(g('sf')); if (v > 0 && v <= 1) st.sf = v; }
    if (g('p')) st.parts = num(g('p'));
  }
  function writeHash() {
    const p = new URLSearchParams();
    const put = (k, v) => { if (v != null && v !== '' && v !== false) p.set(k, v); };
    put('m', st.id); put('o', st.ost); put('w', st.work); put('L', st.L); put('md', st.mode);
    if (st.work === 'jib') { put('j', st.jib); put('of', st.off); put('jl', st.jibL); }
    put('R', +st.R.toFixed(2)); put('s', Math.round(st.slew)); put('H', st.H); put('ld', st.load); put('sl', st.sling);
    if (st.autoL) p.set('a', '1');
    if (st.jibMounted) p.set('jm', '1');
    if (st.sf < 1) p.set('sf', st.sf);
    if (st.parts != null) p.set('p', st.parts);
    history.replaceState(null, '', '#' + p.toString());
  }

  // ---------- model helpers ----------
  const isTire = (ost) => ost === 'tire-static' || ost === 'tire-creep';
  function geom(m) {
    const g = m.geometry || {};
    const c = m.classTon;
    const d = c <= 5 ? [-0.6, 1.7] : c <= 16 ? [-0.9, 1.9] : c <= 25 ? [-1.4, 2.3] : c <= 35 ? [-1.5, 2.4] : c <= 60 ? [-1.6, 2.6] : [-1.8, 2.9];
    const footX = isFinite(g.footX) ? g.footX : d[0];
    const footY = isFinite(g.footY) ? g.footY : d[1];
    // hook allowance: tip height minus published max lifting height (最大地上揚程) at max boom/angle
    let allow = 1.2;
    if (m.boom.maxHeight && m.boom.max && m.boom.angleMax) {
      const a = footY + m.boom.max * Math.sin(rad(m.boom.angleMax)) - m.boom.maxHeight;
      if (a > 0.3 && a < 3.5) allow = a;
    }
    return { footX, footY, allow, estimated: !isFinite(g.footX) || g.estimated };
  }
  function vehicleDims(m) {
    const v = m.vehicle || {};
    return { len: (v.length || 10000) / 1000, wid: (v.width || 2500) / 1000 };
  }
  const stateOf = (m, id) => m.outriggers.states.find((x) => x.id === id) || m.outriggers.states[0];
  /** Some sheets print one chart per number of rope parts (chart-level `parts`). */
  const partsOptions = (m) => [...new Set(m.boomCharts.map((c) => c.parts).filter((x) => typeof x === 'number'))].sort((a, b) => b - a);
  const partsOk = (c, parts) => c.parts == null || parts == null || (Array.isArray(c.parts) ? c.parts.includes(parts) : c.parts === parts);
  /** Chart for (state, zone). Several charts may share it (e.g. one per telescoping mode or rope parts): prefer
   *  the one that has the selected mode, rope parts and boom length. */
  function findBoomChart(m, use, mode, L, parts) {
    let cands = m.boomCharts.filter((c) => c.state === use.state && c.zone === use.zone);
    if (cands.some((c) => c.parts != null) && parts != null) { const pc = cands.filter((c) => partsOk(c, parts)); if (pc.length) cands = pc; }
    if (cands.length <= 1) return cands[0];
    const withMode = cands.filter((c) => c.cols.some((k) => modeOk(k, mode)));
    const pool = withMode.length ? withMode : cands;
    if (L != null) {
      const exact = pool.find((c) => c.cols.some((k) => modeOk(k, mode) && Math.abs(k.L - L) < EPS));
      if (exact) return exact;
    }
    return pool[0];
  }
  /** Jib chart for (state, zone, jib length); angle-type charts can exist per reference boom length (boomL). */
  function findJibChart(m, use, jib, boomL) {
    const cands = (m.jibCharts || []).filter((c) => c.state === use.state && c.zone === use.zone && Math.abs(c.jib - jib) < EPS);
    return cands.find((c) => c.type === 'radius') || (boomL != null ? cands.find((c) => c.boomL != null && Math.abs(c.boomL - boomL) < EPS) : null) || cands[0];
  }
  const ownZone = (m, stateId) => (m.boomCharts.some((c) => c.state === stateId && c.zone === 'all') ? 'all' : 'side');

  /** Which chart applies for an outrigger state and slew angle. */
  function resolveZone(m, stateId, slew) {
    const so = stateOf(m, stateId);
    const a = norm360(slew);
    const dF = Math.min(a, 360 - a), dR = Math.abs(a - 180);
    for (const z of so.zones || []) {
      if (z.zone === 'front' && dF <= z.half + EPS) return { kind: z.use.zone === 'front' ? 'front' : 'front-max', rule: z, use: z.use };
      if (z.zone === 'rear' && dR <= z.half + EPS) return { kind: 'rear-max', rule: z, use: z.use };
    }
    if (so.default) return { kind: so.default.zone === 'all' ? 'all' : 'side', rule: null, use: so.default };
    const own = ownZone(m, so.id);
    return { kind: own, rule: null, use: { state: so.id, zone: own } };
  }
  function zoneLabel(m, z) {
    const so = stateOf(m, z.use.state);
    const w = so ? (so.nonUniform ? so.label : `${so.label}${fmtL(so.width)}m`) : '';
    const fl = (m.frontSpecial && m.frontSpecial.label) || '前方性能';
    if (z.kind === 'front') return { text: `${fl}（${w}の前方表）`, cls: 'zone-front' };
    if (z.kind === 'front-max') return { text: `前方域 → ${w}の性能`, cls: 'zone-max' };
    if (z.kind === 'rear-max') return { text: `後方域 → ${w}の性能`, cls: 'zone-max' };
    if (z.kind === 'all') return { text: `${w}・全周`, cls: 'zone-max' };
    return { text: `${w}・側方`, cls: 'zone-side' };
  }
  const modeOk = (col, mode) => !col.mode || !mode || String(col.mode).split(/[,\/・]/).map((x) => x.trim()).includes(mode);

  /** A printed mark on a cell (＊/★/※/#…) that changes reeving / hook for that value. Three data shapes:
   *  chart.marks[row][col] + col.alt[symbol]; col.partsStar {parts, radii}; col.marked {symbol, radii, parts, note}. */
  function cellSpecial(chart, r, j) {
    const col = chart.cols[j], R = chart.radii ? chart.radii[r] : null;
    const sym = chart.marks && chart.marks[r] ? chart.marks[r][j] : null;
    if (sym) {
      const alt = (col.alt && col.alt[sym]) || {};
      return { symbol: sym, parts: alt.parts, hook: alt.hook, note: alt.note || '' };
    }
    if (col.partsStar && R != null && (col.partsStar.radii || []).some((x) => Math.abs(x - R) < EPS)) {
      return { symbol: '＊', parts: col.partsStar.parts, hook: col.partsStar.hook, note: col.partsStar.note || `＊印は${col.partsStar.parts}本掛` };
    }
    if (col.marked && R != null && (col.marked.radii || []).some((x) => Math.abs(x - R) < EPS)) {
      return { symbol: col.marked.symbol || '※', parts: col.marked.parts, hook: col.marked.hook, note: col.marked.note || '' };
    }
    return null;
  }

  /** Conservative table lookup. cols: [{idx, L}] ascending by L. Returns {value, rows, cols, reason, note}. */
  function lookupGrid(radii, cols, val, R, L) {
    if (!cols.length) return { value: null, reason: 'このブーム長さの表がありません' };
    let lo = null, hi = null;
    for (const c of cols) { if (c.L <= L + EPS) lo = c; if (!hi && c.L >= L - EPS) hi = c; }
    if (!hi) return { value: null, reason: `ブーム長さ${fmtL(L)}mは表の最大長さを超えています` };
    if (!lo) lo = hi;
    const useCols = Math.abs(lo.L - L) < EPS ? [lo] : Math.abs(hi.L - L) < EPS ? [hi] : [lo, hi];
    let rlo = -1, rhi = -1;
    for (let i = 0; i < radii.length; i++) { if (radii[i] <= R + EPS) rlo = i; if (rhi < 0 && radii[i] >= R - EPS) rhi = i; }
    if (rhi < 0) return { value: null, reason: `作業半径${fmtM(R)}mは表の範囲外です（最大${fmtM(radii[radii.length - 1])}m）` };
    const rows = rlo < 0 ? [rhi] : Math.abs(radii[rlo] - R) < EPS ? [rlo] : Math.abs(radii[rhi] - R) < EPS ? [rhi] : [rlo, rhi];
    let note = '';
    let colsFinal = useCols;
    if (useCols.length === 2) {
      const blankLo = rows.some((r) => val(r, useCols[0].idx) == null);
      const blankHi = rows.some((r) => val(r, useCols[1].idx) == null);
      if (blankLo && !blankHi) { colsFinal = [useCols[1]]; note = `短い方（${fmtL(useCols[0].L)}m）は届かない半径のため長い方（${fmtL(useCols[1].L)}m）の値を使用`; }
      else if (blankHi) return { value: null, reason: `${fmtL(useCols[1].L)}mブームの表にこの半径の値がありません（近すぎる/遠すぎる）` };
    }
    // a column may state its maximum working radius (e.g. "2.70(7.7m)") — beyond it the boom cannot reach
    for (const c of colsFinal) {
      if (c.c && isFinite(c.c.rMax) && R > c.c.rMax + EPS) return { value: null, reason: `${fmtL(c.L)}mブームの最大作業半径は${fmtM(c.c.rMax)}mです` };
    }
    let v = Infinity;
    for (const r of rows) for (const c of colsFinal) {
      const x = val(r, c.idx);
      if (x == null) return { value: null, reason: `この半径（${fmtM(R)}m）は${fmtL(c.L)}mブームの表に値がありません` };
      v = Math.min(v, x);
    }
    return { value: v, rows, cols: colsFinal.map((c) => c.idx), note, interp: rows.length > 1 || colsFinal.length > 1 };
  }

  function boomAngleFor(m, L, R) {
    const g = geom(m);
    const c = (R - g.footX) / L;
    if (c > 1) return { angle: null, reason: 'ブームが届きません' };
    const a = deg(Math.acos(clamp(c, -1, 1)));
    return { angle: a, tipY: g.footY + L * Math.sin(rad(a)), hookY: g.footY + L * Math.sin(rad(a)) - g.allow };
  }
  function minRadius(m, L) { const g = geom(m); return g.footX + L * Math.cos(rad(m.boom.angleMax || 80)); }
  function jibGeomSolve(m, L, J, off, R) {
    // boom angle so that footX + L cos θ + J cos(θ - off) = R
    const g = geom(m);
    const f = (t) => g.footX + L * Math.cos(rad(t)) + J * Math.cos(rad(t - off));
    const amax = m.boom.angleMax || 80;
    if (R > f(0)) return null;
    if (R < f(amax)) return amax;
    let lo = 0, hi = amax;
    for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (f(mid) > R) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  // ---------- core calculation ----------
  function availableModes(m) { return (m.boom.modes || []).map((x) => x.id); }
  function boomCols(chart, mode) {
    return chart.cols.map((c, idx) => ({ idx, L: c.L, c })).filter((x) => modeOk(x.c, mode)).sort((a, b) => a.L - b.L);
  }
  function boomLengths(m, mode, parts = st.parts) {
    const set = new Set();
    for (const c of m.boomCharts) if (partsOk(c, parts)) for (const k of c.cols) if (modeOk(k, mode)) set.add(k.L);
    return [...set].sort((a, b) => a - b);
  }

  /** Evaluate capacity for given parameters. Returns a result object (never throws). */
  function evaluate(m, p) {
    const res = { ok: false, msgs: [], p };
    const hooks = m.hooks || {};
    const hookMass = (k) => (hooks[k] && hooks[k].mass) || 0;
    // --- on-tire ---
    if (isTire(p.ost)) {
      const mode = p.ost === 'tire-static' ? 'static' : 'creep';
      const frontHalf = m.onTireFrontHalf ?? 1;
      const a = norm360(p.slew), dF = Math.min(a, 360 - a);
      const zone = dF <= frontHalf + EPS ? 'front' : 'all';
      const tl = (m.onTire || []).filter((t) => partsOk(t, p.parts));
      let chart = tl.find((t) => t.mode === mode && t.zone === zone) || tl.find((t) => t.mode === mode && t.zone === 'all');
      if (!chart) { res.reason = 'アウトリガ不使用の表がありません'; return res; }
      res.chart = chart; res.chartKind = 'tire';
      res.zone = { kind: chart.zone === 'front' ? 'tire-front' : 'tire-all', label: { text: `アウトリガ不使用・${mode === 'static' ? '静止' : '走行(1.6km/h以下)'}・${chart.zone === 'front' ? `前方(±${frontHalf}°)` : '360°'}`, cls: chart.zone === 'front' ? 'zone-front' : 'zone-side' } };
      if (!chart.radii || !chart.radii.length) { res.reason = 'アウトリガ不使用の表データがありません'; return res; }
      const cols = chart.cols.map((c, idx) => ({ idx, L: c.L, c })).filter((x) => modeOk(x.c, p.mode)).sort((x, y) => x.L - y.L);
      const lk = lookupGrid(chart.radii, cols, (r, c) => chart.loads[r][c], p.R, p.L);
      return finishBoom(m, p, res, lk, chart, 'main', hookMass);
    }
    const z = resolveZone(m, p.ost, p.slew);
    res.zone = z; res.zone.label = zoneLabel(m, z);
    // --- jib ---
    if (p.work === 'jib') {
      const so = stateOf(m, z.use.state);
      const jc = findJibChart(m, z.use, p.jib, p.jibL);
      if (stateOf(m, p.ost).noJib) { res.reason = 'この張出幅ではジブ作業はできません'; return res; }
      if (!jc) { res.reason = `この条件（${res.zone.label.text}）のジブ性能表がありません`; return res; }
      res.chart = jc; res.chartKind = 'jib';
      const hk = jc.hook || 'aux'; res.hookKey = hk;
      if (jc.note) res.msgs.push({ t: 'info', s: `この表の注記：${jc.note}` });
      if (jc.type === 'radius') {
        const cols = jc.cols.map((c, idx) => ({ idx, L: c.L, c })).filter((x) => Math.abs(x.c.offset - p.off) < EPS).sort((a, b) => a.L - b.L);
        const L = p.jibL ?? (cols.length ? cols[cols.length - 1].L : null);
        const lk = lookupGrid(jc.radii, cols, (r, c) => jc.loads[r][c], p.R, L);
        res.L = L;
        const th = jibGeomSolve(m, L, p.jib, p.off, p.R);
        res.angle = th;
        if (th == null) res.msgs.push({ t: 'warn', s: '図の幾何計算ではジブ先端がこの半径に届きません（表の値を優先）' });
        if (lk.value == null) { res.reason = lk.reason; res.lk = lk; return res; }
        const used = lk.cols.map((i) => jc.cols[i]);
        const minA = Math.max(...used.map((c) => (c.angle ? c.angle[0] : -Infinity)));
        if (th != null && isFinite(minA) && th < minA - 0.5) res.msgs.push({ t: 'warn', s: `角度の目安（約${fmtM(th, 0)}°）が表の作動可能範囲（${minA}°以上）を下回っています。実機の角度表示で確認` });
        res.lk = lk; res.cap = lk.value; res.ok = true;
        if (lk.note) res.msgs.push({ t: 'info', s: lk.note });
        if (lk.interp) res.msgs.push({ t: 'info', s: '表の中間の値のため、前後の値のうち小さい方を採用しています' });
      } else {
        const ci = jc.cols.findIndex((c) => Math.abs(c.offset - p.off) < EPS);
        if (ci < 0) { res.reason = 'このオフセット角の表がありません'; return res; }
        let row = -1;
        for (let i = 0; i < jc.angles.length; i++) {
          const r = jc.radius[i][ci];
          if (r == null || jc.loads[i][ci] == null) continue;
          if (r >= p.R - EPS) { row = i; break; }
        }
        res.L = jc.boomL;
        if (row < 0) { res.reason = `作業半径${fmtM(p.R)}mは表の範囲外です`; return res; }
        // display angle: interpolate between previous defined row and this row
        let prev = -1;
        for (let i = row - 1; i >= 0; i--) if (jc.radius[i][ci] != null) { prev = i; break; }
        let ang = jc.angles[row];
        if (prev >= 0) {
          const r0 = jc.radius[prev][ci], r1 = jc.radius[row][ci];
          ang = r1 - r0 > EPS ? jc.angles[prev] + (jc.angles[row] - jc.angles[prev]) * clamp((p.R - r0) / (r1 - r0), 0, 1) : jc.angles[row];
        }
        res.angle = ang; res.angleRow = jc.angles[row];
        res.lk = { value: jc.loads[row][ci], rows: [row], cols: [ci] };
        res.cap = jc.loads[row][ci]; res.ok = true;
        res.msgs.push({ t: 'info', s: `ジブ作業はブーム角度が基準です。ブーム角度${jc.angles[row]}°の値（参考作業半径${fmtM(jc.radius[row][ci])}m）を採用${jc.boomL ? `（作業半径は${fmtL(jc.boomL)}mブーム装着時の参考値）` : ''}` });
        const c = jc.cols[ci];
        if (c.angle && ang < c.angle[0] - 0.5) res.msgs.push({ t: 'warn', s: `ブーム角度が表の作動可能範囲（${c.angle[0]}°以上）を下回ります` });
      }
      return finishCommon(m, p, res, hookMass(hk));
    }
    // --- boom / single top ---
    const chart = findBoomChart(m, z.use, p.mode, p.L, p.parts);
    if (!chart) { res.reason = 'この条件の性能表がありません'; return res; }
    res.chart = chart; res.chartKind = 'boom';
    const cols = boomCols(chart, p.mode);
    const lk = lookupGrid(chart.radii, cols, (r, c) => chart.loads[r][c], p.R, p.L);
    return finishBoom(m, p, res, lk, chart, null, hookMass);
  }

  function finishBoom(m, p, res, lk, chart, forceHook, hookMass) {
    res.L = p.L;
    const ga = boomAngleFor(m, p.L, p.R);
    res.angle = ga.angle; res.tipY = ga.tipY; res.hookY = ga.hookY;
    if (ga.angle == null) res.msgs.push({ t: 'warn', s: `図の幾何計算では${fmtL(p.L)}mブームが作業半径${fmtM(p.R)}mに届きません（表に値があれば表を優先）` });
    else if (ga.angle > (m.boom.angleMax || 90) + 0.2) res.msgs.push({ t: 'warn', s: `ブーム角度の目安が最大${m.boom.angleMax}°を超えます（半径が近すぎる可能性）` });
    if (lk.value == null) { res.reason = lk.reason; res.lk = lk; return res; }
    res.lk = lk;
    const used = lk.cols.map((i) => chart.cols[i]);
    const minA = Math.max(...used.map((c) => (c.angle ? c.angle[0] : -Infinity)));
    if (ga.angle != null && isFinite(minA) && minA > 0 && ga.angle < minA - 0.5) {
      res.msgs.push({ t: 'warn', s: `角度の目安（約${fmtM(ga.angle, 0)}°）が危険角度／作動可能範囲（${minA}°以上）を下回っています。この角度以下は無負荷でも転倒のおそれ。実機の角度表示で必ず確認` });
    }
    for (const c of used) if (c.note) res.msgs.push({ t: 'info', s: `${fmtL(c.L)}mブームの注記：${c.note}` });
    let hk = forceHook || used[used.length - 1].hook || 'main';
    // marked cells (different reeving / heavier hook for that value): use the heaviest hook among the cells used
    const hooksM = m.hooks || {};
    for (const r of lk.rows) for (const j of lk.cols) {
      const sp = cellSpecial(chart, r, j);
      if (!sp) continue;
      res.msgs.push({ t: 'warn', s: `採用した値には「${sp.symbol}」印：${[sp.note, sp.parts ? sp.parts + '本掛' : '', sp.hook && hooksM[sp.hook] ? hooksM[sp.hook].label + 'を使用' : ''].filter(Boolean).join('・')}` });
      if (sp.parts) res.partsOverride = sp.parts;
      if (sp.hook && hooksM[sp.hook] && (!hooksM[hk] || hooksM[sp.hook].mass > hooksM[hk].mass)) hk = sp.hook;
    }
    let cap = lk.value;
    res.parts = res.partsOverride ? [res.partsOverride] : used.map((c) => c.parts).filter(Boolean);
    if (p.work === 'single' && !isTire(p.ost)) {
      const stp = m.singleTop;
      if (!stp) { res.reason = 'この機種のシングルトップ（ルースタ）性能データがありません'; return res; }
      const raw = cap;
      let lim = stp.limit ?? Infinity;
      if (Array.isArray(stp.limits)) {
        const hit = stp.limits.find((x) => (x.mode == null || modeOk({ mode: x.mode }, p.mode)) &&
          (Array.isArray(x.L) ? p.L >= x.L[0] - EPS && p.L <= x.L[1] + EPS : Math.abs(x.L - p.L) < EPS));
        if (hit) lim = hit.limit;
      }
      cap = Math.min(cap - (stp.deduct || 0), lim);
      stp._lim = lim;
      hk = stp.hook || 'aux';
      res.msgs.push({ t: 'info', s: `シングルトップ（ルースタ）：ブームの値${fmtT(raw)}t − ${fmtT(stp.deduct || 0)}t（上限${fmtT(lim)}t）= ${fmtT(cap)}t` });
    }
    res.hookKey = hk;
    res.cap = cap; res.ok = cap > 0;
    if (lk.note) res.msgs.push({ t: 'info', s: lk.note });
    if (lk.interp) res.msgs.push({ t: 'info', s: '表の中間の値のため、前後の値のうち小さい方を採用しています' });
    if (p.work === 'boom' && p.jibMounted && m.jibMounted && !isTire(p.ost)) {
      const j = m.jibMounted, hm = hookMass(hk);
      const rated = Math.min(cap - hm - (j.deduct || 0), j.limit ?? Infinity);
      res.msgs.push({ t: 'info', s: `ジブ装着のままのブーム作業：定格荷重から${fmtT(j.deduct)}tを差し引き（上限${fmtT(j.limit)}t）` });
      res.cap = rated + hm;
      res.ok = rated > 0;
    }
    return finishCommon(m, p, res, hookMass(hk));
  }
  /** Derived values: 定格荷重 = 定格総荷重 − フック, 吊れる荷 = 定格荷重 − 玉掛け, and the same with 安全率 sf. */
  function finishCommon(m, p, res, hook) {
    const sf = p.sf > 0 && p.sf < 1 ? p.sf : 1;
    res.hook = hook;
    res.sf = sf;
    res.rated = res.cap - hook;
    res.net = res.rated - (p.sling || 0);
    res.capF = res.cap * sf;                       // 安全率を掛けた使用上限（総荷重）
    res.netF = res.capF - hook - (p.sling || 0);   // 安全率考慮後に吊れる荷
    if (p.load != null) {
      res.total = p.load + (p.sling || 0) + hook;
      res.ratio = res.cap > 0 ? res.total / res.cap : Infinity;
    }
    return res;
  }

  // ---------- defaults per model ----------
  /** Keep every setting that is valid for the newly loaded model (so models can be compared at the same
   *  radius / direction / load); replace only what this model does not have. */
  function pickDefaults(m) {
    const states = m.outriggers.states.map((x) => x.id);
    const tireModes = [...new Set((m.onTire || []).map((t) => (t.mode === 'static' ? 'tire-static' : 'tire-creep')))];
    if (![...states, ...tireModes].includes(st.ost)) st.ost = states[0];
    const modes = availableModes(m);
    if (!modes.length) st.mode = null; else if (!modes.includes(st.mode)) st.mode = modes[0];
    const po = partsOptions(m);
    if (!po.length) st.parts = null; else if (!po.includes(st.parts)) st.parts = po[0];
    if (isTire(st.ost)) ensureTireMode(m);
    const Ls = isTire(st.ost) ? tireLengths(m) : boomLengths(m, st.mode);
    if (!Ls.some((L) => Math.abs(L - st.L) < EPS)) {
      // nearest available length (or the 2nd shortest when nothing selected yet)
      st.L = st.L == null ? (Ls[Math.min(1, Ls.length - 1)] ?? m.boom.min) : Ls.reduce((a, b) => (Math.abs(b - st.L) < Math.abs(a - st.L) ? b : a), Ls[0]);
    }
    if (!(m.jibCharts || []).length && st.work === 'jib') st.work = 'boom';
    if (st.work === 'single' && !m.singleTop) st.work = 'boom';
    if (!m.jibMounted) st.jibMounted = false;
    syncJib(m);
    const reach = Math.max(m.boom.maxRadius || m.boom.max, (m.jib && m.jib.maxRadius) || 0);
    if (!(st.R > 0) || st.R > reach + 2) st.R = Math.round(Math.min(8, reach * 0.5));
  }
  function jibCharts(m) { return m.jibCharts || []; }
  function syncJib(m) {
    const jcs = jibCharts(m);
    if (!jcs.length) { st.jib = null; st.off = null; st.jibL = null; return; }
    const jibs = [...new Set(jcs.map((c) => c.jib))].sort((a, b) => a - b);
    if (!jibs.some((j) => Math.abs(j - st.jib) < EPS)) st.jib = jibs[0];
    const offs = [...new Set(jcs.filter((c) => Math.abs(c.jib - st.jib) < EPS).flatMap((c) => c.cols.map((k) => k.offset)))].sort((a, b) => a - b);
    if (!offs.some((o) => Math.abs(o - st.off) < EPS)) st.off = offs[0];
    const radiusType = jcs.find((c) => Math.abs(c.jib - st.jib) < EPS && c.type === 'radius');
    const Ls = radiusType
      ? [...new Set(jcs.filter((c) => Math.abs(c.jib - st.jib) < EPS && c.type === 'radius').flatMap((c) => c.cols.filter((k) => Math.abs(k.offset - st.off) < EPS).map((k) => k.L)))].sort((a, b) => a - b)
      : [...new Set(jcs.filter((c) => Math.abs(c.jib - st.jib) < EPS && c.boomL != null).map((c) => c.boomL))].sort((a, b) => a - b);
    if (!Ls.some((L) => Math.abs(L - st.jibL) < EPS)) st.jibL = Ls[Ls.length - 1] ?? null;
  }

  function params() {
    return { ost: st.ost, work: st.work, L: st.L, mode: st.mode, parts: st.parts, jib: st.jib, off: st.off, jibL: st.jibL, R: st.R, slew: st.slew, load: st.load, sling: st.sling, jibMounted: st.jibMounted, sf: st.sf };
  }

  /** Auto boom length: best capacity at R with hook height >= H. */
  function autoPick(m) {
    if (!st.autoL || st.work === 'jib') return;
    const Ls = isTire(st.ost) ? [...new Set((m.onTire || []).flatMap((c) => c.cols.map((k) => k.L)))].sort((a, b) => a - b) : boomLengths(m, st.mode);
    let best = null;
    for (const L of Ls) {
      const r = evaluate(m, { ...params(), L });
      if (!r.ok) continue;
      if (st.H != null && !(r.hookY >= st.H)) continue;
      if (!best || r.cap > best.cap + EPS) best = { L, cap: r.cap };
    }
    if (best) st.L = best.L;
  }

  // ---------- rendering: pickers ----------
  function renderPickers() {
    const makers = [{ value: 'all', label: 'すべて' }, ...Object.entries(MAKERS).filter(([k]) => INDEX.some((x) => x.maker === k)).map(([k, v]) => ({ value: k, label: v }))];
    toggleGroup($('makerSeg'), makers, st.maker, (v) => { st.maker = v; st.cls = 'all'; renderPickers(); });
    const list = INDEX.filter((x) => st.maker === 'all' || x.maker === st.maker);
    const classes = [...new Set(list.map((x) => x.classTon))].sort((a, b) => a - b);
    toggleGroup($('classChips'), [{ value: 'all', label: '全部' }, ...classes.map((c) => ({ value: c, label: `${c}t` }))], st.cls, (v) => { st.cls = v; renderPickers(); });
    const box = $('modelList');
    box.replaceChildren();
    box.setAttribute('role', 'radiogroup');
    const shown = list.filter((x) => st.cls === 'all' || x.classTon === st.cls);
    for (const x of shown) {
      const permit = permitCheck(x.vehicle).need;
      const b = h('button', { type: 'button', role: 'radio', 'aria-checked': String(x.id === st.id) },
        h('span', { class: 'm-maker' }, MAKERS[x.maker] || x.maker),
        h('span', { class: 'm-name' }, x.model),
        h('span', { class: 'm-sub' }, [x.nickname, x.maxLoad ? `${fmtT(x.maxLoad.t)}t×${fmtM(x.maxLoad.r)}m` : ''].filter(Boolean).join(' / ')),
        h('span', { class: 'm-badges' },
          h('span', { class: 'badge cls' }, `${x.classTon}t`),
          x.status === 'legacy' ? h('span', { class: 'badge legacy' }, '旧型') : null,
          x.hasFront ? h('span', { class: 'badge front' }, '前方性能あり') : null,
          x.hasJib ? h('span', { class: 'badge' }, 'ジブ') : null,
          permit ? h('span', { class: 'badge b-permit' }, '特車許可要') : h('span', { class: 'badge b-free' }, '特車許可不要')));
      b.addEventListener('click', () => selectModel(x.id, false));
      box.append(b);
    }
    if (!shown.length) box.append(h('p', { class: 'muted' }, '該当する機種がありません'));
  }

  function renderConditions() {
    const m = st.m;
    $('modelBadge').textContent = `${MAKERS[m.maker]} ${m.model}${m.nickname ? '（' + m.nickname + '）' : ''}`;
    // outriggers
    const items = m.outriggers.states.map((x) => ({ value: x.id, label: `${x.label}`, sub: x.nonUniform ? `前${fmtL(x.front)}m／後${fmtL(x.rear)}m` : `${fmtL(x.width)}m${x.note && x.note.length < 14 ? ' ' + x.note : ''}` }));
    const tireOk = (m.onTire || []).filter((t) => t.radii && t.radii.length);
    if (tireOk.some((t) => t.mode === 'static')) items.push({ value: 'tire-static', label: '不使用・静止', sub: 'タイヤ' });
    if (tireOk.some((t) => t.mode === 'creep')) items.push({ value: 'tire-creep', label: '不使用・走行', sub: '1.6km/h以下' });
    toggleGroup($('ostChips'), items, st.ost, (v) => {
      st.ost = v;
      if (isTire(v)) { st.work = 'boom'; ensureTireMode(m); }
      const Ls = isTire(v) ? tireLengths(m) : boomLengths(m, st.mode);
      if (Ls.length && !Ls.some((L) => Math.abs(L - st.L) < EPS)) st.L = Ls.reduce((a, b) => (Math.abs(b - st.L) < Math.abs(a - st.L) ? b : a), Ls[0]);
      update();
    });
    const so = isTire(st.ost) ? null : stateOf(m, st.ost);
    let hint = '';
    if (isTire(st.ost)) hint = (m.onTireNote ? m.onTireNote + ' ' : 'アウトリガを使わずタイヤで支える状態。') + '前方性能はブームがキャリヤ正面のごく狭い範囲（資料の「約2°」を左右計とみなし、本ツールは安全側に±1°で判定）のときだけ。';
    else if (so && so.zones && so.zones.length) {
      hint = so.zones.map((z) => `${z.zone === 'front' ? '前方' : '後方'}±${z.half}°は${z.use.zone === 'front' ? '前方性能表' : stateOf(m, z.use.state).label + stateOf(m, z.use.state).width + 'mの性能'}`).join('、') + '、それ以外（側方）はこの張出幅の性能。';
    } else hint = '全周（どの向きでも）同じ性能です。' + (m.boomCharts.some((c) => c.zone === 'front') ? '' : '');
    if (so && so.zones && so.zones.some((z) => z.use.zone === 'front') && so.id === m.outriggers.states[0].id) hint = so.zones.filter((z) => z.zone === 'front').map((z) => `前方±${z.half}°は前方性能表（全周より高い）`).join('') + '、それ以外は全周の性能。';
    if (so && so.note) hint += ` ※${so.note}`;
    $('ostHint').textContent = hint;
    // work
    const works = [{ value: 'boom', label: 'ブーム（主巻）' }];
    if ((m.jibCharts || []).length) works.push({ value: 'jib', label: 'ジブ（補巻）', disabled: isTire(st.ost) });
    if (m.singleTop) works.push({ value: 'single', label: 'シングルトップ', disabled: isTire(st.ost), title: 'ブーム先端のシングルトップ（ルースタシーブ）で補巻フックを使用' });
    toggleGroup($('workSeg'), works, st.work, (v) => { st.work = v; syncJib(m); update(); });
    // jib options
    const jibOn = st.work === 'jib';
    $('jibOpts').hidden = !jibOn;
    if (jibOn) {
      const jcs = jibCharts(m);
      const jibs = [...new Set(jcs.map((c) => c.jib))].sort((a, b) => a - b);
      toggleGroup($('jibChips'), jibs.map((j) => ({ value: j, label: `${fmtL(j)}m` })), st.jib, (v) => { st.jib = v; syncJib(m); update(); });
      const offs = [...new Set(jcs.filter((c) => Math.abs(c.jib - st.jib) < EPS).flatMap((c) => c.cols.map((k) => k.offset)))].sort((a, b) => a - b);
      toggleGroup($('offChips'), offs.map((o) => ({ value: o, label: `${o}°` })), st.off, (v) => { st.off = v; syncJib(m); update(); });
    }
    $('jibMountedWrap').hidden = !(m.jibMounted && st.work === 'boom' && !isTire(st.ost));
    $('jibMounted').checked = st.jibMounted;
    // boom lengths
    const po = partsOptions(m);
    $('partsSeg').hidden = !po.length || st.work === 'jib';
    if (po.length) toggleGroup($('partsSeg'), po.map((n) => ({ value: n, label: `${n}本掛`, title: '巻掛本数ごとの表' })), st.parts, (v) => {
      st.parts = v;
      const Ls = isTire(st.ost) ? tireLengths(m) : boomLengths(m, st.mode);
      if (Ls.length && !Ls.some((L) => Math.abs(L - st.L) < EPS)) st.L = Ls.reduce((a, b) => (Math.abs(b - st.L) < Math.abs(a - st.L) ? b : a), Ls[0]);
      update();
    });
    const modes = availableModes(m);
    $('modeSeg').hidden = !modes.length || st.work === 'jib' || isTire(st.ost);
    if (modes.length) toggleGroup($('modeSeg'), (m.boom.modes || []).map((x) => ({ value: x.id, label: `伸縮${x.label || x.id}` })), st.mode, (v) => { st.mode = v; const Ls = boomLengths(m, v); if (!Ls.some((L) => Math.abs(L - st.L) < EPS)) st.L = Ls[0]; update(); });
    let Ls, cur;
    if (st.work === 'jib') {
      const jcs = jibCharts(m).filter((c) => Math.abs(c.jib - st.jib) < EPS);
      if (jcs.some((c) => c.type === 'radius')) {
        Ls = [...new Set(jcs.filter((c) => c.type === 'radius').flatMap((c) => c.cols.filter((k) => Math.abs(k.offset - st.off) < EPS).map((k) => k.L)))].sort((a, b) => a - b);
        cur = st.jibL;
        toggleGroup($('lenChips'), Ls.map((L) => ({ value: L, label: `${fmtL(L)}m` })), cur, (v) => { st.jibL = v; update(); });
      } else {
        const bl = [...new Set(jcs.map((c) => c.boomL).filter((x) => x != null))].sort((a, b) => a - b);
        toggleGroup($('lenChips'), bl.map((L) => ({ value: L, label: `${fmtL(L)}m`, sub: '半径の基準' })), st.jibL, (v) => { st.jibL = v; update(); });
      }
    } else {
      Ls = isTire(st.ost) ? tireLengths(m) : boomLengths(m, st.mode);
      toggleGroup($('lenChips'), Ls.map((L) => ({ value: L, label: `${fmtL(L)}m` })), st.L, (v) => { st.L = v; st.autoL = false; update(); });
    }
    $('autoL').checked = st.autoL;
    $('autoL').closest('label').hidden = st.work === 'jib';
    // inputs
    setIfNotFocused('inR', fmtM(st.R));
    setIfNotFocused('inSlew', Math.round(st.slew));
    setIfNotFocused('inH', st.H == null ? '' : fmtM(st.H));
    setIfNotFocused('inLoad', st.load == null ? '' : st.load);
    setIfNotFocused('inSling', st.sling);
    // safety factor
    const sfOpts = [1, 0.9, 0.85, 0.8];
    toggleGroup($('sfChips'), sfOpts.map((v) => ({ value: v, label: v === 1 ? 'なし' : `×${v}` })), sfOpts.includes(st.sf) ? st.sf : null, (v) => setSf(v));
    setIfNotFocused('inSf', sfOpts.includes(st.sf) ? '' : st.sf);
    // quick direction
    const q = $('quickDir'); q.replaceChildren();
    for (const [lbl, a] of [['前方 0°', 0], ['右側方 90°', 90], ['後方 180°', 180], ['左側方 270°', 270]]) {
      q.append(h('button', { type: 'button', onclick: () => { st.slew = a; update(); } }, lbl));
    }
  }
  /** On-tire tables may exist only for some telescoping modes (e.g. 特殊伸縮): switch to one that has them. */
  function ensureTireMode(m) {
    if (tireLengths(m).length) return;
    for (const md of availableModes(m)) { st.mode = md; if (tireLengths(m).length) return; }
  }
  const tireLengths = (m) => [...new Set((m.onTire || []).filter((c) => c.radii && c.radii.length && partsOk(c, st.parts)).flatMap((c) => c.cols.filter((k) => modeOk(k, st.mode)).map((k) => k.L)))].sort((a, b) => a - b);
  function setIfNotFocused(id, v) { const e = $(id); if (document.activeElement !== e) e.value = v; }

  // ---------- rendering: side view ----------
  let sideMap = null;
  function renderSide(res) {
    const m = st.m, svg = $('sideSvg');
    const g = geom(m);
    // narrow screens: smaller drawing so the labels stay readable after scaling
    const narrow = (svg.clientWidth || 640) < 520;
    const W = narrow ? 460 : 640, H = narrow ? 380 : 430, padL = 34, padR = 14, padT = 12, padB = 30;
    const Lraw = res && res.L != null ? res.L : st.L;
    const Lcur = isFinite(Lraw) && Lraw > 0 ? Lraw : m.boom.min;
    const Jcur = st.work === 'jib' ? (st.jib || 0) : 0;
    const reach = g.footX + Lcur + Jcur;
    const reachX = Math.max(reach + 2, st.R + 3, 12);
    const reachY = Math.max(g.footY + Lcur + Jcur + 1.5, (st.H || 0) + 3, 10);
    const { len, wid } = vehicleDims(m);
    const xmin = -(Math.max(len / 2, 4) + 1), xmax = reachX + 1.5;
    const sc = Math.min((W - padL - padR) / (xmax - xmin), (H - padT - padB) / reachY);
    const X = (x) => padL + (x - xmin) * sc, Y = (y) => H - padB - y * sc;
    sideMap = { inv: (px, py) => ({ x: (px - padL) / sc + xmin, y: (H - padB - py) / sc }), X, Y };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    // grid
    const step = reachX > 45 ? 10 : 5;
    const grid = s('g', { stroke: '#E4DFD3', 'stroke-width': 1 });
    for (let x = 0; x <= xmax; x += step) grid.append(s('line', { x1: X(x), y1: Y(0), x2: X(x), y2: Y(reachY) }));
    for (let y = 0; y <= reachY; y += step) grid.append(s('line', { x1: X(xmin), y1: Y(y), x2: X(xmax), y2: Y(y) }));
    svg.append(grid);
    const lab = s('g', { 'font-size': 10, fill: '#6B7078' });
    for (let x = 0; x <= xmax; x += step) lab.append(s('text', { x: X(x), y: H - padB + 13, 'text-anchor': 'middle' }, `${x}`));
    for (let y = step; y <= reachY; y += step) lab.append(s('text', { x: padL - 4, y: Y(y) + 3, 'text-anchor': 'end' }, `${y}`));
    lab.append(s('text', { x: W - padR, y: H - 4, 'text-anchor': 'end' }, '作業半径 (m)'));
    lab.append(s('text', { x: 4, y: padT + 8 }, '高さ(m)'));
    svg.append(lab);
    svg.append(s('line', { x1: X(xmin), y1: Y(0), x2: X(xmax), y2: Y(0), stroke: '#1E2229', 'stroke-width': 2 }));
    // carrier projected into the boom plane
    const a = rad(st.slew);
    const half = (len / 2) * Math.abs(Math.cos(a)) + (wid / 2) * Math.abs(Math.sin(a));
    const tire = isTire(st.ost);
    const so = tire ? null : stateOf(m, st.ost);
    const ow = so ? so.width : wid;
    const ox = len * 0.36;
    // projected outrigger pads onto boom direction (x fwd, y right)
    const pads = tire ? [] : [[ox, ow / 2], [ox, -ow / 2], [-ox, ow / 2], [-ox, -ow / 2]].map(([px, py]) => px * Math.cos(a) + py * Math.sin(a));
    const carrierH = Math.max(1.2, g.footY - 0.9);
    const body = s('g', {});
    body.append(s('rect', { x: X(-half), y: Y(carrierH), width: 2 * half * sc, height: (carrierH - 0.5) * sc, fill: '#F39C12', stroke: '#1E2229', 'stroke-width': 1.5 }));
    // wheels (two axles projected)
    const wr = Math.max(0.55, Math.min(0.8, m.classTon / 60 + 0.5));
    for (const ax of [len * 0.3, -len * 0.3]) {
      const px = ax * Math.cos(a);
      body.append(s('circle', { cx: X(px), cy: Y(wr), r: wr * sc, fill: '#1E2229' }));
      body.append(s('circle', { cx: X(px), cy: Y(wr), r: wr * sc * 0.45, fill: '#9AA0A8' }));
    }
    for (const p of pads) {
      body.append(s('line', { x1: X(p), y1: Y(carrierH - 0.6), x2: X(p), y2: Y(0.15), stroke: '#1E2229', 'stroke-width': 3 }));
      body.append(s('rect', { x: X(p) - 0.45 * sc, y: Y(0.18), width: 0.9 * sc, height: 0.18 * sc, fill: '#1E2229' }));
    }
    // upper structure (turntable + counterweight + cab)
    const upH = g.footY + 0.3;
    body.append(s('rect', { x: X(g.footX - 1.6), y: Y(upH), width: 2.6 * sc, height: (upH - carrierH) * sc, fill: '#00B4D8', stroke: '#1E2229', 'stroke-width': 1.5 }));
    body.append(s('rect', { x: X(g.footX - 2.0), y: Y(upH - 0.1), width: 1.0 * sc, height: (upH - carrierH - 0.1) * sc, fill: '#4A4F57', stroke: '#1E2229', 'stroke-width': 1 }));
    svg.append(body);
    // slewing centre line
    svg.append(s('line', { x1: X(0), y1: Y(0), x2: X(0), y2: Y(upH + 1), stroke: '#1E2229', 'stroke-dasharray': '3 3', 'stroke-width': 1 }));
    // boom & jib
    const L = Lcur;
    const angle = res && res.angle != null && isFinite(res.angle) ? res.angle : null;
    const th = angle != null ? angle : 0;
    const fx = g.footX, fy = g.footY;
    const ux = Math.cos(rad(th)), uy = Math.sin(rad(th));
    const tip = { x: fx + L * ux, y: fy + L * uy };
    const nSec = m.boom.sections || 4;
    const bw0 = clamp(m.classTon / 60 + 0.55, 0.55, 1.5);
    const boomG = s('g', {});
    for (let i = 0; i < nSec; i++) {
      const s0 = (i / nSec) * L * 0.92, s1 = i === nSec - 1 ? L : ((i + 1) / nSec) * L + L * 0.08;
      const w = bw0 * (1 - i * 0.12);
      const nx = -uy, ny = ux;
      const pts = [[fx + ux * s0 + nx * w / 2, fy + uy * s0 + ny * w / 2], [fx + ux * s1 + nx * w / 2, fy + uy * s1 + ny * w / 2], [fx + ux * s1 - nx * w / 2, fy + uy * s1 - ny * w / 2], [fx + ux * s0 - nx * w / 2, fy + uy * s0 - ny * w / 2]];
      boomG.append(s('polygon', { points: pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' '), fill: i % 2 ? '#FFFFFF' : '#F4F0E8', stroke: '#1E2229', 'stroke-width': 1.3 }));
    }
    boomG.append(s('circle', { cx: X(fx), cy: Y(fy), r: 3.5, fill: '#1E2229' }));
    svg.append(boomG);
    let hookPt = tip;
    if (st.work === 'jib' && st.jib) {
      const ja = rad(th - (st.off || 0));
      const jt = { x: tip.x + st.jib * Math.cos(ja), y: tip.y + st.jib * Math.sin(ja) };
      svg.append(s('line', { x1: X(tip.x), y1: Y(tip.y), x2: X(jt.x), y2: Y(jt.y), stroke: '#7B5CD6', 'stroke-width': 4, 'stroke-linecap': 'round' }));
      svg.append(s('line', { x1: X(tip.x), y1: Y(tip.y), x2: X(jt.x), y2: Y(jt.y), stroke: '#fff', 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
      hookPt = jt;
    }
    // rope + hook + load
    const judge = res && res.ok && res.ratio != null ? judgeOf(res.ratio).cls : res && !res.ok ? 'ng' : 'idle';
    const colors = { ok: '#1E9E5A', caution: '#C99A00', warn: '#E07B00', ng: '#D93B3B', idle: '#00B4D8' };
    const hookY = clamp(st.H != null ? Math.min(st.H, hookPt.y - 1) : Math.min(hookPt.y * 0.35, hookPt.y - 1.5), 1.2, Math.max(1.2, hookPt.y - 0.8));
    svg.append(s('line', { x1: X(hookPt.x), y1: Y(hookPt.y), x2: X(hookPt.x), y2: Y(hookY), stroke: '#1E2229', 'stroke-width': 1.3 }));
    svg.append(s('rect', { x: X(hookPt.x) - 5, y: Y(hookY) - 2, width: 10, height: 9, fill: '#1E2229' }));
    const lw = clamp(m.classTon / 25 + 0.8, 0.9, 3) * sc, lh = clamp(m.classTon / 35 + 0.6, 0.7, 2.2) * sc;
    svg.append(s('line', { x1: X(hookPt.x), y1: Y(hookY) + 7, x2: X(hookPt.x) - lw / 2, y2: Y(hookY) + 7 + lh * 0.6, stroke: '#4A4F57' }));
    svg.append(s('line', { x1: X(hookPt.x), y1: Y(hookY) + 7, x2: X(hookPt.x) + lw / 2, y2: Y(hookY) + 7 + lh * 0.6, stroke: '#4A4F57' }));
    svg.append(s('rect', { x: X(hookPt.x) - lw / 2, y: Y(hookY) + 7 + lh * 0.6, width: lw, height: lh, fill: colors[judge], stroke: '#1E2229', 'stroke-width': 1.5 }));
    // radius dimension
    const dimY = Y(0) - 8;
    svg.append(s('line', { x1: X(0), y1: dimY, x2: X(st.R), y2: dimY, stroke: '#D93B3B', 'stroke-width': 2, 'marker-end': 'url(#arr)' }));
    svg.append(s('defs', {}, s('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, s('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#D93B3B' }))));
    const rl = s('g', { 'font-size': 13, 'font-weight': 700 });
    rl.append(s('rect', { x: X(st.R / 2) - 40, y: dimY - 20, width: 80, height: 17, fill: '#fff', stroke: '#D93B3B' }));
    rl.append(s('text', { x: X(st.R / 2), y: dimY - 7, 'text-anchor': 'middle', fill: '#D93B3B' }, `R ${fmtM(st.R)}m`));
    svg.append(rl);
    // angle arc + label
    if (angle != null) {
      const ar = Math.min(4.5, L * 0.22);
      const p0 = { x: fx + ar, y: fy }, p1 = { x: fx + ar * Math.cos(rad(th)), y: fy + ar * Math.sin(rad(th)) };
      svg.append(s('path', { d: `M${X(p0.x)},${Y(p0.y)} A${ar * sc},${ar * sc} 0 0 0 ${X(p1.x)},${Y(p1.y)}`, fill: 'none', stroke: '#7B5CD6', 'stroke-width': 2 }));
      svg.append(s('line', { x1: X(fx), y1: Y(fy), x2: X(fx + ar * 1.15), y2: Y(fy), stroke: '#7B5CD6', 'stroke-dasharray': '3 2' }));
      const lp = { x: fx + ar * 1.25 * Math.cos(rad(th / 2)), y: fy + ar * 1.25 * Math.sin(rad(th / 2)) };
      svg.append(s('text', { x: X(lp.x) + 4, y: Y(lp.y) + 4, 'font-size': 13, 'font-weight': 700, fill: '#7B5CD6' }, `${fmtM(angle, 0)}°`));
      // tip height
      svg.append(s('text', { x: X(hookPt.x) + 8, y: Y(hookPt.y) - 6, 'font-size': 11, fill: '#1E2229' }, `先端 ${fmtM(hookPt.y)}m`));
      svg.append(s('text', { x: X(tip.x) - 6, y: Y(tip.y) + (st.work === 'jib' ? 14 : -18), 'font-size': 11, 'text-anchor': 'end', fill: '#4A4F57' }, `${st.work === 'jib' ? 'ブーム' : ''}${fmtL(L)}m`));
    } else {
      svg.append(s('text', { x: X(0) + 10, y: Y(reachY) + 18, 'font-size': 13, 'font-weight': 700, fill: '#D93B3B' }, '（図の幾何計算では届かない位置です。判定は性能表を優先）'));
    }
    // target height marker
    if (st.H != null) {
      svg.append(s('line', { x1: X(st.R) - 14, y1: Y(st.H), x2: X(st.R) + 14, y2: Y(st.H), stroke: '#7B5CD6', 'stroke-width': 2 }));
      svg.append(s('text', { x: X(st.R) + 18, y: Y(st.H) + 4, 'font-size': 11, fill: '#7B5CD6', 'font-weight': 700 }, `必要揚程 ${fmtM(st.H)}m`));
    }
    // reach envelope for the selected boom (thin)
    if (st.work !== 'jib') {
      const env = [];
      for (let t = 0; t <= (m.boom.angleMax || 80); t += 2) env.push(`${X(fx + L * Math.cos(rad(t)))},${Y(fy + L * Math.sin(rad(t)))}`);
      svg.append(s('polyline', { points: env.join(' '), fill: 'none', stroke: '#00B4D8', 'stroke-width': 1, 'stroke-dasharray': '4 4' }));
    }
  }

  // ---------- rendering: top view ----------
  let topMap = null;
  function renderTop(res) {
    const m = st.m, svg = $('topSvg');
    const Wd = 420, Hd = 420, c = 210;
    const { len, wid } = vehicleDims(m);
    const tire = isTire(st.ost);
    const so = tire ? null : stateOf(m, st.ost);
    const E = Math.max(len / 2 + 2.5, (so ? so.width : wid) / 2 + 2, st.R + 2.5, 9);
    const sc = (c - 12) / E;
    const P = (fwd, right) => [c + right * sc, c - fwd * sc];
    topMap = { c, sc };
    svg.setAttribute('viewBox', `0 0 ${Wd} ${Hd}`);
    svg.replaceChildren();
    // zones
    const sector = (a0, a1, fill, op) => {
      const r = E * sc + 40;
      const p0 = [c + r * Math.sin(rad(a0)), c - r * Math.cos(rad(a0))];
      const p1 = [c + r * Math.sin(rad(a1)), c - r * Math.cos(rad(a1))];
      const large = norm360(a1 - a0) > 180 ? 1 : 0;
      return s('path', { d: `M${c},${c} L${p0[0]},${p0[1]} A${r},${r} 0 ${large} 1 ${p1[0]},${p1[1]} Z`, fill, 'fill-opacity': op });
    };
    const zones = [];
    if (tire) {
      const fh = m.onTireFrontHalf ?? 1;
      svg.append(s('rect', { x: 0, y: 0, width: Wd, height: Hd, fill: '#FDEBD0', 'fill-opacity': 0.6 }));
      svg.append(sector(-fh, fh, '#7B5CD6', 0.35));
      zones.push({ a: 0, label: `前方±${fh}°`, kind: 'front' }, { a: 120, label: '360°', kind: 'side' });
    } else {
      svg.append(s('rect', { x: 0, y: 0, width: Wd, height: Hd, fill: (so.zones || []).length ? '#FDEBD0' : '#D9F4FA', 'fill-opacity': 0.6 }));
      for (const z of so.zones || []) {
        const ctr = z.zone === 'front' ? 0 : 180;
        const isFront = z.use.zone === 'front';
        svg.append(sector(ctr - z.half, ctr + z.half, isFront ? '#7B5CD6' : '#00B4D8', isFront ? 0.28 : 0.3));
        zones.push({ a: ctr, half: z.half, kind: isFront ? 'front' : 'max', z });
      }
      if ((so.zones || []).length) zones.push({ a: 90, kind: 'side' }, { a: 270, kind: 'side' });
      else zones.push({ a: 90, kind: 'all' });
    }
    // rings
    const rings = s('g', { fill: 'none', stroke: '#CFC8B8' });
    const rs = E > 30 ? 10 : 5;
    for (let r = rs; r <= E + 0.01; r += rs) rings.append(s('circle', { cx: c, cy: c, r: r * sc }));
    svg.append(rings);
    const rlab = s('g', { 'font-size': 9, fill: '#8A8F96' });
    for (let r = rs; r <= E + 0.01; r += rs) rlab.append(s('text', { x: c + 3, y: c - r * sc - 2 }, `${r}m`));
    svg.append(rlab);
    // carrier
    const car = s('g', {});
    if (!tire) {
      const wF = so.front || so.width, wR = so.rear || so.width; // non-uniform set-ups (front/rear widths differ)
      for (const [fwd, side] of [[len * 0.36, 1], [len * 0.36, -1], [-len * 0.36, 1], [-len * 0.36, -1]]) {
        const [x0, y0] = P(fwd, 0), [x1, y1] = P(fwd, side * (fwd > 0 ? wF : wR) / 2);
        car.append(s('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: '#1E2229', 'stroke-width': Math.max(3, 0.35 * sc) }));
        car.append(s('rect', { x: x1 - 0.45 * sc, y: y1 - 0.45 * sc, width: 0.9 * sc, height: 0.9 * sc, fill: '#1E2229' }));
      }
    }
    const [bx, by] = P(len / 2, -wid / 2);
    car.append(s('rect', { x: bx, y: by, width: wid * sc, height: len * sc, fill: '#F39C12', stroke: '#1E2229', 'stroke-width': 1.5 }));
    const [cx0, cy0] = P(len / 2, -wid / 2);
    car.append(s('rect', { x: cx0 + wid * sc * 0.55, y: cy0 + 2, width: wid * sc * 0.42, height: Math.min(2.2, len * 0.2) * sc, fill: '#FFFFFF', stroke: '#1E2229' }));
    car.append(s('circle', { cx: c, cy: c, r: Math.min(wid, len) * 0.33 * sc, fill: '#00B4D8', stroke: '#1E2229', 'stroke-width': 1.5 }));
    svg.append(car);
    // labels for front/rear
    const lab = s('g', { 'font-size': 12, 'font-weight': 700, fill: '#1E2229', 'text-anchor': 'middle' });
    lab.append(s('text', { x: c, y: 16 }, '前方（運転席側）'));
    lab.append(s('text', { x: c, y: Hd - 6 }, '後方'));
    lab.append(s('text', { x: 14, y: c + 40 }, '左'));
    lab.append(s('text', { x: Wd - 14, y: c + 40 }, '右'));
    svg.append(lab);
    // zone capacity labels at current R
    for (const zz of zones) {
      const rr = evaluate(m, { ...params(), slew: zz.a });
      const txt = rr.ok ? `${fmtT(rr.cap)}t` : '×';
      const name = zz.kind === 'front' ? (tire ? '前方' : ((m.frontSpecial && m.frontSpecial.label) || '前方性能')) : zz.kind === 'max' ? (zz.a === 0 ? '前方' : '後方') : zz.kind === 'all' ? '全周' : '側方';
      const R0 = E * sc * 0.78;
      const ang = zz.kind === 'side' || zz.kind === 'all' ? zz.a : zz.a;
      const tx = c + R0 * Math.sin(rad(ang)), ty = c - R0 * Math.cos(rad(ang));
      const g = s('g', {});
      g.append(s('rect', { x: tx - 38, y: ty - 18, width: 76, height: 32, fill: '#fff', stroke: '#1E2229', 'stroke-width': 1.5, rx: 0 }));
      g.append(s('text', { x: tx, y: ty - 5, 'font-size': 10, 'text-anchor': 'middle', fill: '#4A4F57', 'font-weight': 700 }, name));
      g.append(s('text', { x: tx, y: ty + 10, 'font-size': 14, 'text-anchor': 'middle', fill: '#1E2229', 'font-weight': 700 }, txt));
      svg.append(g);
    }
    // boom line
    const a = rad(st.slew);
    const hx = c + st.R * sc * Math.sin(a), hy = c - st.R * sc * Math.cos(a);
    svg.append(s('circle', { cx: c, cy: c, r: st.R * sc, fill: 'none', stroke: '#D93B3B', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
    svg.append(s('line', { x1: c, y1: c, x2: hx, y2: hy, stroke: '#1E2229', 'stroke-width': Math.max(5, 0.7 * sc), 'stroke-linecap': 'round' }));
    svg.append(s('line', { x1: c, y1: c, x2: hx, y2: hy, stroke: '#F4F0E8', 'stroke-width': Math.max(2, 0.35 * sc), 'stroke-linecap': 'round' }));
    const judge = res && res.ok && res.ratio != null ? judgeOf(res.ratio).cls : res && !res.ok ? 'ng' : 'idle';
    const colors = { ok: '#1E9E5A', caution: '#C99A00', warn: '#E07B00', ng: '#D93B3B', idle: '#00B4D8' };
    svg.append(s('circle', { cx: hx, cy: hy, r: 8, fill: colors[judge], stroke: '#1E2229', 'stroke-width': 2 }));
    // label at the middle of the boom, pushed sideways so it does not cover the zone boxes
    const tl = s('g', { 'font-size': 12, 'font-weight': 700 });
    const mx = c + (st.R * sc / 2) * Math.sin(a), my = c - (st.R * sc / 2) * Math.cos(a);
    const nx = Math.cos(a), ny = Math.sin(a); // perpendicular (to the right of the boom)
    const lx = clamp(mx + nx * 22 - 58, 4, Wd - 122), ly = clamp(my + ny * 22 + 4, 34, Hd - 26);
    tl.append(s('rect', { x: lx, y: ly - 13, width: 118, height: 18, fill: '#1E2229' }));
    tl.append(s('text', { x: lx + 59, y: ly, fill: '#fff', 'text-anchor': 'middle' }, `旋回${Math.round(st.slew)}° R${fmtM(st.R)}m`));
    svg.append(tl);
  }

  /** Model-level cautions shown next to every result (limits of the published data). */
  function modelCautions(m) {
    const out = [];
    if (m.outriggers.states.length === 1) out.push('この機種の公開スペックシートには最大張出の表しかありません。中間・最小張出の性能は未収録です（実機の表で確認）。');
    if ((m.notes || []).some((n) => /最大になる性能を抜粋/.test(n))) out.push('この機種の表は、ブーム長さごとに伸縮状態の中から最大の性能を抜粋した値です。実機の伸縮状態によっては表より小さくなります。');
    for (const c of [].concat(m.caution || [])) if (c) out.push(c);
    return out;
  }

  // ---------- result ----------
  function judgeOf(ratio, sf = st.sf) {
    if (!isFinite(ratio)) return { cls: 'ng', msg: '吊れません', sub: '' };
    if (ratio > 1 + EPS) return { cls: 'ng', msg: '過負荷：吊れません', sub: '定格総荷重を超えています。半径を小さく・ブームを短く・張出を広く・大きい機種へ。' };
    if (sf < 1) {
      if (ratio > sf + EPS) return { cls: 'warn', msg: `安全率${sf}を超えます`, sub: `定格総荷重以内ですが、計画上の上限（定格総荷重×${sf}）を超えています。条件か機種の見直しを。` };
      return { cls: 'ok', msg: `吊れます（安全率${sf}以内）`, sub: '実機の表・AML/ACS表示と照合のうえ作業してください。' };
    }
    if (ratio > 0.9) return { cls: 'warn', msg: '余裕なし（90%超）', sub: '定格いっぱい。風・荷振れ・質量の誤差を考えると計画の見直しを推奨。' };
    if (ratio > 0.8) return { cls: 'caution', msg: '注意（80〜90%）', sub: '社内基準（例：負荷率80%以下）がある場合は要確認。' };
    return { cls: 'ok', msg: '吊れます（80%以下）', sub: '実機の表・AML/ACS表示と照合のうえ作業してください。' };
  }
  function renderResult(res) {
    const m = st.m, box = $('result');
    box.replaceChildren();
    const left = h('div', {}), right = h('div', {});
    const so = isTire(st.ost) ? null : stateOf(m, st.ost);
    const zl = res.zone && res.zone.label;
    left.append(h('div', { class: 'res-cond' },
      h('span', { class: 'pill' }, `${m.model}`),
      h('span', { class: 'pill' }, isTire(st.ost) ? 'アウトリガ不使用' : `${so.label} ${fmtL(so.width)}m`),
      zl ? h('span', { class: `pill ${zl.cls}` }, `適用：${zl.text}`) : null,
      h('span', { class: 'pill' }, st.work === 'jib' ? `ジブ${fmtL(st.jib)}m・${st.off}°` : st.work === 'single' ? 'シングルトップ' : 'ブーム作業'),
      st.mode ? h('span', { class: 'pill' }, `伸縮${st.mode}`) : null,
      st.parts != null && st.work !== 'jib' ? h('span', { class: 'pill' }, `${st.parts}本掛の表`) : null));
    const ang = res.angle;
    const hookTop = res.hookY;
    left.append(h('div', { class: 'big-row' },
      kv('作業半径', fmtM(st.R), 'm', '中心〜フック'),
      kv(st.work === 'jib' ? 'ブーム長さ(基準)' : 'ブーム長さ', res.L != null ? fmtL(res.L) : '—', 'm', st.autoL && st.work !== 'jib' ? '自動選択' : (st.work === 'jib' && res.chart && res.chart.type === 'angle' ? '参考半径の基準' : '')),
      kv('ブーム角度', ang != null ? fmtM(ang, 1) : '—', '°', st.work === 'jib' && res.angleRow != null ? `表は${res.angleRow}°の行` : '幾何計算の目安'),
      kv(st.work === 'jib' ? 'ジブ先端高さ' : 'フック最高高さ', st.work === 'jib' ? (ang != null ? fmtM(jibTipY(m, res)) : '—') : (hookTop != null ? fmtM(hookTop) : '—'), 'm', '目安（たわみ無視）')));
    if (!res.ok) {
      left.append(h('div', { class: 'cap-main na' }, h('div', { class: 'lbl' }, '定格総荷重'), h('div', { class: 'num' }, '吊れません'), h('div', { class: 'exp' }, res.reason || 'この条件は性能表の範囲外です')));
      // suggest the boom length that works best at this radius / direction
      if (st.work !== 'jib') {
        const Ls = isTire(st.ost) ? tireLengths(m) : boomLengths(m, st.mode);
        let best = null;
        for (const L of Ls) { const r = evaluate(m, { ...params(), L }); if (r.ok && (!best || r.cap > best.cap + EPS)) best = { L, cap: r.cap }; }
        if (best) left.append(h('button', { type: 'button', class: 'suggest', onclick: () => { st.L = best.L; update(); } }, `→ ${fmtL(best.L)}mブームなら ${fmtT(best.cap)}t（この半径・向きで一番吊れる長さ）にする`));
        else left.append(h('p', { class: 'hint' }, 'この張出・向きでは、どのブーム長さでもこの半径は表の範囲外です。張出を広くするか、半径を小さくしてください。'));
      }
    } else {
      left.append(h('div', { class: 'cap-main' },
        h('div', { class: 'lbl' }, '定格総荷重（性能表の値・フック込み）'),
        h('div', { class: 'num' }, fmtT(res.cap), h('small', {}, 't')),
        h('div', { class: 'exp' }, [res.parts && res.parts.length ? `標準巻掛 ${[...new Set(res.parts)].join('/')}本` : '', res.sf < 1 ? `安全率${res.sf} → 使用上限 ${fmtT(res.capF)}t` : ''].filter(Boolean).join('　'))));
      const hk = (m.hooks || {})[res.hookKey] || {};
      const steps = h('div', { class: 'steps' },
        step('定格総荷重（表の値）', `${fmtT(res.cap)} t`, ''),
        step(`− フック質量（${hk.label || 'フック'}）`, `− ${fmtT(res.hook)} t`, 'minus', '表の値にはフック・つり具の質量が含まれる'),
        step('= 定格荷重（フックに掛けられる上限）', `${fmtT(res.rated)} t`, '', '玉掛け用具＋吊り荷がこれ以下'),
        step('− 玉掛け用具（ワイヤ・シャックル等）', `− ${fmtT(st.sling || 0)} t`, 'minus'),
        step(res.sf < 1 ? '= 吊れる荷の質量（定格いっぱい）' : '= 吊れる荷の質量（最大）', `${fmtT(res.net)} t`, res.sf < 1 ? 'sub-total' : 'total'));
      if (res.sf < 1) {
        steps.append(step(`安全率${res.sf}をかけると：${fmtT(res.cap)} × ${res.sf} − フック${fmtT(res.hook)} − 玉掛${fmtT(st.sling || 0)}`, `${fmtT(res.netF)} t`, 'total sf', '計画ではこの値以下の荷にする'));
      }
      left.append(steps);
    }
    // right column: model cautions, bar, judgement, messages
    const cautions = modelCautions(m);
    if (cautions.length) right.append(h('ul', { class: 'msgs' }, cautions.map((c) => h('li', { class: 'ng' }, c))));
    if (res.ok) {
      const capV = res.cap;
      const loadV = st.load;
      const total = loadV != null ? loadV + (st.sling || 0) + res.hook : null;
      const scaleMax = Math.max(capV, total || 0);
      const pct = (v) => `${clamp((v / scaleMax) * 100, 0, 100)}%`;
      const bar = h('div', { class: 'bar', title: '内訳（全体＝定格総荷重）' });
      bar.append(h('div', { class: 'b-hook', style: `width:${pct(res.hook)}` }, 'フック'));
      bar.append(h('div', { class: 'b-sling', style: `width:${pct(st.sling || 0)}` }, (st.sling || 0) > 0 ? '玉掛' : ''));
      if (loadV != null) {
        const inCap = Math.min(loadV, Math.max(0, capV - res.hook - (st.sling || 0)));
        bar.append(h('div', { class: 'b-load', style: `width:${pct(inCap)}` }, `荷 ${fmtT(loadV)}t`));
        if (total > capV) bar.append(h('div', { class: 'b-over', style: `width:${pct(total - capV)}` }, '超過'));
      } else {
        bar.append(h('div', { class: 'b-load', style: `width:${pct(Math.max(0, res.net))}` }, `荷は最大 ${fmtT(res.net)}t`));
      }
      if (res.sf < 1) bar.append(h('div', { class: 'sf-mark', style: `left:${pct(res.capF)}`, title: `安全率${res.sf}の上限 ${fmtT(res.capF)}t` }, h('span', {}, `×${res.sf} ${fmtT(res.capF)}t`)));
      right.append(h('div', { class: 'row-label' }, '定格総荷重の内訳'), bar,
        h('div', { class: 'bar-caption' }, h('span', {}, '0'), h('span', {}, `定格総荷重 ${fmtT(capV)}t`)));
      if (loadV != null) {
        const j = judgeOf(res.ratio);
        right.append(h('div', { class: `judge ${j.cls}` },
          h('div', { class: 'pct' }, `${Math.round(res.ratio * 100)}%`),
          h('div', { class: 'msg' }, j.msg),
          h('div', { class: 'sub' }, `負荷率 =（吊り荷${fmtT(loadV)} + 玉掛${fmtT(st.sling || 0)} + フック${fmtT(res.hook)}）÷ 定格総荷重${fmtT(capV)} ＝ ${fmtT(total)}t ÷ ${fmtT(capV)}t。${res.sf < 1 ? `安全率${res.sf}の上限は負荷率${Math.round(res.sf * 100)}%（${fmtT(res.capF)}t）。` : ''}${j.sub}`)));
        const maxR = maxRadiusFor(m, total);
        if (maxR) right.append(h('p', { class: 'hint' }, `この荷（フック・玉掛込み${fmtT(total)}t）なら、今の条件で作業半径 ${fmtM(maxR.R)}m まで（${maxR.label}${res.sf < 1 ? `・安全率${res.sf}込み` : ''}）。`));
      } else {
        right.append(h('div', { class: 'judge idle' }, h('div', { class: 'pct' }, '—'), h('div', { class: 'msg' }, '吊り荷の質量を入れると判定します'), h('div', { class: 'sub' }, '上の「吊り荷質量」に荷の重さ（t）を入力')));
      }
    }
    if (st.H != null && res.ok && st.work !== 'jib' && res.hookY != null && res.hookY < st.H) res.msgs.push({ t: 'warn', s: `必要揚程${fmtM(st.H)}mに対し、このブーム長さのフック最高高さは約${fmtM(res.hookY)}m（目安）。ブームを長くするか作業揚程図で確認` });
    if (st.H != null && res.ok && st.work === 'jib' && res.angle != null && jibTipY(m, res) - 1 < st.H) res.msgs.push({ t: 'warn', s: `必要揚程${fmtM(st.H)}mに届かない可能性があります（ジブ先端高さ約${fmtM(jibTipY(m, res))}m・目安）` });
    if (res.msgs.length) right.append(h('ul', { class: 'msgs' }, res.msgs.map((x) => h('li', { class: x.t }, x.s))));
    right.append(h('p', { class: 'hint' }, 'ブーム角度・高さは作業半径から幾何計算した目安です（ブームのたわみ・機種ごとの取付位置の差は含みません）。性能表は作業半径基準なので、実作業は必ず作業半径で確認してください。'));
    box.append(left, right);
  }
  function kv(k, v, unit, sub) { return h('div', { class: 'kv' }, h('span', { class: 'k' }, k), h('span', { class: 'v' }, v, h('small', {}, unit)), sub ? h('span', { class: 's' }, sub) : null); }
  function step(k, v, cls, tip) { return h('div', { class: `step ${cls || ''}` }, h('span', {}, k, tip ? h('span', { class: 'tip' }, tip) : null), h('span', { class: 'n' }, v)); }
  function jibTipY(m, res) {
    const g = geom(m);
    const L = res.L || st.L, th = res.angle || 0;
    return g.footY + L * Math.sin(rad(th)) + (st.jib || 0) * Math.sin(rad(th - (st.off || 0)));
  }
  /** Largest chart radius at which `total` can be lifted with the current settings (same slew). */
  function maxRadiusFor(m, total) {
    const r0 = evaluate(m, params());
    const chart = r0.chart;
    if (!chart) return null;
    const radii = chart.radii || (chart.radius ? null : null);
    if (!radii) return null;
    let best = null;
    for (const R of radii) {
      const r = evaluate(m, { ...params(), R });
      if (r.ok && r.capF >= total - EPS) best = { R, label: r.zone && r.zone.label ? r.zone.label.text : '' };
    }
    return best;
  }

  // ---------- direction cards ----------
  function renderDirections() {
    const m = st.m, box = $('dirBox');
    box.replaceChildren();
    const so = isTire(st.ost) ? null : stateOf(m, st.ost);
    const dirs = [['前方', 0], ['右側方', 90], ['後方', 180], ['左側方', 270]];
    const grid = h('div', { class: 'dir-grid' });
    for (const [name, a] of dirs) {
      const r = evaluate(m, { ...params(), slew: a });
      const kind = r.zone ? (r.zone.kind === 'front' || r.zone.kind === 'tire-front' ? 'front' : r.zone.kind === 'side' || r.zone.kind === 'tire-all' ? 'side' : 'max') : 'side';
      const cur = Math.abs(norm360(st.slew) - a) < 0.5 || (a === 0 && Math.abs(norm360(st.slew) - 360) < 0.5);
      const b = h('button', { type: 'button', class: `dir ${kind}${cur ? ' cur' : ''}` },
        h('div', { class: 'd-name' }, `${name}（${a}°）`),
        h('div', { class: 'd-val' }, r.ok ? fmtT(r.cap) : '×', r.ok ? h('small', {}, 't') : null),
        h('div', { class: 'd-sub' }, r.zone && r.zone.label ? r.zone.label.text : '', h('br'), r.ok ? `定格荷重 ${fmtT(r.rated)}t / 吊れる荷 ${fmtT(r.sf < 1 ? r.netF : r.net)}t${r.sf < 1 ? `（安全率${r.sf}）` : ''}` : (r.reason || '')));
      b.addEventListener('click', () => { st.slew = a; update(); });
      grid.append(b);
    }
    box.append(grid);
    let note = '';
    if (isTire(st.ost)) note = 'アウトリガ不使用時は「前方（ブームが車両前方のごく狭い範囲）」と「360°」で表が違います。';
    else if (so.zones && so.zones.length) {
      note = `いまの張出（${so.label}${so.width}m）では、` + so.zones.map((z) => `${z.zone === 'front' ? '前方' : '後方'}±${z.half}°の範囲が${z.use.zone === 'front' ? '前方性能表' : stateOf(m, z.use.state).label + 'の性能'}`).join('、') + '。それ以外（側方）は張出幅に応じた低い性能になります。旋回中に側方へ回ると過負荷になることがあるので注意。';
    } else note = 'いまの張出では全周同じ性能です（前方性能表がある機種は前方だけ高くなります）。';
    if (m.frontSpecial) {
      const fs = [].concat(m.frontSpecial);
      note += ' ' + fs.map((x) => `${x.label || '前方特別性能'}${x.condition ? '：' + x.condition : ''}`).join(' ／ ');
    }
    box.append(h('p', { class: 'dir-note' }, note));
    // full extension reference
    if (!isTire(st.ost) && st.ost !== m.outriggers.states[0].id) {
      const ref = evaluate(m, { ...params(), ost: m.outriggers.states[0].id, slew: 90 });
      box.append(h('p', { class: 'dir-note' }, `参考：${m.outriggers.states[0].label}（${m.outriggers.states[0].width}m）にすると側方でも ${ref.ok ? fmtT(ref.cap) + 't' : '×'}。`));
    }
  }

  // ---------- capacity curve ----------
  function renderCurve(res) {
    const m = st.m, svg = $('curveSvg');
    const W = 720, H = 300, pl = 44, pr = 14, pt = 12, pb = 32;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    const legend = $('curveLegend'); legend.replaceChildren();
    const chart = res.chart;
    if (!chart || res.chartKind === 'jib' && chart.type === 'angle') {
      // angle-based jib: plot load vs reference radius
      if (chart && chart.type === 'angle') return curveAngleJib(svg, legend, chart, res, W, H, pl, pr, pt, pb);
      svg.append(s('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', fill: '#6B7078' }, '表示できる性能表がありません'));
      return;
    }
    let series = [];
    if (res.chartKind === 'jib') {
      chart.cols.forEach((c, j) => { if (Math.abs(c.offset - st.off) < EPS) series.push({ name: `ブーム${fmtL(c.L)}m+ジブ${fmtL(st.jib)}m ${c.offset}°`, j, cur: Math.abs(c.L - (res.L ?? -1)) < EPS, radii: chart.radii, loads: chart.loads }); });
    } else {
      chart.cols.forEach((c, j) => { if (modeOk(c, st.mode) || res.chartKind === 'tire') series.push({ name: `${fmtL(c.L)}m${c.mode ? ' ' + c.mode : ''}`, j, cur: Math.abs(c.L - st.L) < EPS, radii: chart.radii, loads: chart.loads }); });
    }
    // reference: max extension chart for the same boom length (if we are on a side chart)
    let ref = null;
    if (res.chartKind === 'boom' && res.zone && res.zone.use.zone === 'side') {
      const mx = findBoomChart(m, { state: m.outriggers.states[0].id, zone: ownZone(m, m.outriggers.states[0].id) }, st.mode, st.L, st.parts);
      if (mx) { const j = mx.cols.findIndex((c) => Math.abs(c.L - st.L) < EPS && modeOk(c, st.mode)); if (j >= 0) ref = { name: `${m.outriggers.states[0].label}（前後方・参考）${fmtL(st.L)}m`, j, radii: mx.radii, loads: mx.loads }; }
    }
    const allV = series.flatMap((x) => x.loads.map((r) => r[x.j])).filter((v) => v != null);
    if (!allV.length || !chart.radii || !chart.radii.length) {
      svg.append(s('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', fill: '#6B7078' }, 'この条件の性能曲線はありません'));
      return;
    }
    const xmax = Math.max(...chart.radii, st.R) * 1.04;
    let ymax = Math.max(...allV, res.total || 0) * 1.08;
    const ystep = niceStep(ymax / 6);
    ymax = Math.ceil(ymax / ystep) * ystep;
    const X = (x) => pl + (x / xmax) * (W - pl - pr), Y = (y) => H - pb - (y / ymax) * (H - pt - pb);
    const gr = s('g', { stroke: '#E4DFD3' }), lb = s('g', { 'font-size': 10, fill: '#6B7078' });
    const xstep = niceStep(xmax / 10);
    for (let x = 0; x <= xmax; x += xstep) { gr.append(s('line', { x1: X(x), y1: Y(0), x2: X(x), y2: Y(ymax) })); lb.append(s('text', { x: X(x), y: H - pb + 13, 'text-anchor': 'middle' }, `${+x.toFixed(1)}`)); }
    for (let y = 0; y <= ymax + EPS; y += ystep) { gr.append(s('line', { x1: X(0), y1: Y(y), x2: X(xmax), y2: Y(y) })); lb.append(s('text', { x: pl - 5, y: Y(y) + 3, 'text-anchor': 'end' }, `${+y.toFixed(2)}`)); }
    lb.append(s('text', { x: W - pr, y: H - 4, 'text-anchor': 'end' }, '作業半径 (m)'));
    lb.append(s('text', { x: 4, y: pt + 4 }, 't'));
    svg.append(gr, lb);
    const stepPath = (ser) => {
      let d = '', prevR = 0, started = false;
      for (let i = 0; i < ser.radii.length; i++) {
        const v = ser.loads[i][ser.j];
        if (v == null) { prevR = ser.radii[i]; started = false; continue; }
        const x0 = started ? X(prevR) : X(i === 0 ? 0 : ser.radii[i - 1] ?? 0), x1 = X(ser.radii[i]);
        d += started ? ` L${x0},${Y(v)} L${x1},${Y(v)}` : `M${X(Math.max(0, i ? ser.radii[i - 1] : 0))},${Y(v)} L${x1},${Y(v)}`;
        started = true; prevR = ser.radii[i];
      }
      return d;
    };
    if (ref) svg.append(s('path', { d: stepPath(ref), fill: 'none', stroke: '#00B4D8', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }));
    for (const ser of series.filter((x) => !x.cur)) svg.append(s('path', { d: stepPath(ser), fill: 'none', stroke: '#B9B3A6', 'stroke-width': 1.2 }));
    for (const ser of series.filter((x) => x.cur)) svg.append(s('path', { d: stepPath(ser), fill: 'none', stroke: '#1E2229', 'stroke-width': 3 }));
    if (st.sf < 1) for (const ser of series.filter((x) => x.cur)) {
      const f = { ...ser, loads: ser.loads.map((row) => row.map((v) => (v == null ? null : v * st.sf))) };
      svg.append(s('path', { d: stepPath(f), fill: 'none', stroke: '#E07B00', 'stroke-width': 2, 'stroke-dasharray': '6 3' }));
    }
    if (res.total != null) {
      svg.append(s('line', { x1: X(0), y1: Y(res.total), x2: X(xmax), y2: Y(res.total), stroke: '#D93B3B', 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }));
      svg.append(s('text', { x: X(xmax) - 4, y: Y(res.total) - 4, 'text-anchor': 'end', 'font-size': 11, fill: '#D93B3B', 'font-weight': 700 }, `必要 ${fmtT(res.total)}t（荷+玉掛+フック）`));
    }
    svg.append(s('line', { x1: X(st.R), y1: Y(0), x2: X(st.R), y2: Y(ymax), stroke: '#D93B3B', 'stroke-width': 1 }));
    if (res.ok) {
      svg.append(s('circle', { cx: X(st.R), cy: Y(res.cap), r: 6, fill: '#00B4D8', stroke: '#1E2229', 'stroke-width': 2 }));
      svg.append(s('text', { x: X(st.R) + 9, y: Y(res.cap) - 8, 'font-size': 13, 'font-weight': 700 }, `${fmtT(res.cap)}t @ ${fmtM(st.R)}m`));
    }
    legend.append(h('span', {}, h('i', { style: 'background:#1E2229;height:4px' }), '選択中'), h('span', {}, h('i', { style: 'background:#B9B3A6' }), 'ほかの長さ'));
    if (st.sf < 1) legend.append(h('span', {}, h('i', { style: 'background:#E07B00' }), `選択中×安全率${st.sf}`));
    if (ref) legend.append(h('span', {}, h('i', { style: 'background:#00B4D8' }), ref.name));
    if (res.total != null) legend.append(h('span', {}, h('i', { style: 'background:#D93B3B' }), '必要な定格総荷重'));
    $('curveNote').textContent = (res.zone && res.zone.label ? res.zone.label.text : '') + ' ／ 階段状＝表の行間は次の（大きい）半径の値で判定';
  }
  function curveAngleJib(svg, legend, chart, res, W, H, pl, pr, pt, pb) {
    const ci = chart.cols.findIndex((c) => Math.abs(c.offset - st.off) < EPS);
    const pts = chart.angles.map((a, i) => ({ a, r: chart.radius[i][ci], v: chart.loads[i][ci] })).filter((p) => p.r != null && p.v != null);
    const others = chart.cols.map((c, j) => j).filter((j) => j !== ci);
    const allV = chart.loads.flat().filter((v) => v != null);
    const allR = chart.radius.flat().filter((v) => v != null);
    const xmax = Math.max(...allR, st.R) * 1.05; let ymax = Math.max(...allV) * 1.1; const ys = niceStep(ymax / 6); ymax = Math.ceil(ymax / ys) * ys;
    const X = (x) => pl + (x / xmax) * (W - pl - pr), Y = (y) => H - pb - (y / ymax) * (H - pt - pb);
    const gr = s('g', { stroke: '#E4DFD3' }), lb = s('g', { 'font-size': 10, fill: '#6B7078' });
    const xs = niceStep(xmax / 10);
    for (let x = 0; x <= xmax; x += xs) { gr.append(s('line', { x1: X(x), y1: Y(0), x2: X(x), y2: Y(ymax) })); lb.append(s('text', { x: X(x), y: H - pb + 13, 'text-anchor': 'middle' }, `${+x.toFixed(1)}`)); }
    for (let y = 0; y <= ymax + EPS; y += ys) { gr.append(s('line', { x1: X(0), y1: Y(y), x2: X(xmax), y2: Y(y) })); lb.append(s('text', { x: pl - 5, y: Y(y) + 3, 'text-anchor': 'end' }, `${+y.toFixed(2)}`)); }
    svg.append(gr, lb);
    for (const j of others) {
      const p2 = chart.angles.map((a, i) => ({ r: chart.radius[i][j], v: chart.loads[i][j] })).filter((p) => p.r != null && p.v != null);
      svg.append(s('polyline', { points: p2.map((p) => `${X(p.r)},${Y(p.v)}`).join(' '), fill: 'none', stroke: '#B9B3A6' }));
    }
    svg.append(s('polyline', { points: pts.map((p) => `${X(p.r)},${Y(p.v)}`).join(' '), fill: 'none', stroke: '#7B5CD6', 'stroke-width': 3 }));
    for (const p of pts) { svg.append(s('circle', { cx: X(p.r), cy: Y(p.v), r: 3, fill: '#7B5CD6' })); svg.append(s('text', { x: X(p.r), y: Y(p.v) - 6, 'font-size': 9, 'text-anchor': 'middle', fill: '#4A4F57' }, `${p.a}°`)); }
    if (res.ok) svg.append(s('circle', { cx: X(st.R), cy: Y(res.cap), r: 6, fill: '#00B4D8', stroke: '#1E2229', 'stroke-width': 2 }));
    legend.append(h('span', {}, h('i', { style: 'background:#7B5CD6;height:4px' }), `ジブ${fmtL(st.jib)}m ${st.off}°（点の数字＝ブーム角度）`));
    $('curveNote').textContent = 'ジブはブーム角度基準。横軸は参考作業半径';
  }
  function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / p; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p; }

  // ---------- chart table ----------
  let tableSel = null; // {kind, i}
  function renderTable(res) {
    const m = st.m, box = $('tableBox');
    box.replaceChildren();
    const opts = [];
    m.boomCharts.forEach((c, i) => {
      const so = stateOf(m, c.state);
      const ms = [...new Set(c.cols.map((k) => k.mode).filter(Boolean))];
      const mlabel = ms.length === 1 && (m.boom.modes || []).length ? ` 伸縮${((m.boom.modes || []).find((x) => x.id === ms[0]) || {}).label || ms[0]}` : '';
      opts.push({ kind: 'boom', i, label: `ブーム ${so.label}${fmtL(so.width)}m ${({ all: '全周', side: '側方', front: '前方', rear: '後方' })[c.zone]}${mlabel}${c.parts != null ? ' ' + c.parts + '本掛' : ''}${c.counterweight ? ' ' + c.counterweight : ''}` });
    });
    (m.jibCharts || []).forEach((c, i) => { const so = stateOf(m, c.state); opts.push({ kind: 'jib', i, label: `ジブ${fmtL(c.jib)}m ${so.label}${fmtL(so.width)}m${c.zone === 'front' ? ' 前方' : ''}${c.boomL ? ' (ブーム' + fmtL(c.boomL) + 'm)' : ''}` }); });
    (m.onTire || []).forEach((c, i) => opts.push({ kind: 'tire', i, label: `不使用 ${c.mode === 'static' ? '静止' : '走行'} ${c.zone === 'front' ? '前方' : '360°'}${c.parts != null ? ' ' + [].concat(c.parts).join('/') + '本掛' : ''}` }));
    const curKind = res.chartKind, curChart = res.chart;
    const curIdx = curChart ? (curKind === 'boom' ? m.boomCharts.indexOf(curChart) : curKind === 'jib' ? m.jibCharts.indexOf(curChart) : (m.onTire || []).indexOf(curChart)) : -1;
    const sel = tableSel && opts.some((o) => o.kind === tableSel.kind && o.i === tableSel.i) ? tableSel : { kind: curKind || 'boom', i: Math.max(0, curIdx) };
    const selectEl = h('select', { 'aria-label': '表示する性能表', style: 'font:700 13px var(--mono);padding:6px;border:2px solid #1E2229;max-width:100%;' });
    opts.forEach((o, k) => selectEl.append(h('option', { value: k, selected: o.kind === sel.kind && o.i === sel.i ? true : null }, (o.kind === curKind && o.i === curIdx ? '▶ ' : '') + o.label)));
    selectEl.addEventListener('change', () => { tableSel = opts[+selectEl.value]; renderTable(res); });
    const follow = h('button', { type: 'button', class: 'quick', style: 'margin-left:8px;font:700 12px var(--mono);border:2px solid #1E2229;background:#fff;padding:5px 10px;cursor:pointer', onclick: () => { tableSel = null; renderTable(res); } }, '適用中の表に戻る');
    $('tableNote').replaceChildren(selectEl, follow);
    const chart = sel.kind === 'boom' ? m.boomCharts[sel.i] : sel.kind === 'jib' ? m.jibCharts[sel.i] : m.onTire[sel.i];
    const isCur = sel.kind === curKind && sel.i === curIdx;
    const lk = isCur && res.lk && res.lk.rows && res.lk.cols ? res.lk : null;
    const t = h('table', { class: 'chart' });
    if (sel.kind === 'jib' && chart.type === 'angle') {
      const thead = h('tr', {}, h('th', {}, 'ブーム角度'), chart.cols.map((c, j) => h('th', { colspan: 2, class: isCur && Math.abs(c.offset - st.off) < EPS ? 'colcur' : null }, `オフセット${c.offset}°`)));
      const sub = h('tr', {}, h('th', {}, ''), chart.cols.map(() => [h('th', {}, '半径m'), h('th', {}, '荷重t')]));
      t.append(h('thead', {}, thead, sub));
      const tb = h('tbody', {});
      chart.angles.forEach((a, i) => {
        const tr = h('tr', { class: lk && lk.rows.includes(i) ? 'rowcur' : null }, h('th', {}, `${a}°`));
        chart.cols.forEach((c, j) => {
          const hit = lk && lk.rows.includes(i) && lk.cols.includes(j);
          tr.append(h('td', { class: chart.radius[i][j] == null ? 'blank' : hit ? 'hit' : null }, chart.radius[i][j] == null ? '' : fmtM(chart.radius[i][j])));
          tr.append(h('td', { class: chart.loads[i][j] == null ? 'blank' : hit ? 'hit' : null }, chart.loads[i][j] == null ? '' : fmtT(chart.loads[i][j])));
        });
        tb.append(tr);
      });
      t.append(tb);
      t.append(h('tfoot', {}, h('tr', {}, h('th', {}, '角度範囲'), chart.cols.map((c) => h('td', { colspan: 2 }, c.angle ? `${c.angle[0]}〜${c.angle[1]}°` : '')))));
    } else {
      const head = h('tr', {}, h('th', {}, sel.kind === 'jib' ? '半径＼ブーム/ｵﾌｾｯﾄ' : '半径＼ブーム'));
      chart.cols.forEach((c, j) => head.append(h('th', { class: lk && lk.cols.includes(j) ? 'colcur' : null }, sel.kind === 'jib' ? `${fmtL(c.L)}m/${c.offset}°` : `${fmtL(c.L)}m${c.mode ? ' ' + c.mode : ''}`)));
      t.append(h('thead', {}, head));
      const tb = h('tbody', {});
      chart.radii.forEach((R, i) => {
        const tr = h('tr', { class: lk && lk.rows && lk.rows.includes(i) ? 'rowcur' : null }, h('th', {}, `${fmtM(R)}m`));
        chart.cols.forEach((c, j) => {
          const v = chart.loads[i][j];
          const hit = lk && lk.rows && lk.rows.includes(i) && lk.cols.includes(j);
          const spc = v == null ? null : cellSpecial(chart, i, j);
          tr.append(h('td', { class: v == null ? 'blank' : hit ? 'hit' : lk && lk.cols.includes(j) ? 'colcur' : null, title: spc ? `${spc.symbol} ${spc.note || ''}${spc.parts ? ' ' + spc.parts + '本掛' : ''}` : null }, v == null ? '' : fmtT(v) + (spc ? spc.symbol : '')));
        });
        tb.append(tr);
      });
      t.append(tb);
      const foot = h('tfoot', {});
      if (chart.cols.some((c) => c.angle)) foot.append(h('tr', {}, h('th', {}, '角度範囲'), chart.cols.map((c) => h('td', {}, c.angle ? `${c.angle[0]}〜${c.angle[1]}°` : ''))));
      if (chart.cols.some((c) => c.parts)) foot.append(h('tr', {}, h('th', {}, '巻掛本数'), chart.cols.map((c) => h('td', {}, c.parts ?? ''))));
      if (chart.cols.some((c) => c.telescope)) foot.append(h('tr', {}, h('th', {}, '伸縮割合'), chart.cols.map((c) => h('td', {}, c.telescope || ''))));
      if (chart.cols.some((c) => isFinite(c.rMax))) foot.append(h('tr', {}, h('th', {}, '最大半径'), chart.cols.map((c) => h('td', {}, isFinite(c.rMax) ? `${fmtM(c.rMax)}m` : ''))));
      t.append(foot);
    }
    const cn = chart.cols.filter((c) => c.note).map((c) => `${c.L != null ? fmtL(c.L) + 'm' : 'オフセット' + c.offset + '°'}${c.mode ? ' ' + c.mode : ''}：${c.note}`);
    if (chart.note) cn.unshift(chart.note);
    $('tableNotes').replaceChildren(...(cn.length ? [h('ul', { class: 'notes', style: 'margin:8px 0 0' }, cn.map((x) => h('li', {}, x)))] : []));
    box.append(t);
    box.append(h('p', { class: 'hint', style: 'padding:6px 8px;margin:0' }, `単位：t（定格総荷重・フック込み）。出典：${chart.src || ''}　黒セル＝今回採用した値、黄色行・水色列＝参照した行と列。`));
  }

  // ---------- road permit ----------
  const LIMITS = { width: 2500, length: 12000, height: 3800, gvw: 20000, axle: 10000, adj18: 18000, adj20: 20000, wheel: 5000, turn: 12 };
  function permitCheck(v) {
    const items = [];
    if (!v) return { need: false, items };
    const add = (key, label, val, lim, unit, over, note) => items.push({ key, label, val, lim, unit, over, note });
    if (v.width) add('width', '全幅', v.width, LIMITS.width, 'mm', v.width > LIMITS.width);
    if (v.length) add('length', '全長', v.length, LIMITS.length, 'mm', v.length > LIMITS.length);
    if (v.height) add('height', '全高', v.height, LIMITS.height, 'mm', v.height > LIMITS.height, v.height > LIMITS.height && v.height <= 4100 ? '高さ指定道路は4.1mまで' : '');
    if (v.gvw) add('gvw', '車両総重量', v.gvw, LIMITS.gvw, 'kg', v.gvw > LIMITS.gvw, '');
    const axles = (v.axles || []).filter((x) => isFinite(x));
    if (axles.length) {
      const mx = Math.max(...axles);
      add('axle', '軸重（最大）', mx, LIMITS.axle, 'kg', mx > LIMITS.axle);
      add('wheel', '輪荷重（軸重÷2）', mx / 2, LIMITS.wheel, 'kg', mx / 2 > LIMITS.wheel, '1軸2輪として計算');
      if (axles.length >= 2) {
        const sp = Array.isArray(v.axleSpacing) ? v.axleSpacing : axles.length === 2 && v.wheelbase ? [v.wheelbase] : null;
        let worst = null;
        for (let i = 0; i + 1 < axles.length; i++) {
          const sum = axles[i] + axles[i + 1];
          const d = sp ? sp[i] : null;
          const lim = d == null ? LIMITS.adj18 : d >= 1800 ? LIMITS.adj20 : d >= 1300 && axles[i] <= 9500 && axles[i + 1] <= 9500 ? 19000 : LIMITS.adj18;
          if (!worst || sum - lim > worst.sum - worst.lim) worst = { sum, lim, d };
        }
        if (worst) add('adj', '隣接軸重', worst.sum, worst.lim, 'kg', worst.sum > worst.lim, worst.d ? `軸距${(worst.d / 1000).toFixed(2)}m` : '軸距不明のため18tで判定');
      }
    }
    if (v.turningRadius) add('turn', '最小回転半径', v.turningRadius, LIMITS.turn, 'm', v.turningRadius > LIMITS.turn);
    return { need: items.some((x) => x.over), items };
  }
  function renderRoad() {
    const m = st.m, v = m.vehicle || {}, box = $('roadBox');
    box.replaceChildren();
    const pc = permitCheck(v);
    const cannot = /公道走行(でき|は?不可|できません)/.test(v.note || '');
    const overs = pc.items.filter((x) => x.over).map((x) => x.label);
    box.append(h('div', { class: 'road-top' },
      h('div', { class: `permit ${cannot ? 'cannot' : pc.need ? 'need' : 'free'}` }, cannot ? 'この状態では公道走行不可' : pc.need ? '特殊車両通行許可が必要' : '一般的制限値内（特車許可は不要）'),
      h('div', { class: 'muted', style: 'font-size:13px' }, pc.need ? `超過：${overs.join('・')}` : '走行時の寸法・重量が車両制限令の一般的制限値以内')));
    const tb = h('tbody', {});
    for (const x of pc.items) {
      const fmtv = (n) => x.unit === 'm' ? `${fmtM(n)} m` : x.unit === 'mm' ? `${fmtKg(n)} mm` : `${fmtKg(n)} kg`;
      tb.append(h('tr', {}, h('th', {}, x.label), h('td', { class: 'num' }, fmtv(x.val)), h('td', { class: 'num' }, fmtv(x.lim)), h('td', { class: x.over ? 'over' : 'okv' }, x.over ? '超過' : '以内', x.note ? h('span', { class: 'muted', style: 'display:block;font-size:11px;font-weight:400' }, x.note) : null)));
    }
    box.append(h('div', { class: 'scroll-x' }, h('table', { class: 'road' }, h('thead', {}, h('tr', {}, h('th', {}, '項目'), h('th', {}, 'この機種（走行時）'), h('th', {}, '一般的制限値'), h('th', {}, '判定'))), tb)));
    if (v.note) box.append(h('p', { class: 'hint' }, `メーカー資料の注記：${v.note}`));
    for (const c of v.configs || []) {
      const p2 = permitCheck(c);
      box.append(h('p', { class: 'hint' }, h('b', {}, `${c.label || '別の走行状態'}：`), `全長${fmtKg(c.length)}mm・全幅${fmtKg(c.width)}mm・全高${fmtKg(c.height)}mm・総重量${fmtKg(c.gvw)}kg → `, h('b', { style: `color:${p2.need ? '#D93B3B' : '#1E9E5A'}` }, p2.need ? '特車許可が必要' : '一般的制限値内')));
    }
    box.append(h('ul', { class: 'road-notes' },
      h('li', {}, '一般的制限値（車両制限令第3条）：幅2.5m・長さ12m・高さ3.8m（高さ指定道路4.1m）・総重量20t（高速道路/重さ指定道路は最遠軸距・長さにより最大25t）・軸重10t・隣接軸重18〜20t・輪荷重5t・最小回転半径12m。1つでも超えると道路法第47条の2の特殊車両通行許可（道路管理者へ申請）が必要です。'),
      h('li', {}, 'ラフターは最遠軸距が短い（5.5m未満）ため、重さ指定道路でも総重量の上限は20tで判定しています。'),
      h('li', {}, '許可には経路・時間帯・徐行・誘導車配置などの通行条件が付くことがあります。車両の登録（車検）上、保安基準を超える寸法・重量の車両は基準緩和の認定も必要です（通常は車両側で取得済み）。'),
      h('li', {}, '数値はメーカー資料の走行時寸法・重量（標準仕様）。オプション装備・フック・燃料などで変わるため、申請は車検証の値で行ってください。')));
    const capT = m.maxLoad ? m.maxLoad.t : m.classTon;
    box.append(h('div', { class: 'lic' },
      h('div', {}, h('b', {}, '公道を運転'), '大型特殊自動車免許'),
      h('div', {}, h('b', {}, 'クレーンの運転'), capT >= 5 ? `移動式クレーン運転士免許（つり上げ荷重${fmtT(capT)}t：5t以上）` : capT >= 1 ? `小型移動式クレーン運転技能講習（つり上げ荷重${fmtT(capT)}t：1t以上5t未満）` : '特別教育'),
      h('div', {}, h('b', {}, '玉掛け'), '玉掛け技能講習（つり上げ荷重1t以上のクレーン）')));
  }

  // ---------- learn ----------
  function renderLearn(res) {
    const box = $('learnBox');
    box.replaceChildren();
    const ok = res && res.ok;
    const cap = ok ? fmtT(res.cap) : 'A', hook = ok ? fmtT(res.hook) : 'B', rated = ok ? fmtT(res.rated) : 'A−B', net = ok ? fmtT(res.net) : 'A−B−C';
    const left = h('div', {},
      h('div', { class: 'def total' }, h('h4', {}, '定格総荷重 ＝ 性能表・カタログの数字'), h('p', {}, 'フック（フックブロック）やつり具の質量を「含んだ」最大の荷重。作業半径・ブーム長さ・アウトリガ・向きで変わる。')),
      h('div', { class: 'def rated' }, h('h4', {}, '定格荷重 ＝ 定格総荷重 − フック等の質量'), h('p', {}, 'フックに掛けられる荷の上限（クレーン等安全規則の定義）。玉掛けワイヤ・シャックル・吊り天秤などの質量は、荷の側に含めて考える。')),
      h('div', { class: 'def net' }, h('h4', {}, '実際に吊れる荷 ＝ 定格荷重 − 玉掛け用具'), h('p', {}, '吊り荷の質量 ＋ 玉掛け用具の質量 ≦ 定格荷重 になっているかを確認する。')));
    const right = h('div', {},
      h('div', { class: 'formula', html: `いまの条件だと…<br>定格総荷重 <b>${cap}t</b><br>− フック <b>${hook}t</b> ＝ 定格荷重 <b>${rated}t</b><br>− 玉掛け用具 <b>${fmtT(st.sling || 0)}t</b> ＝ 吊れる荷 <b>${net}t</b>${ok && res.sf < 1 ? `<br>安全率${res.sf}なら：${cap}×${res.sf} − ${hook} − ${fmtT(st.sling || 0)} ＝ <b>${fmtT(res.netF)}t</b>` : ''}` }),
      h('div', { class: 'ng-box' }, h('b', {}, 'よくある間違い'), h('br'), '・表の数字（定格総荷重）をそのまま「吊れる荷の重さ」と思ってしまう → フックの分だけ過負荷。', h('br'), '・ジブ作業なのにブームの表を見る／主巻フックの質量で計算する。', h('br'), '・中間張出なのに最大張出（全周）の数字を使う。側方に旋回した瞬間に過負荷。', h('br'), '・表の行と行の間の半径で、近い方（大きい値）の数字を使う → 大きい半径側の値で判定する。'));
    box.append(h('div', { class: 'learn-grid' }, left, right));
  }

  // ---------- sources ----------
  function renderSources() {
    const m = st.m, box = $('srcBox');
    box.replaceChildren();
    box.append(h('p', { style: 'margin:0 0 6px;font-weight:700' }, `${MAKERS[m.maker]} ${m.model}${m.generation ? '（' + m.generation + '）' : ''}`));
    if (m.variant) box.append(h('p', { class: 'hint', style: 'margin-top:0' }, `収録仕様：${m.variant}`));
    box.append(h('ul', { class: 'src-list' }, (m.sources || []).map((x) => h('li', {}, h('a', { href: x.url, target: '_blank', rel: 'noopener' }, x.title || x.url), x.pages ? ` (${x.pages})` : '', x.via ? h('span', { class: 'muted' }, ' ／ 掲載ページ: ', h('a', { href: x.via, target: '_blank', rel: 'noopener' }, x.via)) : null))));
    const hooks = Object.values(m.hooks || {}).map((x) => `${x.label} ${fmtT(x.mass)}t`).join('、');
    const notes = [...(m.notes || [])];
    if (hooks) notes.unshift(`フック質量：${hooks}`);
    if (m.outriggers.note) notes.push(m.outriggers.note);
    if (m.onTireNote) notes.push(m.onTireNote);
    box.append(h('ul', { class: 'notes' }, notes.map((x) => h('li', {}, x))));
    const vf = m.verification || {};
    box.append(h('p', { class: 'verif' }, `数値チェック：${vf.status === 'checked' ? '出典PDFの画像と全表を照合済み' : vf.status || '未確認'}${vf.method ? '（' + vf.method + '）' : ''}`));
    if (vf.issues && vf.issues.length) box.append(h('ul', { class: 'notes' }, vf.issues.map((x) => h('li', {}, `確認メモ：${x}`))));
    const g = geom(m);
    box.append(h('p', { class: 'verif' }, `図の寸法：ブームフートピン位置 旋回中心から${fmtM(g.footX, 1)}m・高さ${fmtM(g.footY, 1)}m（${g.estimated ? '概算' : '資料値'}）。車体形状は模式図です。`));
  }


  // ---------- compare all models ----------
  let cmpState = { loaded: false, loading: false };
  function bestFor(m, base) {
    const ost = m.outriggers.states[0].id;
    const modes = (m.boom.modes || []).map((x) => x.id);
    const po = partsOptions(m);
    let best = null;
    for (const parts of po.length ? po : [null])
    for (const mode of modes.length ? modes : [null]) {
      for (const L of boomLengths(m, mode, parts)) {
        const r = evaluate(m, { ...base, ost, work: 'boom', mode, parts, L, jibMounted: false });
        if (!r.ok) continue;
        if (st.H != null && !(r.hookY >= st.H)) continue;
        if (!best || r.cap > best.cap + EPS || (Math.abs(r.cap - best.cap) < EPS && L < best.L)) best = { ...r, L, mode, parts };
      }
    }
    return best;
  }
  function renderCompare() {
    const box = $('cmpBox');
    box.replaceChildren();
    const head = h('p', { class: 'hint', style: 'margin-top:0' },
      `条件：作業半径 ${fmtM(st.R)}m・旋回${Math.round(st.slew)}°${st.H != null ? `・必要揚程 ${fmtM(st.H)}m` : ''}${st.load != null ? `・吊り荷 ${fmtT(st.load)}t＋玉掛 ${fmtT(st.sling || 0)}t` : ''}／各機種アウトリガ最大張出・ブーム作業・一番吊れるブーム長さで比較`);
    box.append(head);
    if (!cmpState.loaded) {
      const b = h('button', { type: 'button', class: 'big-btn' }, cmpState.loading ? '読み込み中…' : `全${INDEX.length}機種の性能表を読み込んで比較する`);
      b.addEventListener('click', async () => {
        if (cmpState.loading) return;
        cmpState.loading = true; renderCompare();
        try { await Promise.all(INDEX.map((x) => loadModel(x.id))); cmpState.loaded = true; } catch (e) { /* keep button */ }
        cmpState.loading = false; renderCompare();
      });
      box.append(b);
      return;
    }
    const base = { R: st.R, slew: st.slew, load: st.load, sling: st.sling, jib: null, off: null, jibL: null, sf: st.sf };
    const rows = INDEX.map((x) => ({ x, m: cache.get(x.id) })).filter((r) => r.m).map((r) => ({ ...r, b: bestFor(r.m, base) }));
    const tb = h('tbody', {});
    for (const r of rows) {
      const b = r.b;
      const total = st.load != null ? st.load + (st.sling || 0) : null;
      let judge = '';
      if (!b) judge = '× 届かない/表外';
      else if (total != null) { const ratio = (total + b.hook) / b.cap; judge = `${Math.round(ratio * 100)}%`; }
      const jr = b && total != null ? judgeOf((total + b.hook) / b.cap) : null;
      const cls = !b ? 'cmp-ng' : !jr ? '' : `cmp-${jr.cls}`;
      const tr = h('tr', { class: `${cls}${r.x.id === st.id ? ' cmp-cur' : ''}`, tabindex: 0, title: 'クリックでこの機種を表示' },
        h('td', {}, MAKERS[r.x.maker]), h('td', { class: 'cmp-model' }, r.x.model, r.x.status === 'legacy' ? h('span', { class: 'badge legacy', style: 'margin-left:4px' }, '旧型') : null),
        h('td', { class: 'num' }, `${r.x.classTon}t`),
        h('td', { class: 'num' }, b ? `${fmtL(b.L)}m${b.mode ? ' ' + b.mode : ''}${b.parts ? ' ' + b.parts + '本掛' : ''}` : '—'),
        h('td', { class: 'num' }, b ? fmtM(b.angle, 0) + '°' : '—'),
        h('td', { class: 'num strong' }, b ? fmtT(b.cap) : '—'),
        h('td', { class: 'num' }, b ? fmtT(st.sf < 1 ? b.netF : b.net) : '—'),
        h('td', { class: 'num' }, judge),
        h('td', {}, permitCheck(r.x.vehicle).need ? '要' : '不要'));
      const go = () => { selectModel(r.x.id); document.getElementById('cond').scrollIntoView({ behavior: 'smooth' }); };
      tr.addEventListener('click', go);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      tb.append(tr);
    }
    box.append(h('div', { class: 'table-wrap' }, h('table', { class: 'chart cmp' },
      h('thead', {}, h('tr', {}, ['メーカー', '機種', 'クラス', 'ブーム', '角度', '定格総荷重t', st.sf < 1 ? `吊れる荷t(×${st.sf})` : '吊れる荷t', st.load != null ? '負荷率' : '判定', '特車許可'].map((t) => h('th', {}, t)))), tb)));
    box.append(h('p', { class: 'hint' }, (st.sf < 1 ? `安全率${st.sf}：吊れる荷＝定格総荷重×${st.sf}−フック−玉掛け用具。` : '吊れる荷＝定格総荷重−フック−玉掛け用具。') + '前方性能（前方特別性能）のある機種は前方0°付近で高くなります。行をクリックするとその機種の詳細を表示。一度読み込んだ機種は、電波の悪い現場でも（対応ブラウザなら）表示できます。'));
  }

  // ---------- main update ----------
  function update() {
    const m = st.m;
    if (!m) return;
    autoPick(m);
    const res = evaluate(m, params());
    renderConditions();
    renderSide(res);
    renderTop(res);
    renderResult(res);
    renderDirections();
    renderCurve(res);
    renderTable(res);
    renderLearn(res);
    renderCompare();
    writeHash();
  }

  async function selectModel(id, keep) {
    st.id = id;
    renderPickers();
    $('result').replaceChildren(h('div', { class: 'loading' }, '性能表を読み込み中…'));
    try {
      st.m = await loadModel(id);
    } catch (e) {
      $('result').replaceChildren(h('div', { class: 'loading' }, '読み込みに失敗しました。ページを再読み込みしてください。'));
      return;
    }
    tableSel = null;
    pickDefaults(st.m);
    renderRoad();
    renderSources();
    update();
  }

  function setSf(v) {
    st.sf = v > 0 && v <= 1 ? Math.round(v * 1000) / 1000 : 1;
    try { localStorage.setItem(SF_KEY, String(st.sf)); } catch (e) { /* storage unavailable */ }
    update();
  }

  // ---------- events ----------
  function bindInputs() {
    $('inSf').addEventListener('input', (e) => { const v = num(e.target.value); if (v != null && v > 0 && v <= 1) setSf(v); else if (e.target.value === '') setSf(1); });
    const onNum = (id, fn) => $(id).addEventListener('input', (e) => { fn(num(e.target.value)); if (st.m) update(); });
    onNum('inR', (v) => { if (v != null && v >= 0) st.R = Math.min(v, 120); });
    onNum('inSlew', (v) => { if (v != null) st.slew = norm360(v); });
    onNum('inH', (v) => { st.H = v != null && v > 0 ? v : null; });
    onNum('inLoad', (v) => { st.load = v != null && v >= 0 ? v : null; });
    onNum('inSling', (v) => { st.sling = v != null && v >= 0 ? v : 0; });
    $('autoL').addEventListener('change', (e) => { st.autoL = e.target.checked; update(); });
    $('jibMounted').addEventListener('change', (e) => { st.jibMounted = e.target.checked; update(); });
    const drag = (svg, fn) => {
      let active = false;
      const pt = (e) => { const r = svg.getBoundingClientRect(); const vb = svg.viewBox.baseVal; return { x: ((e.clientX - r.left) / r.width) * vb.width, y: ((e.clientY - r.top) / r.height) * vb.height }; };
      svg.addEventListener('pointerdown', (e) => { active = true; svg.setPointerCapture(e.pointerId); fn(pt(e), 'down'); });
      svg.addEventListener('pointermove', (e) => { if (active) fn(pt(e), 'move'); });
      const end = () => { active = false; };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    };
    let raf = 0;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    drag($('sideSvg'), (p) => {
      if (!sideMap || !st.m) return;
      const w = sideMap.inv(p.x, p.y);
      st.R = Math.max(0.5, Math.round(w.x * 10) / 10);
      st.H = w.y > 1.0 ? Math.round(w.y * 2) / 2 : null;
      schedule();
    });
    drag($('topSvg'), (p) => {
      if (!topMap || !st.m) return;
      const dx = p.x - topMap.c, dy = p.y - topMap.c;
      const r = Math.hypot(dx, dy) / topMap.sc;
      st.slew = norm360(Math.round(deg(Math.atan2(dx, -dy))));
      if (r > 1) st.R = Math.round(r * 10) / 10;
      schedule();
    });
  }

  // ---------- boot ----------
  // offline cache (network first). Only on https so local file:// use is unaffected.
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  readHash();
  bindInputs();
  // a pasted/shared link (hash) changes the whole state; our own updates use replaceState and do not fire this
  window.addEventListener('hashchange', () => {
    readHash();
    if (st.id && INDEX.some((x) => x.id === st.id)) selectModel(st.id);
  });
  if (!INDEX.length) { $('result').textContent = 'データがありません'; return; }
  if (!st.id || !INDEX.some((x) => x.id === st.id)) st.id = (INDEX.find((x) => x.id === 'tadano-gr-250n-5') || INDEX[0]).id;
  // on phones start with the selected model's class so the list stays short ("全部" shows every model)
  if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) {
    const cur = INDEX.find((x) => x.id === st.id);
    if (cur) st.cls = cur.classTon;
  }
  selectModel(st.id);
})();
