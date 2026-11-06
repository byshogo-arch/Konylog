#!/usr/bin/env node
/**
 * 建材相場ボード（souba.html）の「過去の動向」データを更新するスクリプト
 *
 *   使い方:  node tools/update-souba-trends.mjs
 *   必要なもの: Node.js 18 以上（追加パッケージ不要）
 *
 * data/souba-items.js に書いてある指標コード（trend.code / trend.link）を拾い、
 * 日本銀行「時系列統計データ検索サイト」の API から月次データを取ってきて
 * data/souba-trends.js を作り直します。
 *
 *   - PRCG… : 企業物価指数（2020年=100）
 *   - PRCS… : 企業向けサービス価格指数（2020年=100）
 *
 * trend.link に旧基準（2015年基準など）のコードを書いておくと、
 * 新基準の系列が始まる前の期間を旧基準の値でつないで（2020年平均で比率調整して）延長します。
 *
 * 日銀の指数は毎月中旬（企業物価は第8営業日ごろ、サービス価格は第18営業日ごろ）に更新されます。
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ITEMS_FILE = path.join(ROOT, 'data', 'souba-items.js');
const OUT_FILE = path.join(ROOT, 'data', 'souba-trends.js');
const API = 'https://www.stat-search.boj.or.jp/api/v1/getDataCode';
const START = '200501'; // ここから最新月までを保存
const CHUNK = 40;       // 1リクエストあたりの系列数

function dbOf(code) {
  if (code.startsWith('PRCG')) return 'PR01'; // 企業物価指数
  if (code.startsWith('PRCS')) return 'PR02'; // 企業向けサービス価格指数
  throw new Error(`データベースを判定できないコードです: ${code}`);
}

async function loadItems() {
  const src = await readFile(ITEMS_FILE, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(src, sandbox, { filename: ITEMS_FILE });
  const data = sandbox.window.KONYLOG_SOUBA;
  if (!data || !Array.isArray(data.items)) throw new Error('data/souba-items.js から KONYLOG_SOUBA.items を読めませんでした');
  return data.items;
}

async function fetchSeries(db, codes, startDate) {
  const url = `${API}?format=json&lang=jp&db=${db}&startDate=${startDate}&code=${codes.join(',')}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'konylog-souba-updater' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.STATUS !== 200) throw new Error(`${json.MESSAGEID} ${json.MESSAGE}`);
      return json.RESULTSET || [];
    } catch (err) {
      if (attempt === 4) throw err;
      const wait = 2 ** attempt * 1000;
      console.warn(`  取得失敗（${err.message}）。${wait / 1000}秒後に再試行します`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  return [];
}

const ym = (n) => `${String(n).slice(0, 4)}-${String(n).slice(4, 6)}`;
const nextMonth = (s) => {
  let [y, m] = s.split('-').map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, '0')}`;
};

/** API の結果を { 'YYYY-MM': 値 } に変換 */
function toMap(row) {
  const map = new Map();
  const dates = row.VALUES?.SURVEY_DATES || [];
  const vals = row.VALUES?.VALUES || [];
  dates.forEach((d, i) => {
    const v = vals[i];
    if (v !== null && v !== '' && v !== undefined && !Number.isNaN(Number(v))) map.set(ym(d), Number(v));
  });
  return map;
}

/** 旧基準 linkMap を新基準 mainMap の最初の12か月（重なり期間）の平均比でつなぐ */
function linkSeries(mainMap, linkMap) {
  const mainKeys = [...mainMap.keys()].sort();
  const overlap = mainKeys.filter((k) => linkMap.has(k)).slice(0, 12);
  if (overlap.length < 6) return { map: mainMap, linked: false };
  const avg = (keys, m) => keys.reduce((s, k) => s + m.get(k), 0) / keys.length;
  const ratio = avg(overlap, mainMap) / avg(overlap, linkMap);
  const out = new Map();
  for (const [k, v] of linkMap) if (k < mainKeys[0]) out.set(k, Math.round(v * ratio * 10) / 10);
  for (const [k, v] of mainMap) out.set(k, v);
  return { map: out, linked: true };
}

async function main() {
  const items = await loadItems();
  const wanted = new Map(); // main code -> link code | null
  for (const it of items) {
    const code = it.trend?.code;
    if (!code) continue;
    if (!wanted.has(code) || it.trend.link) wanted.set(code, it.trend.link || wanted.get(code) || null);
  }
  const allCodes = new Set();
  for (const [code, link] of wanted) { allCodes.add(code); if (link) allCodes.add(link); }

  // DBごと・CHUNKごとに取得
  const rows = new Map();
  const byDb = new Map();
  for (const c of allCodes) {
    const db = dbOf(c);
    if (!byDb.has(db)) byDb.set(db, []);
    byDb.get(db).push(c);
  }
  for (const [db, codes] of byDb) {
    for (let i = 0; i < codes.length; i += CHUNK) {
      const chunk = codes.slice(i, i + CHUNK);
      console.log(`取得中: ${db} ${i + 1}〜${i + chunk.length} / ${codes.length}`);
      // 旧基準の系列は START より前から取らないとつなげないことはないが、重なり期間(2020年)を含めるため START から取得
      for (const row of await fetchSeries(db, chunk, START)) rows.set(row.SERIES_CODE, row);
    }
  }

  const series = {};
  let latest = '0000-00';
  for (const [code, link] of wanted) {
    const row = rows.get(code);
    if (!row) { console.warn(`  見つからない系列: ${code}`); continue; }
    let map = toMap(row);
    let linked = false;
    if (link && rows.has(link)) ({ map, linked } = linkSeries(map, toMap(rows.get(link))));
    const keys = [...map.keys()].filter((k) => k >= ym(START)).sort();
    if (!keys.length) { console.warn(`  データなし: ${code}`); continue; }
    const values = [];
    for (let k = keys[0]; k <= keys[keys.length - 1]; k = nextMonth(k)) values.push(map.has(k) ? map.get(k) : null);
    const last = keys[keys.length - 1];
    if (last > latest) latest = last;
    series[code] = {
      name: String(row.NAME_OF_TIME_SERIES_J || '').replace(/^\[[^\]]+\]\s*/, '').replace(/^.*\/_*/, ''),
      unit: row.UNIT_J || '',
      start: keys[0],
      last,
      lastUpdate: row.LAST_UPDATE ? ym(row.LAST_UPDATE) + '-' + String(row.LAST_UPDATE).slice(6, 8) : '',
      linkedFrom: linked ? link : null,
      values,
    };
  }

  const today = new Date();
  const out = {
    generatedAt: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    latestMonth: latest,
    source: '日本銀行「時系列統計データ検索サイト」API（企業物価指数・企業向けサービス価格指数、2020年=100）',
    series,
  };
  const body =
    '/* 自動生成ファイル: node tools/update-souba-trends.mjs で作り直します（手で編集しない） */\n' +
    `window.KONYLOG_SOUBA_TRENDS = ${JSON.stringify(out)};\n`;
  await writeFile(OUT_FILE, body, 'utf8');
  console.log(`書き出し完了: ${path.relative(ROOT, OUT_FILE)}（${Object.keys(series).length}系列、最新 ${latest}）`);
}

main().catch((err) => {
  console.error('エラー:', err.message);
  process.exit(1);
});
