#!/usr/bin/env python3
"""Validate crane JSON files against SCHEMA.md and run sanity checks on the load charts.
Usage: python3 -I tools/crane/scripts/validate.py tools/crane/data/src/*.json      (exit code 1 if any ERROR)
ERROR = structural problem that must be fixed. WARN = suspicious value: re-check against the source PDF image.
"""
import sys, json, math
ZONES = {'all', 'side', 'front', 'rear'}
def is_num(x): return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)

def check(path):
    E, W = [], []
    try:
        d = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        return [f'cannot parse: {e}'], []
    for k in ['id', 'maker', 'model', 'classTon', 'status', 'sources', 'hooks', 'boom', 'outriggers', 'boomCharts', 'vehicle', 'verification']:
        if k not in d: E.append(f'missing key {k}')
    if E: return E, W
    if d['maker'] not in ('tadano', 'kato'): E.append('maker must be tadano|kato')
    if d['status'] not in ('current', 'legacy'): E.append('status must be current|legacy')
    for hk, h in d['hooks'].items():
        if not is_num(h.get('mass')) or not (0 < h['mass'] < 3): E.append(f'hook {hk} mass must be t (0..3): {h.get("mass")}')
    b = d['boom']
    for k in ['min', 'max', 'angleMax']:
        if not is_num(b.get(k)): E.append(f'boom.{k} missing')
    states = {s['id']: s for s in d['outriggers'].get('states', [])}
    if not states: E.append('no outrigger states')
    widths = [s.get('width') for s in d['outriggers']['states']]
    if any(not is_num(w) for w in widths): E.append('state width missing')
    elif widths != sorted(widths, reverse=True): W.append('states not ordered widest->narrowest')
    charts = {}
    maxT = d.get('maxLoad', {}).get('t') or d['classTon']
    for i, c in enumerate(d['boomCharts']):
        tag = f'boomCharts[{i}]({c.get("state")},{c.get("zone")})'
        if c.get('state') not in states: E.append(f'{tag}: unknown state')
        if c.get('zone') not in ZONES: E.append(f'{tag}: bad zone')
        key = (c.get('state'), c.get('zone'), c.get('counterweight', ''))
        charts.setdefault((c.get('state'), c.get('zone')), []).append(c)
        cols, radii, loads = c.get('cols', []), c.get('radii', []), c.get('loads', [])
        if not cols or not radii: E.append(f'{tag}: empty'); continue
        if len(loads) != len(radii): E.append(f'{tag}: loads rows {len(loads)} != radii {len(radii)}'); continue
        if any(len(r) != len(cols) for r in loads): E.append(f'{tag}: row length != cols'); continue
        if any(not is_num(r) for r in radii): E.append(f'{tag}: non-numeric radius'); continue
        if any(radii[k+1] <= radii[k] for k in range(len(radii)-1)): E.append(f'{tag}: radii not strictly increasing')
        for col in cols:
            if not is_num(col.get('L')): E.append(f'{tag}: col without L')
            elif not (b['min'] - 0.05 <= col['L'] <= b['max'] + 0.05): W.append(f'{tag}: col L {col["L"]} outside boom {b["min"]}-{b["max"]}')
            a = col.get('angle')
            if a is not None and (len(a) != 2 or not all(is_num(x) for x in a) or a[0] > a[1]): E.append(f'{tag}: bad angle {a}')
        for j, col in enumerate(cols):
            prev = None
            vals = [loads[r][j] for r in range(len(radii))]
            if all(v is None for v in vals): W.append(f'{tag}: column {col.get("L")} empty')
            for r in range(len(radii)):
                v = loads[r][j]
                if v is None: continue
                if not is_num(v) or v <= 0: E.append(f'{tag}: bad value {v} at R={radii[r]} L={col.get("L")}'); continue
                if v > maxT * 1.001 and c.get('zone') != 'front': W.append(f'{tag}: {v}t > maxLoad {maxT}t at R={radii[r]} L={col.get("L")}')
                if prev is not None and v > prev + 1e-9: W.append(f'{tag}: load increases with radius at R={radii[r]} L={col.get("L")} ({prev}->{v})')
                prev = v
            # blanks in the middle of a column
            idx = [r for r in range(len(radii)) if loads[r][j] is not None]
            if idx and any(loads[r][j] is None for r in range(idx[0], idx[-1]+1)): W.append(f'{tag}: gap inside column L={col.get("L")}')
    # side chart <= max chart at same R/L
    first = d['outriggers']['states'][0]['id'] if d['outriggers'].get('states') else 'max'
    mx = [c for c in d['boomCharts'] if c['state'] == first and c['zone'] == 'all']
    if not mx: E.append(f'no boomChart for the widest state "{first}" zone "all"')
    for M in mx:
        mi = {(R, col['L'], col.get('mode')): M['loads'][r][j] for r, R in enumerate(M['radii']) for j, col in enumerate(M['cols'])}
        for c in d['boomCharts']:
            if c is M or c['zone'] == 'front' or c.get('counterweight', '') != M.get('counterweight', ''): continue
            if c.get('parts') != M.get('parts'): continue
            n = 0
            for r, R in enumerate(c['radii']):
                for j, col in enumerate(c['cols']):
                    v = c['loads'][r][j]; m = mi.get((R, col['L'], col.get('mode')))
                    if v is not None and m is not None and v > m + 1e-9: n += 1
            if n: W.append(f'boom chart ({c["state"]},{c["zone"]}) exceeds max chart in {n} cells')
    # narrower outrigger state should not exceed a wider one (same zone kind side/all, same counterweight, same R/L/mode)
    order = [x['id'] for x in d['outriggers']['states']]
    def cellmap(c):
        return {(R, col['L'], col.get('mode')): c['loads'][r][j] for r, R in enumerate(c['radii']) for j, col in enumerate(c['cols'])}
    side_like = [c for c in d['boomCharts'] if c['zone'] in ('all', 'side') and c['state'] in order]
    side_like.sort(key=lambda c: order.index(c['state']))
    for a_i in range(len(side_like)):
      for b_i in range(a_i + 1, len(side_like)):
        A, B = side_like[a_i], side_like[b_i]
        if A['state'] == B['state'] or A.get('counterweight', '') != B.get('counterweight', '') or A.get('parts') != B.get('parts'): continue
        if order.index(B['state']) != min([order.index(x['state']) for x in side_like if order.index(x['state']) > order.index(A['state']) and x.get('parts') == A.get('parts')] or [-1]): continue
        ma, mb = cellmap(A), cellmap(B)
        n = sum(1 for k, v in mb.items() if v is not None and ma.get(k) is not None and v > ma[k] + 1e-9)
        if n: W.append(f'boom chart {B["state"]} exceeds wider state {A["state"]} in {n} cells')
    # zone references
    for s in d['outriggers']['states']:
        for z in s.get('zones', []):
            u = z.get('use', {})
            if z.get('zone') not in ('front', 'rear') or not is_num(z.get('half')): E.append(f'state {s["id"]}: bad zone rule {z}')
            if (u.get('state'), u.get('zone')) not in charts: E.append(f'state {s["id"]}: zone rule refers to missing chart {u}')
        if not any(k[0] == s['id'] for k in charts): E.append(f'state {s["id"]} has no boom chart')
    # jib charts
    for i, c in enumerate(d.get('jibCharts', [])):
        tag = f'jibCharts[{i}]({c.get("state")},{c.get("jib")})'
        if c.get('state') not in states: E.append(f'{tag}: unknown state')
        if c.get('zone') not in ZONES: E.append(f'{tag}: bad zone')
        t = c.get('type')
        if t == 'radius':
            radii, loads, cols = c.get('radii', []), c.get('loads', []), c.get('cols', [])
            if len(loads) != len(radii) or any(len(r) != len(cols) for r in loads): E.append(f'{tag}: dims'); continue
            if any(radii[k+1] <= radii[k] for k in range(len(radii)-1)): E.append(f'{tag}: radii not increasing')
            for j, col in enumerate(cols):
                if not is_num(col.get('offset')): E.append(f'{tag}: col without offset')
                prev = None
                for r in range(len(radii)):
                    v = loads[r][j]
                    if v is None: continue
                    if not is_num(v) or v <= 0: E.append(f'{tag}: bad value {v}'); continue
                    if prev is not None and v > prev + 1e-9: W.append(f'{tag}: load increases at R={radii[r]} col={col}')
                    prev = v
        elif t == 'angle':
            ang, rad, loads, cols = c.get('angles', []), c.get('radius', []), c.get('loads', []), c.get('cols', [])
            if not (len(ang) == len(rad) == len(loads)) or any(len(r) != len(cols) for r in rad + loads): E.append(f'{tag}: dims'); continue
            if any(ang[k+1] >= ang[k] for k in range(len(ang)-1)): E.append(f'{tag}: angles not decreasing')
            for j, col in enumerate(cols):
                pr = pv = None
                for r in range(len(ang)):
                    R, v = rad[r][j], loads[r][j]
                    if (R is None) != (v is None): W.append(f'{tag}: radius/load blank mismatch at {ang[r]}° col {j}')
                    if v is None: continue
                    if pr is not None and R <= pr: W.append(f'{tag}: radius not increasing at {ang[r]}° col {j}')
                    if pv is not None and v > pv + 1e-9: W.append(f'{tag}: load increases at {ang[r]}° col {j}')
                    pr, pv = R, v
        else:
            E.append(f'{tag}: type must be radius|angle')
    for i, c in enumerate(d.get('onTire', [])):
        tag = f'onTire[{i}]({c.get("mode")},{c.get("zone")})'
        if c.get('mode') not in ('static', 'creep') or c.get('zone') not in ('front', 'all'): E.append(f'{tag}: bad mode/zone')
        radii, loads, cols = c.get('radii', []), c.get('loads', []), c.get('cols', [])
        if not radii or not cols: E.append(f'{tag}: empty'); continue
        if len(loads) != len(radii) or any(len(r) != len(cols) for r in loads): E.append(f'{tag}: dims'); continue
        if any(radii[k+1] <= radii[k] for k in range(len(radii)-1)): E.append(f'{tag}: radii not increasing')
        for j in range(len(cols)):
            prev = None
            for r in range(len(radii)):
                v = loads[r][j]
                if v is None: continue
                if not is_num(v) or v <= 0: E.append(f'{tag}: bad value {v}'); continue
                if prev is not None and v > prev + 1e-9: W.append(f'{tag}: load increases at R={radii[r]} L={cols[j].get("L")}')
                prev = v
    v = d['vehicle']
    for k in ['length', 'width', 'height', 'gvw']:
        if not is_num(v.get(k)): E.append(f'vehicle.{k} missing')
    if is_num(v.get('width')) and v['width'] < 100: E.append('vehicle dims must be mm')
    if is_num(v.get('gvw')) and v['gvw'] < 1000: E.append('vehicle gvw must be kg')
    if v.get('axles') and is_num(v.get('gvw')) and abs(sum(v['axles']) - v['gvw']) > 30: W.append(f'axle sum {sum(v["axles"])} != gvw {v["gvw"]}')
    return E, W

if __name__ == '__main__':
    bad = 0
    for p in sys.argv[1:]:
        E, W = check(p)
        print(f'## {p}: {len(E)} errors, {len(W)} warnings')
        for e in E: print('  ERROR', e)
        for w in W[:60]: print('  WARN ', w)
        if len(W) > 60: print(f'  ... {len(W)-60} more warnings')
        bad += bool(E)
    sys.exit(1 if bad else 0)
