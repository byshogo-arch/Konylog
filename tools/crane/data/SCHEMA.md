# Crane data schema (one JSON file per model)

Units: loads in **t** (metric tonnes, = 定格総荷重 as printed, converted from kg if needed), lengths/radii in **m**,
angles in **degrees**, vehicle dimensions in **mm**, vehicle masses in **kg**. Use `null` for blank cells.
All numbers must come from the manufacturer's document. Never interpolate, round or invent values.
Reference example: `src/tadano-gr-250n-5.json`.

```jsonc
{
  "id": "kato-sr-250rf2",            // "<maker>-<model slug>"; lowercase, ascii
  "maker": "kato",                    // "tadano" | "kato"
  "model": "SR-250RfⅡ",              // as marketed
  "generation": "",                   // optional, e.g. "GR-250N-5（第5世代）"
  "nickname": "",                     // optional, e.g. "CREVO250 G5", "PREMIUM"
  "classTon": 25,                     // nominal class in t (e.g. 4.9 for 4.9t-limited versions)
  "status": "current",                // "current" (sold now) | "legacy" (older model still in rental fleets)
  "variant": "4段ブーム・2段パワージブ・X型アウトリガ", // which spec variant the data represents
  "maxLoad": {"t": 25.0, "r": 3.5, "L": 9.35, "note": "7本掛"},  // headline capacity (from 主要諸元)
  "sources": [{"title": "...", "url": "https://...pdf", "via": "product page url", "pages": "p.4-p.12"}],

  "hooks": {                          // masses in t, as printed in the chart notes
    "main": {"label": "25tフック", "mass": 0.23},
    "aux":  {"label": "4.5tフック", "mass": 0.06}
  },
  "singleTop": {"deduct": 0.06, "limit": 4.5, "hook": "aux", "note": "ルースタシーブ"}, // optional
  "jibMounted": {"deduct": 2.4, "limit": 12, "note": "ジブ装着のままブーム作業時"},       // optional

  "boom": {"sections": 4, "min": 9.35, "max": 30.5, "angleMin": 0, "angleMax": 84,
           "maxHeight": 31.3, "maxRadius": 27.9,      // from 主要諸元 (最大地上揚程 / 最大作業半径 ブーム)
           "modes": [{"id": "A", "label": "MODE A"}, {"id": "B", "label": "MODE B"}]}, // only if the chart has telescoping modes
  "jib": {"type": "2段パワージブ", "lengths": [8.7, 13.1], "offsetMin": 5, "offsetMax": 60,
          "maxHeight": 44.0, "maxRadius": 34.0},     // omit if the model has no jib

  "outriggers": {
    "type": "X",                       // "X" | "H" | "X/H"
    "states": [                        // ordered widest -> narrowest, uniform extension of all 4 outriggers
      {"id": "max", "width": 6.6, "label": "最大張出", "zones": []},
      {"id": "m6.1", "width": 6.1, "label": "中間張出",
       "zones": [                      // slew zones where ANOTHER chart applies (angles are half-angles
                                       // measured at the slewing centre from the carrier's centre line)
         {"zone": "front", "half": 35, "use": {"state": "max", "zone": "all"}},
         {"zone": "rear",  "half": 35, "use": {"state": "max", "zone": "all"}}
       ]},
      {"id": "min", "width": 2.31, "label": "最縮小張出", "zones": [...], "noJib": true, "note": "H型のみ"}
    ],
    "note": "側方域は張出幅ごとの性能、前方・後方域(±α°)は最大張出の性能"
  },
  // Zone resolution used by the app, for slew angle θ (0° = carrier front / cab side, 180° = rear):
  //   if θ within ±half of 0° and a "front" zone rule exists -> use that rule's chart
  //   if θ within ±half of 180° and a "rear" zone rule exists -> use that rule's chart
  //   otherwise -> this state's own chart: zone "all" if present, else "side".
  //   A front special performance (前方特別性能 / 前方性能) chart is stored with zone "front" and referenced
  //   from the states where it is allowed, e.g. {"zone":"front","half":45,"use":{"state":"max","zone":"front"}}.

  "boomCharts": [{
    "state": "max",                    // outrigger state id
    "zone": "all",                     // "all" (全周/360°) | "side" (側方) | "front" (前方性能/前方特別性能) | "rear"
    "counterweight": "",               // optional, e.g. "カウンタウエイト 6.4t"; omit if only one configuration
    "cols": [                          // one entry per chart column, in printed order
      {"L": 9.35, "mode": "A", "angle": [0, 84], "parts": 8, "hook": "main", "telescope": "0/0/0"}
      //  L: boom length; mode: telescoping mode label if the column is mode-specific ("A","B","A,B")
      //  angle: [min,max] boom angle range at no load (A(°), [DEG], or 危険角度 => [危険角度, angleMax]); null if not printed
      //  parts: standard parts of line (巻掛本数) if printed; hook: "main"|"aux"; telescope: optional text
    ],
    "radii": [2.5, 3.0, 3.5],          // working radius rows (m), increasing
    "loads": [[25.0, 18.0, null]],     // loads[row][col] in t, null where the cell is blank
    "src": "仕様書 p.5 アウトリガ最大張出（全周）"
  }],

  "jibCharts": [
    // type "radius": loads by working radius (e.g. Tadano G5 FAJ, Kato SL jib charts by radius)
    {"state": "max", "zone": "all", "type": "radius", "jib": 8.2, "hook": "aux",
     "cols": [{"L": 30.5, "offset": 5, "angle": [37, 84]}],
     "radii": [5.5, 6.0], "loads": [[3.3], [3.3]], "src": "..."},
    // type "angle": rows by BOOM ANGLE with the reference working radius for each column
    {"state": "max", "zone": "all", "type": "angle", "jib": 8.0, "hook": "aux", "boomL": 30.5,
     "cols": [{"offset": 5, "angle": [29, 83]}, {"offset": 25, "angle": [34, 83]}],
     "angles": [83, 76, 72],                  // boom angle rows (deg), decreasing
     "radius": [[4.3, 6.9], [9.5, 11.8], [12.3, 14.4]],   // reference radius per row/col (m)
     "loads":  [[3.0, 2.1], [3.0, 2.1], [3.0, 2.1]],      // t
     "src": "..."}
  ],

  "onTire": [                          // optional (アウトリガ不使用). mode "static"(静止/定置) | "creep"(走行つり)
    {"mode": "static", "zone": "front", "cols": [{"L": 9.35, "angle": [0, 77]}], "radii": [3.0], "loads": [[14.0]], "src": "..."}
  ],
  "onTireNote": "前方＝キャリヤ前方±2°以内。…",

  "geometry": {"footX": -1.5, "footY": 2.3, "estimated": true, "note": "作業半径-揚程図から目視概算"},
  // footX: horizontal distance from slewing centre to boom foot pin (negative = behind centre, away from the load)
  // footY: boom foot pin height above ground (m). Rough values read from the 作業半径-揚程図 are fine.

  "vehicle": {                         // 走行時 (travel configuration) from 主要諸元
    "length": 11470, "width": 2620, "height": 3440, "wheelbase": 3650,
    "gvw": 25575, "axles": [12790, 12785],   // 車両総重量 and 前軸重/後軸重 (or 第1..n軸重) in kg
    "turningRadius": 5.3, "turningRadius2ws": 8.6, "maxSpeed": 49,
    "note": "",                          // e.g. "カウンタウエイト取外し時の値", "公道走行不可（分解輸送）"
    "configs": []                        // optional extra travel configurations [{label, length,width,height,gvw,axles}]
  },
  "notes": ["chart notes worth showing to the user (hook mass rule, single top rule, wind, etc.)"],
  // notes / outriggers.note / onTireNote / jib.note are shown as they are: plain Japanese, no field names (cols, zone, rMax …).
  "dataNotes": ["how the data is stored, for maintainers (field names are fine here); shown only in the collapsed technical block"],
  "verification": {"status": "checked", "method": "how numbers were checked", "issues": ["anything uncertain"]}
}
```

Rules
- Extract every outrigger state that has its own chart (max / every intermediate / min). Use the standard
  (heaviest / full) counterweight configuration if several exist, unless told otherwise; note it in `counterweight`.
- If a chart has telescoping MODE A/B columns, keep them as separate cols with `"mode"` set, and list the modes in `boom.modes`.
- Keep columns and rows exactly in printed order. Do not fill blanks. Do not drop the last row.
- Radii must strictly increase within a chart. Loads in t (kg/1000).
- If the PDF is image-only, OCR (tesseract) or read the rendered image, then double-check every value against the image.
- Record anything uncertain in verification.issues instead of guessing.
