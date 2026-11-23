#!/usr/bin/env python3
"""Plan annoté « tracé complet » d'une attraction (ronds tous les 50 m, tableau distance / hauteur estimée / zone).
Usage : python3 tools/make_plan.py <site> docs/plans/<site>-trace-complete.png "Titre" [figures]
figures (facultatif) : "Nom:s0:s1:n;Nom:s0:s1:n;..." (n = inversions) : trace en couleur et nomme les figures (plan des figures) au lieu du tableau."""
import sys, json, math
from PIL import Image, ImageDraw, ImageFont
site, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
src = open('lieux/parc/asterix/%s.data.js' % site, encoding='utf8').read()
D = json.loads(src[src.index('=') + 1:].rstrip().rstrip(';'))
cps = D['cps']; n = len(cps)
tag = {}
for i, r in enumerate(cps):
    for t in r[4:]: tag[t] = i
step = lambda i, j: math.hypot(cps[j % n][0] - cps[i][0], cps[j % n][2] - cps[i][2])
S = [0.0]  # abscisse au sol (vue de dessus), cumulée le long des points de contrôle
for i in range(n): S.append(S[-1] + step(i, i + 1))
L = S[-1]
sidx = lambda t: tag[t]
def zone(i):
    if i < sidx('st1'): return 'gare'
    if i < sidx('lift0'): return 'avant lift'
    if i < sidx('lift1'): return 'lift'
    for t in tag:  # freins de bloc (bzN → blkN, sinon ≈ 9 m avant l'arrêt), frein final, rail de transfert, frein avant gare (repères OSM, tools/make_site.py)
        if t.startswith('blk') and t[3:].isdigit() and (tag.get('bz' + t[3:], tag[t] - 3) <= i <= tag[t]): return 'frein'
    if i >= sidx('brk'): return 'frein'
    return 'parcours'
COL = {'gare': (40, 110, 200), 'avant lift': (110, 110, 120), 'lift': (230, 140, 30), 'frein': (200, 40, 40), 'parcours': (105, 105, 115)}
xs = [r[0] for r in cps]; zs = [r[2] for r in cps]
W, H = 1450, 1100; ox, oz = 560, 60; GAR = [D['paths']['garage']] if 'garage' in D.get('paths', {}) else []  # voie de garage OSM (les autres voies OSM du voisinage ne sont pas dessinées)
x0, z0 = min(xs + [q[0] for o in GAR for q in o]) - 4, min(zs) - 4
sc = min((W - ox - 40) / (max(xs) + 4 - x0), (H - oz - 40) / (max(zs) + 4 - z0))
mx = lambda x: ox + (x - x0) * sc; mz = lambda z: oz + (z - z0) * sc
im = Image.new('RGB', (W, H), (242, 239, 230)); d = ImageDraw.Draw(im)
try: F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', s); FB = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
except Exception: F = FB = lambda s: ImageFont.load_default()
for f in D['feats']:
    if f['k'].startswith('building') and f['c']: d.polygon([(mx(p[0]), mz(p[1])) for p in f['p']], fill=(226, 220, 205))
    if f['k'] == 'natural=water' and f['c']: d.polygon([(mx(p[0]), mz(p[1])) for p in f['p']], fill=(206, 222, 232))
for f in D['feats']:  # trous (îlots) du lac : on les repeint
    if f['k'] == 'natural=water':
        for h in f.get('h', []): d.polygon([(mx(p[0]), mz(p[1])) for p in h], fill=(242, 239, 230))
for o in GAR: d.line([(mx(p[0]), mz(p[1])) for p in o], fill=(122, 60, 150), width=9)
for i in range(n): d.line([(mx(cps[i][0]), mz(cps[i][2])), (mx(cps[(i + 1) % n][0]), mz(cps[(i + 1) % n][2]))], fill=COL[zone(i)], width=9)
for i in range(0, n, 3):  # flèches de sens : un point blanc plus loin
    pass
FIGS = []
if len(sys.argv) > 4:
    for f in sys.argv[4].split(';'):
        nm, a0, a1, ninv = f.split(':'); FIGS.append((nm, float(a0), float(a1), int(ninv)))
    for nm, a0, a1, ninv in FIGS:
        for i in range(n):
            if a0 <= S[i] <= a1: d.line([(mx(cps[i][0]), mz(cps[i][2])), (mx(cps[(i + 1) % n][0]), mz(cps[(i + 1) % n][2]))], fill=(196, 96, 30), width=13)
# ronds tous les 50 m
rows = []
k = 0
for m in range(0, int(L) + 1, 50):
    i = min(range(n), key=lambda j: abs(S[j] - m)); x, z = mx(cps[i][0]), mz(cps[i][2]); k += 1
    d.ellipse([x - 22, z - 22, x + 22, z + 22], fill=(24, 30, 50)); d.text((x, z), str(k), fill='white', font=FB(24), anchor='mm')
    rows.append((k, m, cps[i][1], zone(i)))
if FIGS:  # plan des figures : étiquettes, pas de tableau
    for nm, a0, a1, ninv in FIGS:
        i = min(range(n), key=lambda j: abs(S[j] - (a0 + a1) / 2)); x, z = mx(cps[i][0]), mz(cps[i][2])
        tx = x + 40 if cps[i][0] < (min(xs) + max(xs)) / 2 + 10 else x - 40 - 230
        d.line([(x, z), (tx + (0 if tx > x else 230), z)], fill=(196, 96, 30), width=2)
        d.rectangle([tx, z - 15, tx + 230, z + 13], fill='white', outline=(196, 96, 30)); d.text((tx + 6, z - 12), '%s (%d)' % (nm, ninv), fill='black', font=FB(19))
    d.rectangle([10, 10, 520, H - 10], fill='white', outline='black', width=3)
    d.text((30, 28), title, fill='black', font=FB(40))
    y = 90
    for t in ('Plan des figures recalé sur le tracé OSM', "d'après l'affiche (par la forme, estimé).", '', 'Orange : figures, (n) = inversions.', 'Total : %d inversions.' % sum(f[3] for f in FIGS), '', 'Positions le long de la voie ESTIMÉES', '(OSM ne les donne pas) :'):
        d.text((30, y), t, fill='black', font=F(20)); y += 30
    for nm, a0, a1, ninv in FIGS:
        d.text((30, y), '%s' % nm, fill='black', font=FB(19)); d.text((300, y), 's = %d–%d m' % (a0, a1), fill='black', font=F(19)); y += 27
    d.text((W - 60, 40), 'N', fill='black', font=FB(40)); d.polygon([(W - 48, 4), (W - 68, 36), (W - 28, 36)], fill='black')
    d.rectangle([W - 330, H - 70, W - 330 + 50 * sc, H - 60], fill='black'); d.text((W - 330, H - 100), '50 m', fill='black', font=F(22))
    im.save(out); print('écrit', out, '(plan des figures)'); sys.exit(0)
d.rectangle([10, 10, 520, H - 10], fill='white', outline='black', width=3)
d.text((30, 28), title, fill='black', font=FB(40))
d.text((30, 90), 'Tracé complet (OSM), ronds dans le sens de marche.', fill='black', font=F(20))
d.text((30, 118), 'Ronds : tous les 50 m le long de la voie.', fill='black', font=F(20))
y = 160
for nm, c in (('Gare', COL['gare']), ('Lift', COL['lift']), ('Zones de freinage', COL['frein']), ('Parcours', COL['parcours']), ('Voie de garage (OSM)', (122, 60, 150))):
    d.rectangle([30, y, 70, y + 18], fill=c); d.text((82, y - 2), nm, fill='black', font=F(20)); y += 30
y += 14; d.text((30, y), 'Rond  distance  hauteur  zone', fill='black', font=FB(20)); y += 32
for r in rows: d.text((30, y), '%2d   s=%4d m   %4.1f m   %s' % (r[0], r[1], r[2], r[3]), fill='black', font=F(19)); y += 27
y += 12
for t in ('Hauteurs ESTIMÉES (OSM ne les donne pas).', 'Gare, lift, zones de freinage : lus dans OSM', '(roller_coaster:track) quand ils y sont,', 'sinon estimés.', 'Répondez avec les numéros : « frein au 9 ».'):
    d.text((30, y), t, fill=(110, 40, 40), font=F(19)); y += 26
d.text((W - 60, 40), 'N', fill='black', font=FB(40)); d.polygon([(W - 48, 4), (W - 68, 36), (W - 28, 36)], fill='black')
d.rectangle([W - 330, H - 70, W - 330 + 50 * sc, H - 60], fill='black'); d.text((W - 330, H - 100), '50 m', fill='black', font=F(22))
im.save(out); print('écrit', out, '%d ronds, longueur %.0f m' % (k, L))
