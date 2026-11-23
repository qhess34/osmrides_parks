#!/usr/bin/env python3
"""Fabrique la carte du parc entier à partir de l'extrait OpenStreetMap du parc.

Usage : python3 tools/make_park.py extrait.osm lieux/parc/asterix/plan.data.js

Extrait : https://api.openstreetmap.org/api/0.6/map?bbox=2.560,49.130,2.582,49.142 (non versionné).
Projection identique à make_site.py : mètres, x vers l'est, z vers le sud, origine = origine de la Trace du Hourra
(lat 49.13554, lon 2.56816). Aucun fichier de spécification n'existe pour Zeus : son emplacement est le centroïde
de ses tronçons roller_coaster=track (relation « site » Tonnerre 2 Zeus), exprimé dans cette même origine.
Coordonnées arrondies à 0,1 m, lignes simplifiées (Douglas-Peucker, 0,5 m).
Sortie : const PARK={plaza,water,lawn,forest,bld,paths,roads,tracks:[{name,pts}],pois:[{name,x,z}],attr:[{id,name,x,z,site}]}
  plaza (zones piétonnes : highway=pedestrian + area, area:highway, place=square, multipolygones), water, lawn, forest, bld : liste d'entités, chacune = liste d'anneaux [x,z,x,z…] (trous inclus, à tracer en evenodd)
  paths, steps (escaliers highway=steps), roads, tracks.pts : polylignes [x,z,x,z…] ; rock (natural=rock|stone|bare_rock) : anneaux
"""
import sys, json, math, collections, xml.etree.ElementTree as ET

osm, out = sys.argv[1], sys.argv[2]
lat0, lon0 = 49.13554, 2.56816
TOL = 0.5
root = ET.parse(osm).getroot()
kx = 111320 * math.cos(math.radians(lat0))
NODE = {n.get('id'): ((float(n.get('lon')) - lon0) * kx, -(float(n.get('lat')) - lat0) * 111320) for n in root.iter('node')}
tg = lambda e: {t.get('k'): t.get('v') for t in e.findall('tag')}
WAY = {w.get('id'): w for w in root.iter('way')}
WT = {i: tg(w) for i, w in WAY.items()}
nds = lambda w: [x.get('ref') for x in w.findall('nd') if x.get('ref') in NODE]
pts_of = lambda ids: [NODE[i] for i in ids]

def dp(P, tol):
    if len(P) < 3: return P
    keep = [False] * len(P); keep[0] = keep[-1] = True; st = [(0, len(P) - 1)]
    while st:
        a, b = st.pop(); (ax, az), (bx, bz) = P[a], P[b]
        dx, dz = bx - ax, bz - az; L = math.hypot(dx, dz); m, k = -1, -1
        for i in range(a + 1, b):
            px, pz = P[i]
            d = abs(dx * (az - pz) - (ax - px) * dz) / L if L else math.hypot(px - ax, pz - az)
            if d > m: m, k = d, i
        if m > tol: keep[k] = True; st += [(a, k), (k, b)]
    return [p for p, f in zip(P, keep) if f]

def flat(P):
    o = []
    for x, z in P: o += [round(x, 1), round(z, 1)]
    return o
def line(P): return flat(dp(P, TOL))
def ring(P):
    P = dp(P, TOL)
    if len(P) > 1 and P[0] == P[-1]: P = P[:-1]
    return flat(P) if len(P) >= 3 else None
def centroid(P): return (sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P))

isped = lambda t: (t.get('highway') == 'pedestrian' and (t.get('area') == 'yes' or t.get('type') == 'multipolygon')) or 'area:highway' in t or t.get('place') == 'square'
def classify(t):
    if isped(t): return 'plaza'  # zone piétonne : surface praticable, dessinée sous les chemins ; les chemins qu'elle contient sont fondus dedans
    if t.get('natural') in ('water', 'wetland') or t.get('landuse') == 'reservoir' or t.get('waterway') in ('canal', 'stream', 'riverbank'): return 'water'
    if t.get('landuse') in ('forest',) or t.get('natural') in ('wood', 'scrub'): return 'forest'
    if t.get('landuse') in ('grass', 'meadow', 'flowerbed') or t.get('leisure') in ('park', 'garden', 'playground'): return 'lawn'
    if 'building' in t and t['building'] != 'no': return 'bld'
    if t.get('natural') in ('rock', 'stone', 'bare_rock'): return 'rock'  # rochers (relief) et affleurements
    return None

L = {k: [] for k in ('water', 'lawn', 'forest', 'bld', 'plaza', 'rock')}
paths, roads, paths_raw, steps = [], [], [], []
used_in_rel = set()

# ── multipolygones : anneaux assemblés à partir des membres
def rings_of(members):
    segs = [nds(WAY[m]) for m in members if m in WAY and len(nds(WAY[m])) > 1]
    out = []
    while segs:
        cur = segs.pop(0)
        while cur[0] != cur[-1]:
            for i, s in enumerate(segs):
                if s[0] == cur[-1]: cur += s[1:]; segs.pop(i); break
                if s[-1] == cur[-1]: cur += s[::-1][1:]; segs.pop(i); break
                if s[-1] == cur[0]: cur = s[:-1] + cur; segs.pop(i); break
                if s[0] == cur[0]: cur = s[::-1][:-1] + cur; segs.pop(i); break
            else: break
        if cur[0] == cur[-1] and len(cur) > 3: out.append(cur)
    return out
for r in root.iter('relation'):
    t = tg(r)
    if t.get('type') != 'multipolygon': continue
    k = classify(t)
    if not k: continue
    mem = [(m.get('ref'), m.get('role')) for m in r.findall('member') if m.get('type') == 'way']
    rs = [ring(pts_of(x)) for x in rings_of([m for m, ro in mem if ro in ('outer', 'inner', '')])]
    rs = [x for x in rs if x]
    if rs:
        L[k].append(rs)
        used_in_rel.update(m for m, ro in mem if ro == 'outer')

for i, w in WAY.items():
    t = WT[i]; ids = nds(w)
    if len(ids) < 2: continue
    P = pts_of(ids); closed = ids[0] == ids[-1]
    if t.get('roller_coaster') == 'track': continue
    h = t.get('highway')
    if h and not isped(t):
        if h == 'steps': steps.append(line(P))  # escaliers : dessinés à part (marches), jamais fondus dans une zone piétonne
        elif h in ('footway', 'pedestrian', 'path', 'track', 'cycleway'): paths_raw.append(P)
        elif h in ('service', 'unclassified', 'tertiary', 'secondary', 'primary', 'residential', 'motorway', 'motorway_link', 'trunk', 'trunk_link'): roads.append(line(P))
        continue
    k = classify(t)
    if t.get('waterway') in ('canal', 'stream') and not closed:
        # canal linéaire : tracé comme ligne d'eau épaisse via un anneau n'a pas de sens ; stocké en tant que chemin d'eau
        L['water'].append([('L', line(P))]); continue
    if k and closed and i not in used_in_rel:
        r_ = ring(P)
        if r_: L[k].append([r_])
# chemins à l'intérieur d'une zone piétonne (≥ 80 % des points, hors trous) : fondus dans la zone, non dessinés
def inside(p, R):
    c = False; n = len(R) // 2; j = n - 1
    for i in range(n):
        xi, zi, xj, zj = R[2 * i], R[2 * i + 1], R[2 * j], R[2 * j + 1]
        if (zi > p[1]) != (zj > p[1]) and p[0] < (xj - xi) * (p[1] - zi) / (zj - zi) + xi: c = not c
        j = i
    return c
def in_plaza(p): return any(sum(inside(p, r) for r in f) % 2 == 1 for f in L['plaza'])  # evenodd : dans l'anneau extérieur et hors des trous
nfused = 0
for P in paths_raw:
    if sum(in_plaza(q) for q in P) >= .8 * len(P): nfused += 1
    else: paths.append(line(P))
print('zones piétonnes %d, chemins fondus dedans %d' % (len(L['plaza']), nfused))
# les canaux linéaires sont marqués ('L', pts) : on les convertit en {"l": pts}
L['water'] = [([{'l': x[1]} for x in f] if isinstance(f[0], tuple) else f) for f in L['water']]

# ── tracés des attractions
zeus_ways = set()
for r in root.iter('relation'):
    t = tg(r)
    if t.get('type') == 'site' and 'Zeus' in t.get('name', ''):
        zeus_ways |= {m.get('ref') for m in r.findall('member') if m.get('type') == 'way'}
import glob, os
SPEC_WAYS = {os.path.basename(f)[:-5]: {str(i) for i in json.load(open(f)).get('track_ways', [])} for f in glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'specs', '*.json'))}  # tronçons des circuits : tools/specs/<site>.json
oziris_ways = {'937048122', '541161843', '937048120', '541161845', '541161844', '421460641', '541161850', '1102773847', '541161849', '1101623925', '541161848', '541161847', '937048121', '1330192627'}  # tools/specs/oziris.json
goudurix_ways = {'937067647', '541092977', '541092979', '541092993', '541092992', '541092990', '541092991', '541092989', '541092988', '541092987', '1181620312', '541092986', '1181620311', '541092985', '1181620310', '1181620309', '541092984', '541092983', '541092982', '937067646'}  # tools/specs/goudurix.json
hourra_ways = {'1231613335', '937061488', '1182632576', '541427605', '1182632575', '541427599', '1182419818', '541427592'}
oziris_ways = SPEC_WAYS.get('oziris', oziris_ways); goudurix_ways = SPEC_WAYS.get('goudurix', goudurix_ways); hourra_ways = SPEC_WAYS.get('hourra', hourra_ways)

# ── attractions nommées
attr = []
for e in list(root.iter('node')) + list(root.iter('way')) + list(root.iter('relation')):
    t = tg(e)
    if 'name' not in t: continue
    if not (t.get('tourism') == 'attraction' or 'attraction' in t or 'roller_coaster' in t): continue
    if t.get('roller_coaster') == 'track' or t.get('leisure') == 'playground' and 'attraction' not in t: pass
    if e.tag == 'node': p = NODE.get(e.get('id'))
    elif e.tag == 'way':
        ids = nds(e); p = centroid(pts_of(ids)) if ids else None
    else:
        ps = [NODE[m.get('ref')] for m in e.findall('member') if m.get('type') == 'node' and m.get('ref') in NODE]
        for m in e.findall('member'):
            if m.get('type') == 'way' and m.get('ref') in WAY: ps += pts_of(nds(WAY[m.get('ref')]))
        p = centroid(ps) if ps else None
    if p is None or t.get('roller_coaster') == 'track': continue
    attr.append({'id': e.tag[0] + e.get('id'), 'name': t['name'], 'x': round(p[0], 1), 'z': round(p[1], 1), 'kind': t.get('attraction', ''), 'rc': t.get('attraction') == 'roller_coaster'})
# Les montagnes russes sans nom propre d'attraction mais nommées par leurs tronçons (ex. Goudurix) : déjà couvertes par le nœud
# Zeus et Hourra : centroïde des tronçons
def track_centroid(wset):
    ps = [p for i in wset if i in WAY for p in pts_of(nds(WAY[i]))]
    return centroid(ps) if ps else None
zc = track_centroid(zeus_ways) or track_centroid({i for i, t in WT.items() if t.get('roller_coaster') == 'track' and 'Zeus' in t.get('name', '')})
hc = track_centroid(hourra_ways)
oc = track_centroid(oziris_ways)
gxc = track_centroid(goudurix_ways)

# dédoublonnage : même nom normalisé à moins de 120 m => on garde les nœuds/les roller_coaster de préférence
norm = lambda s: ''.join(c for c in s.lower() if c.isalnum())
final = []
for a in sorted(attr, key=lambda a: (not a['rc'], a['id'][0] != 'n')):
    if any(norm(b['name']) == norm(a['name']) and math.hypot(a['x'] - b['x'], a['z'] - b['z']) < 120 for b in final): continue
    final.append(a)
for a in final:
    n = norm(a['name']); a['site'] = None
    if 'zeus' in n and 'tonnerre' in n: a['site'] = 'zeus'
    elif 'hourra' in n: a['site'] = 'hourra'
    elif n == 'oziris': a['site'] = 'oziris'
    elif n == 'goudurix': a['site'] = 'goudurix'
    del a['kind']; del a['rc']
for a in final:
    if a['site'] == 'zeus' and zc: a['track'] = [round(zc[0], 1), round(zc[1], 1)]
    if a['site'] == 'hourra' and hc: a['track'] = [round(hc[0], 1), round(hc[1], 1)]
    if a['site'] == 'oziris' and oc: a['track'] = [round(oc[0], 1), round(oc[1], 1)]
    if a['site'] == 'goudurix' and gxc: a['track'] = [round(gxc[0], 1), round(gxc[1], 1)]
final.sort(key=lambda a: a['name'])

# tronçons : un par way, nommé par son nom, sinon par l'attraction (relation Zeus, Hourra) ou la plus proche attraction à moins de 120 m
rc_pts = [(a['x'], a['z'], a['name']) for a in final if a['site'] or True]
tracks = []
for i, w in WAY.items():
    t = WT[i]
    if t.get('roller_coaster') != 'track': continue
    ids = nds(w)
    if len(ids) < 2: continue
    P = pts_of(ids); nm = t.get('name')
    if not nm and i in zeus_ways: nm = 'Tonnerre 2 Zeus'
    if not nm and i in hourra_ways: nm = 'Trace du Hourra'
    if not nm and i in oziris_ways: nm = 'OzIris'
    if not nm:
        c = centroid(P); best = min(((math.hypot(c[0] - x, c[1] - z), n) for x, z, n in rc_pts), default=(1e9, ''))
        nm = best[1] if best[0] < 150 else ''
    tracks.append({'name': nm, 'pts': line(P)})

pois = []
for n in root.iter('node'):
    t = tg(n)
    if 'name' in t and not (t.get('tourism') == 'attraction' or 'attraction' in t) and any(k in t for k in ('amenity', 'shop', 'tourism')) and t.get('tourism') != 'artwork':
        x, z = NODE[n.get('id')]; pois.append({'name': t['name'], 'x': round(x, 1), 'z': round(z, 1), 'k': t.get('amenity') or t.get('shop') or t.get('tourism')})

PARK = {'origin': [lat0, lon0], 'plaza': L['plaza'], 'water': L['water'], 'lawn': L['lawn'], 'forest': L['forest'], 'bld': L['bld'], 'paths': paths, 'steps': steps, 'rock': L['rock'], 'roads': roads, 'tracks': tracks, 'pois': pois, 'attr': final}
js = '/* Données © contributeurs OpenStreetMap (ODbL) — carte du Parc Astérix. Généré par tools/make_park.py, ne pas éditer. Origine : Trace du Hourra. */\nconst PARK=' + json.dumps(PARK, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(out, 'w', encoding='utf-8').write(js)
print('écrit %s : %d Ko ; eau %d, pelouse %d, forêt %d, bât. %d, chemins %d, routes %d, tracés %d, poi %d, attractions %d' % (
    out, len(js.encode()) // 1024, len(L['water']), len(L['lawn']), len(L['forest']), len(L['bld']), len(paths), len(roads), len(tracks), len(pois), len(final)))
print('zeus', zc, 'hourra', hc)
for a in final:
    if a['site']: print(a)
