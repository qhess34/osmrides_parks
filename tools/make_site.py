#!/usr/bin/env python3
"""Fabrique les données d'une attraction à partir d'un extrait OpenStreetMap (.osm).

Usage : python3 tools/make_site.py extrait.osm tools/specs/<site>.json lieux/parc/asterix/<el>.data.js [apercu.png]

Le fichier de spécification (JSON) décrit :
  origin        [lat, lon] du point (0, 0) ; x vers l'est, z vers le sud, en mètres
  bbox          [x0, x1, z0, z1] zone conservée autour de l'attraction
  track_ways    identifiants des tronçons de voie (assemblés automatiquement en circuit fermé)
  start_way     tronçon de départ (gare) et "start_reversed" si son sens OSM est inverse au sens de marche
  profile       [[s, h] ou [s, h, "lin"], ...] hauteur estimée en fonction de la distance au sol
  level, flat   hauteur de la gare et [fin, début] de la zone forcée à ce niveau (début et fin de circuit)
  tags          {repère: s} repères le long de la voie (st0, st1, lift0, lift1, brk, blk1…)
  keep          [[s0, s1], ...] zones non lissées (droites)
  paths, polys  {nom: identifiant OSM} chemins et polygones exportés à part (file, sortie, gare…)
  drop_ways     identifiants à ne pas mettre dans le décor
  inversions    [{type:'corkscrew', s0, s1, n, r} | {type:'loop', s0, s1, len, h, w, e, at, side}] : vrilles (dévers) et loopings insérés (linéaire ESTIMÉ) -> OSM.inversions (s moteur)
  (tunnels)     calculés : tronçons du circuit tagués tunnel=yes (ou covered=yes et layer<0) -> OSM.tunnels=[[s0,s1(,'roof')],…] (plusieurs possibles ; 'roof' = galerie couverte au-dessus du sol, layer>0)
  tunnels_extra [[s0, s1], …] tunnels absents d'OSM (s au sol, ESTIMÉS), ajoutés à OSM.tunnels
  tunnels_ignore [way, …] tronçons du circuit dont le tag tunnel OSM est ignoré (réponse du propriétaire qui contredit OSM : le dire, poser la question)
  roles, osm_brakes  repères lus dans OSM (roller_coaster:track) : voir « repères lus dans OSM » plus bas ; « tags » force un repère (null le retire)
  inversions    … {type:'loop', osm:true, s0, s1, h} : looping dessiné dans OSM (aller, retour au sommet, aller), hauteur seule estimée
  (décor)       zones piétonnes (aires et multipolygones, anneaux assemblés, trous) -> feats highway=pedestrian fermés ; chemins à l'intérieur : f.in=1 ;
                chemins couverts (tunnel, covered, indoor, layer<0) : f.cv=1 ; entrées / sorties (nœuds entrance=*) -> OSM.doors=[[x,z,type,nom]]
                passerelles (highway + bridge=*) : f.br=layer (f.w = width OSM) ; chemins à width OSM -> OSM.widths=[[w, pts]…] ; escaliers highway=steps -> OSM.stairs=[{p, up(1|-1|0, incline), cv, lv, w}] ; niveau souterrain (layer / level < 0) : f.lv, lv
                (w = width OSM de l'escalier, sinon du chemin raccordé à une extrémité ; absent : largeur décidée par le moteur) ; rochers natural=rock|stone|bare_rock (bare_rock devient natural=rock) : feats (moteur)
  queue_paths   [clé de paths, …] chemins de file (SITE.queue.ways) dont surface / colour sont lus -> OSM.attrs (issue #46, voir plus bas)
  phys          {roll, drag} frottements utilisés pour le contrôle de vitesse affiché
  base, skip    mode « décor seul » : base = fichier de données existant dont la voie (cps), la file et la gare sont gardées (Tonnerre 2 Zeus) ; skip = clés non exportées
  (barrières)   nœuds barrier=swing_gate | gate | lift_gate -> OSM.barriers=[[x, z, ref, hinge, tx, tz, bout]] : barrières de file du jeu (engine/queue.js, à la place des barrières posées par le moteur)
  (traçabilité) chaque objet garde son id OSM (w123 / n456 / r789) et sa version : champs id, v (feats, stairs), fin de tableau (doors, barriers, pois, widths), OSM.src (track, others, trees, paths, polys) — docs/OSM-GUIDE.md §7
  (multipolygones) anneaux assemblés à partir de plusieurs tronçons (ex. rocher natural=rock en relation)
  (issue #33)   roller_coaster:track = waiting | brake_run | moving : zones de freinage où un train peut attendre ; rôle selon la position (sans osm_brakes) :
                dernière zone avant la gare (ou avant le tronçon moving) = frein final, précédentes = freins de bloc, après : moving = transfert, autre = avant gare ;
                tronçon roller_coaster=track non relié au circuit (sans rôle, hors spec) -> OSM.deco : voie décorative immobile ;
                roller_coaster:station = load | unload (non officiel) : gares -> OSM.stations ; quais déduits de la gare (un de chaque côté, moteur) ;
                bâtiment nommé « Salle de contrôle » / « control room » -> OSM.ctl (pupitre par défaut) ; « ele » des nœuds de voie -> profil (ele_ground, ele_keep) et OSM.ele ;
                roller_coaster:element -> OSM.elements (s moteur, pour l'éditeur)
OpenStreetMap donne rarement les hauteurs : sans « ele », le profil est une estimation, vérifiée ici aux croisements.
"""
import sys, json, math, collections, xml.etree.ElementTree as ET

osm, spec_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
png = sys.argv[4] if len(sys.argv) > 4 else None
spec = json.load(open(spec_path))
root = ET.parse(osm).getroot()
lat0, lon0 = spec['origin']
NODE = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in root.iter('node')}
NTAG = {n.get('id'): {t.get('k'): t.get('v') for t in n.findall('tag')} for n in root.iter('node') if n.find('tag') is not None}
WAY = {w.get('id'): w for w in root.iter('way')}
tags = lambda e: {t.get('k'): t.get('v') for t in e.findall('tag')}
# traçabilité (lot 2) : origine de chaque objet importé = id OSM préfixé (w123 tronçon, n456 nœud, r789 relation) + version de l'objet dans l'extrait.
#   champs « id » et « v » (objets) ou fin de tableau (positionnels) ; structures sans place pour un champ : OSM.src (voir docs/OSM-GUIDE.md §6).
ver = lambda e: int(e.get('version') or 0)
WSRC = lambda m: ['w' + str(m), ver(WAY[str(m)])]            # tronçon (way) de l'extrait
NSRC = lambda i: ['n' + str(i), ver(NODEL[str(i)])]          # nœud
NODEL = {n.get('id'): n for n in root.iter('node')}
nds = lambda w: [x.get('ref') for x in w.findall('nd') if x.get('ref') in NODE]
kx = 111320 * math.cos(math.radians(lat0))
def xy(i, r=2):
    la, lo = NODE[i]
    return (round((lo - lon0) * kx, r), round(-(la - lat0) * 111320, r))
dist = lambda a, b: math.hypot(b[0] - a[0], b[1] - a[1])

# mode « décor seul » (spec « base » : fichier de données existant dont on garde la voie, ex. Tonnerre 2 Zeus, tracé d'une ancienne version de l'outil) :
#   seuls le décor, les chemins, les portes, les largeurs, les barrières et les arbres sont relus dans OSM ; cps, file et gare du fichier de base sont conservés.
BASE = None
if spec.get('base'):
    _t = open(spec['base']).read(); BASE = json.loads(_t[_t.index('const OSM=') + 10:].rstrip().rstrip(';'))
TUNV = ('yes', 'true', '1', 'building_passage', 'culvert')  # tunnel=true existe dans OSM (ex. voie sous un rocher)
if BASE is not None:
    track = [str(i) for i in spec.get('track_ways', [])]; cps = BASE['cps']; tunnels = BASE.get('tunnels', []); inversions = BASE.get('inversions', [])
else:
    # ── circuit : assemblage des tronçons
    track = [str(i) for i in spec['track_ways']]
    ends = collections.defaultdict(list)
    for m in track:
        n = nds(WAY[m]); ends[n[0]].append(m); ends[n[-1]].append(m)
    cur = str(spec['start_way']); seq = nds(WAY[cur])
    if spec.get('start_reversed'): seq = seq[::-1]
    used = {cur}; chain = list(seq); last = seq[-1]; ewy = [cur] * (len(seq) - 1)  # ewy[i] : tronçon OSM de l'arête chain[i] → chain[i+1]
    while True:
        nx = [m for m in ends[last] if m not in used]
        if not nx: break
        m = nx[0]; used.add(m); n = nds(WAY[m])
        if n[0] != last: n = n[::-1]
        chain += n[1:]; last = n[-1]; ewy += [m] * (len(n) - 1)
    assert len(used) == len(track), 'tronçons non reliés : %s' % [m for m in track if m not in used]
    assert chain[0] == chain[-1], 'le circuit ne se referme pas'
    chain_ways = [m for k, m in enumerate(ewy) if k == 0 or ewy[k - 1] != m]  # tronçons du circuit dans l'ordre de marche (traçabilité, OSM.src.track)
    raw = [xy(i) for i in chain[:-1]]
    L0 = sum(dist(raw[i], raw[(i + 1) % len(raw)]) for i in range(len(raw)))
    # tronçons du circuit en tunnel (OSM tunnel=yes, ou covered=yes avec layer<0) : intervalles [s0, s1] le long de la voie
    def is_tunnel(t):
        try: lay = float(t.get('layer', 0))
        except ValueError: lay = 0
        return t.get('tunnel') in TUNV or (t.get('covered') == 'yes' and lay < 0)
    tun_edges = {}  # arête → 'roof' si le tunnel est au-dessus du sol (layer > 0 : galerie couverte), sinon ''
    TUN_IGN = {str(m) for m in spec.get('tunnels_ignore', [])}
    for m in track:
        if m not in TUN_IGN and is_tunnel(tags(WAY[m])):
            nn = nds(WAY[m]); lay_ = tags(WAY[m]).get('layer', '0')
            k = 'roof' if lay_.lstrip('-').replace('.', '').isdigit() and float(lay_) > 0 else ''
            for e in zip(nn, nn[1:]): tun_edges[frozenset(e)] = k
    cumr = [0.0]
    for i in range(len(raw)): cumr.append(cumr[-1] + dist(raw[i], raw[(i + 1) % len(raw)]))
    tunnels = []
    for i in range(len(raw)):
        e = frozenset((chain[i], chain[i + 1]))
        if e in tun_edges:
            if tunnels and abs(tunnels[-1][1] - cumr[i]) < 1e-6: tunnels[-1][1] = cumr[i + 1]
            else: tunnels.append([cumr[i], cumr[i + 1]] + ([tun_edges[e]] if tun_edges[e] else []))
    tunnels_ground = tunnels + [list(t) for t in spec.get('tunnels_extra', [])]  # tunnels_extra : tunnels absents d'OSM (s au sol, ESTIMÉS)
    tunnels_ground.sort()

    # ── repères lus dans OSM (roller_coaster:track des tronçons du circuit), facultatif : la spec peut forcer chaque repère (« tags »)
    #   station → st0/st1 ; lift_hill → lift0/lift1 ; brake_run | waiting | block_brake | storage | transfer → zones de freinage, nommées dans l'ordre
    #   par spec « osm_brakes » (ex. ["blk1", "blk2", "brk", "tr", "pre"] ; "skip" = ignorée) ; par défaut rôle selon la position (auto_names) :
    #   la dernière zone avant la gare (ou avant le tronçon mobile) = frein final (brk), les précédentes = freins de bloc blk1…
    #   Repères produits : blkN = point d'arrêt (fin de zone) + bzN = début ; brk = début du frein final + fin = fin ; tr0/tr1 = rail de transfert (pont) ; pre0/pre1 = frein avant gare.
    #   « roles » {way: rôle} force le rôle d'un tronçon (station, lift, brake, run).
    #   Règle du propriétaire (issue #33, 20/11) : waiting, brake_run et moving sont TOUS des zones de freinage où un train peut attendre ;
    #   le frein final est la dernière zone avant la gare (pas forcément le brake_run).
    ROLE_OF = {'station': 'station', 'lift_hill': 'lift', 'brake_run': 'brake', 'waiting': 'brake', 'moving': 'brake', 'block_brake': 'brake', 'storage': 'brake', 'transfer': 'brake'}
    def role(m):
        r = spec.get('roles', {}).get(str(m))
        return r if r else ROLE_OF.get(tags(WAY[m]).get('roller_coaster:track'), 'run')
    osm_iv = []  # [rôle, s0, s1, way] au sol
    for i in range(len(raw)):
        r = role(ewy[i])
        if osm_iv and osm_iv[-1][3] == ewy[i] and abs(osm_iv[-1][2] - cumr[i]) < 1e-6: osm_iv[-1][2] = cumr[i + 1]
        else: osm_iv.append([r, cumr[i], cumr[i + 1], ewy[i]])
    auto = {}
    stv = [v for v in osm_iv if v[0] == 'station']
    # gares (issue #33, propriétaire 20/11) : groupes de tronçons « station » consécutifs ; deux gares (embarquement / débarquement) se distinguent par
    # l'attribut NON OFFICIEL roller_coaster:station=load|unload. Les quais sont déduits de la gare : un de chaque côté du rail (moteur, SITE.plat) ;
    # railway=platform n'est plus utilisé. La gare qui commence à s = 0 (start_way) donne st0/st1 ; les gares sont exportées dans OSM.stations.
    st_groups = []
    for v in stv:
        r_ = tags(WAY[v[3]]).get('roller_coaster:station', '')
        if st_groups and abs(st_groups[-1][2] - v[1]) < 1e-6 and (not r_ or r_ == st_groups[-1][0] or not st_groups[-1][0]): st_groups[-1][2] = v[2]; st_groups[-1][0] = st_groups[-1][0] or r_; st_groups[-1][3].append(v[3])
        else: st_groups.append([r_, v[1], v[2], [v[3]]])
    if len(st_groups) > 1: print('  gares :', [(g[0] or '?', round(g[1], 1), round(g[2], 1)) for g in st_groups], '(seule la gare à s = 0 est exploitée par le moteur)')
    if stv and stv[0][1] < 1 and st_groups and st_groups[0][0] == 'unload': print('  ATTENTION : la gare de départ est taguée unload (débarquement)')
    if stv and stv[0][1] < 1:  # gare : tronçons « station » consécutifs (une gare découpée dans OSM reste une seule gare)
        e_ = stv[0][2]
        for v in stv[1:]:
            if abs(v[1] - e_) < 1e-6: e_ = v[2]
        auto['st0'] = 0; auto['st1'] = round(e_, 1)
        # gare prolongée par des tronçons d'un autre type OSM (« moving » d'OzIris, rôle station forcé par « roles ») : arrêt de la tête du train
        # à la fin du dernier tronçon vraiment tagué station (repère « stp », lu par engine/core.js stationStop)
        tv = [v for v in stv if tags(WAY[v[3]]).get('roller_coaster:track') == 'station' and v[2] <= e_ + 1e-6]
        if tv and tv[-1][2] < e_ - .5: auto['stp'] = round(tv[-1][2], 1)
    lfv = [v for v in osm_iv if v[0] == 'lift']
    if lfv: auto['lift0'] = round(lfv[0][1], 1); auto['lift1'] = round(lfv[-1][2], 1)
    bkv = [v for v in osm_iv if v[0] == 'brake' and (not lfv or v[1] >= lfv[0][1])]
    def auto_names(bkv):  # sans « osm_brakes » : rôle déduit de la POSITION (propriétaire 20/11, issue #33 : à Goudurix le train s'arrête au brake_run PUIS
        #   va en zone waiting avant la gare ; brake_run n'est donc pas forcément le frein final). Zones de freinage après le lift, dans l'ordre de marche :
        #   frein final (brk) = la dernière avant la gare, ou avant le premier tronçon mobile (moving : rail du pont / de l'aiguillage) s'il y en a un ;
        #   les précédentes = freins de bloc blk1… ; après lui, vers la gare : moving = rail de transfert (tr), autre = frein avant gare (pre).
        #   Le type OSM (waiting, brake_run, block_brake…) ne décide plus du rôle.
        tg_ = [tags(WAY[v[3]]).get('roller_coaster:track') for v in bkv]
        if not bkv: return []
        mv = next((k for k, t in enumerate(tg_) if t == 'moving'), len(bkv))
        f = mv - 1 if mv > 0 else max([k for k, t in enumerate(tg_) if t != 'moving'] or [len(bkv) - 1])
        return ['blk%d' % (k + 1) for k in range(f)] + ['brk'] + [('tr' if t == 'moving' else 'pre') for t in tg_[f + 1:]]
    names = spec.get('osm_brakes') or auto_names(bkv)
    if len(names) != len(bkv): sys.exit('osm_brakes : %d noms pour %d zones de freinage OSM %s' % (len(names), len(bkv), [(round(v[1]), round(v[2]), v[3]) for v in bkv]))
    for nm, v in zip(names, bkv):
        a, b = round(v[1], 1), round(v[2], 1)
        if nm.startswith('blk'): auto[nm] = b; auto['bz' + nm[3:]] = a
        elif nm == 'brk': auto['brk'] = a; auto['fin'] = b
        elif nm in ('tr', 'pre'): auto[nm + '0'] = a; auto[nm + '1'] = b
        elif nm != 'skip': sys.exit('osm_brakes : nom inconnu ' + nm)
    T = dict(auto); T.update({k: v for k, v in spec.get('tags', {}).items() if v is not None})
    for k, v in spec.get('tags', {}).items():
        if v is None: T.pop(k, None)
    for v in osm_iv:
        if v[0] != 'run': print('  OSM %-7s s=%6.1f..%6.1f (%4.1f m) way %s' % (v[0], v[1], v[2], v[2] - v[1], v[3]))
    print('repères (OSM puis spec) :', {k: T[k] for k in sorted(T, key=lambda q: T[q])}, '; forcés par la spec :', sorted(k for k in spec.get('tags', {}) if auto.get(k) != spec['tags'][k]))

    def resample(pts, step):
        P = pts + [pts[0]]; cum = [0]
        for i in range(len(P) - 1): cum.append(cum[-1] + dist(P[i], P[i + 1]))
        n = round(cum[-1] / step); o = []; j = 0
        for k in range(n):
            s = k * cum[-1] / n
            while cum[j + 1] < s: j += 1
            f = (s - cum[j]) / ((cum[j + 1] - cum[j]) or 1)
            o.append((P[j][0] + (P[j + 1][0] - P[j][0]) * f, P[j][1] + (P[j + 1][1] - P[j][1]) * f))
        return o
    def smooth(a, w, passes):
        for _ in range(passes):
            a = [tuple(sum(a[(i + k) % len(a)][c] * (w + 1 - abs(k)) for k in range(-w, w + 1)) / ((w + 1) ** 2) for c in range(len(a[0]))) for i in range(len(a))]
        return a
    pts = resample(raw, 1.0); n = len(pts); S = lambda i: i * L0 / n
    sw, sp = spec.get('smooth', [3, 2]); sm = smooth(pts, sw, sp)
    keep = lambda s: any(a <= s <= b for a, b in spec.get('keep', []))
    pts = smooth([pts[i] if keep(S(i)) else sm[i] for i in range(n)], 1, 1)

    # ── profil en hauteur
    H = spec['profile']; level = spec['level']
    # hauteurs relevées (issue #5 / #33, propriétaire 20/11) : attribut « ele » (altitude au-dessus du niveau de la mer, OSM) sur les nœuds de la voie.
    #   Hauteur au-dessus du sol = ele − sol ; sol = spec « ele_ground » (altitude du sol en m), sinon altitude des nœuds de la gare − « level ».
    #   Chaque nœud à « ele » devient un point du profil ; les points de la spec à moins de « ele_keep » m (défaut 10) sont retirés ; le reste du profil est ESTIMÉ.
    def fnum(x):
        try: return float(str(x).replace(',', '.').replace('m', '').strip())
        except ValueError: return None
    ELE = [(cumr[i], fnum(NTAG.get(chain[i], {}).get('ele'))) for i in range(len(raw))]
    ELE = [(a, e) for a, e in ELE if e is not None]
    ele_pts = []
    if ELE:
        g0 = spec.get('ele_ground')
        if g0 is None:
            st_e = [e for a, e in ELE if a <= auto.get('st1', 0) + .5]
            g0 = sorted(st_e)[len(st_e) // 2] - level if st_e else None
        if g0 is None: print('  ATTENTION : %d nœuds de voie ont « ele » mais aucune référence du sol (spec ele_ground, ou ele sur un nœud de la gare) : ignorés' % len(ELE))
        else:
            ele_pts = [[round(a, 1), round(e - g0, 2)] for a, e in ELE]
            kp = spec.get('ele_keep', 10)
            H = sorted([q for q in H if all(abs(q[0] - a) > kp for a, _ in ele_pts)] + [list(q) for q in ele_pts], key=lambda q: q[0])
            print('  hauteurs relevées (ele, sol %.2f m) : %d points %s ; le reste du profil est ESTIMÉ' % (g0, len(ele_pts), ele_pts))
    else: print('  aucune hauteur relevée (ele) sur la voie : profil ESTIMÉ (spec)')
    def hraw(s):
        for a, b in zip(H, H[1:]):
            if a[0] <= s <= b[0]:
                f = (s - a[0]) / (b[0] - a[0])
                if len(a) < 3: f = (1 - math.cos(math.pi * f)) / 2
                return a[1] + (b[1] - a[1]) * f
        return level
    hs = [h[0] for h in smooth([(hraw(S(i)),) for i in range(n)], 3, 2)]
    fa, fb = spec['flat']
    for i in range(n):
        if S(i) < fa or S(i) > fb: hs[i] = level

    # ── inversions (spec "inversions", facultatif) : [{type:'corkscrew', s0, s1, n, r}, {type:'loop', s0, s1, len, h, w, e, at, side}] (s au sol)
    #   corkscrew (vrille) : la voie tourne de 360° × n autour de son axe (dévers = rotation, cps[3]) ; déport hélicoïdal de r m (la voie tourne autour de la ligne de cœur)
    #   loop (looping) : le tracé OSM au sol ne contient pas la boucle (vue de dessus, elle se réduit à une ligne) : entre s0 et s1, la voie est remplacée par une boucle
    #   ESTIMÉE (linéaire ajouté) : longueur totale len le long de la voie, hauteur h, ellipse vue de dessus (largeur w, entrée et sortie décalées de e) ; dévers par transport
    #   parallèle (voie tête en bas au sommet). Les points de contrôle y sont posés tous les mètres.
    rows = [[pts[i][0], hs[i], pts[i][1], 0.0, S(i)] for i in range(n)]  # [x, h, z, dévers°, s au sol]
    def tan2(i):
        a = pts[(i - 1) % n]; b = pts[(i + 1) % n]; l = dist(a, b) or 1
        return ((b[0] - a[0]) / l, (b[1] - a[1]) / l)
    def nrm3(v): l = math.sqrt(sum(c * c for c in v)) or 1; return tuple(c / l for c in v)
    def cross3(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
    dot3 = lambda a, b: sum(x * y for x, y in zip(a, b))
    INV = sorted(spec.get('inversions', []), key=lambda v: -v['s0'])  # de la fin vers le début : l'insertion d'une boucle ne décale pas les éléments suivants à traiter
    inv_ground = []
    for iv in INV:
        s0, s1 = iv['s0'], iv['s1']
        if iv['type'] == 'corkscrew':
            nn, r = iv.get('n', 1), iv.get('r', 1.2)
            for i, w in enumerate(rows):
                if s0 <= w[4] <= s1:
                    u = (w[4] - s0) / (s1 - s0); b = 2 * math.pi * nn * (u - math.sin(2 * math.pi * u) / (2 * math.pi)) * (1 if iv.get('dir', 1) > 0 else -1)
                    tx, tz = tan2(i)  # R0 = T × Y = (-tz, 0, tx) : la voie tourne autour de la ligne de cœur, r m au-dessus d'elle
                    w[0] += r * math.sin(b) * -tz; w[2] += r * math.sin(b) * tx; w[1] += r * (1 - math.cos(b)); w[3] = math.degrees(b)
            inv_ground.append((iv, s0, s1))
        elif iv['type'] == 'loop' and iv.get('osm'):
            # looping DESSINÉ dans OSM (vue de dessus : la voie avance, revient en arrière au sommet, puis repart) : on garde le tracé au sol d'OSM et on
            # n'estime que la hauteur. Axe = corde s0→s1 ; c1 = point le plus en avant (montée verticale), c2 = point le plus en arrière ensuite (descente) ;
            # R = demi-recul ; la boucle va de e1 (R avant c1) à e2 (R après c2), paramétrée par θ ∈ [0, 2π] (x = R sin θ le long de l'axe, h = hb + H/2 (1 − cos θ)).
            I = [i for i, w in enumerate(rows) if s0 <= w[4] <= s1]; A, B = rows[I[0]], rows[I[-1]]
            ax, az = B[0] - A[0], B[2] - A[2]; al = math.hypot(ax, az); ax, az = ax / al, az / al
            pr = lambda w: (w[0] - A[0]) * ax + (w[2] - A[2]) * az
            c1 = I[0]
            for i in I:  # premier rebroussement : maximum local suivi d'un recul de plus de 3 m
                if pr(rows[i]) > pr(rows[c1]): c1 = i
                elif pr(rows[c1]) - pr(rows[i]) > 3: break
            c2 = c1
            for i in I:
                if i <= c1: continue
                if pr(rows[i]) < pr(rows[c2]): c2 = i
                elif pr(rows[i]) - pr(rows[c2]) > 3: break
            if c2 == c1: sys.exit('looping OSM s=%g..%g : aucun rebroussement dans le tracé' % (s0, s1))
            R = (pr(rows[c1]) - pr(rows[c2])) / 2; xc = pr(rows[c2]) + R
            e1 = max(i for i in I if i < c1 and pr(rows[i]) <= xc); e2 = min(i for i in I if i > c2 and pr(rows[i]) >= xc)
            def leg(a, b):  # points (x, z, s au sol, abscisse le long de l'axe) d'une branche, polyligne d'OSM
                return [(rows[i][0], rows[i][2], rows[i][4], pr(rows[i]) - xc) for i in range(a, b + 1)]
            def at(L_, x):  # point de la branche dont l'abscisse vaut x (interpolation, branche monotone)
                for p, q in zip(L_, L_[1:]):
                    if (p[3] - x) * (q[3] - x) <= 0 and p[3] != q[3]:
                        f = (x - p[3]) / (q[3] - p[3]); return [p[c] + (q[c] - p[c]) * f for c in range(3)]
                return list(min(L_, key=lambda p: abs(p[3] - x))[:3])
            legs = [leg(e1, c1), leg(c1, c2), leg(c2, e2)]; Hh = iv.get('h', 20); hb0, hb1 = rows[e1][1], rows[e2][1]; K = iv.get('k', 96); new = []
            for k in range(K + 1):
                th = 2 * math.pi * k / K; x = R * math.sin(th); g = legs[0] if th <= math.pi / 2 else legs[1] if th <= 3 * math.pi / 2 else legs[2]
                px, pz, sg = at(g, x); hb = hb0 + (hb1 - hb0) * k / K
                new.append([px, hb + Hh / 2 * (1 - math.cos(th)), pz, 0.0, sg])
            for k in range(1, K):  # abscisses au sol strictement croissantes
                new[k][4] = max(new[k][4], new[k - 1][4] + 1e-3)
            Q = rows[e1 - 1:e1] + new + rows[e2 + 1:e2 + 2]; Rf = None; bank = []
            for k in range(1, len(Q) - 1):
                T3 = nrm3((Q[k + 1][0] - Q[k - 1][0], Q[k + 1][1] - Q[k - 1][1], Q[k + 1][2] - Q[k - 1][2])); R0 = nrm3((-T3[2], 0, T3[0])); U0 = cross3(R0, T3)
                Rf = R0 if Rf is None else nrm3(tuple(Rf[c] - dot3(Rf, T3) * T3[c] for c in range(3)))
                U = cross3(Rf, T3); b = math.degrees(math.atan2(-dot3(U, R0), dot3(U, U0)))
                if bank: b += 360 * round((bank[-1] - b) / 360)
                bank.append(b)
            rest = bank[-1] - 360 * round(bank[-1] / 360)
            for k, w in enumerate(new): w[3] = bank[k] - rest * k / (len(new) - 1)
            rows[e1:e2 + 1] = new
            C3 = sum(math.dist((Q[k][0], Q[k][1], Q[k][2]), (Q[k + 1][0], Q[k + 1][1], Q[k + 1][2])) for k in range(len(Q) - 1))
            print('looping OSM s=%.1f..%.1f (au sol) : recul %.1f m (R %.1f m), hauteur %.1f m, %.1f m de voie, dévers max %.0f°' % (rows[e1][4], new[-1][4], 2 * R, R, Hh, C3, max(abs(x) for x in bank)))
            inv_ground.append((iv, new[0][4], new[-1][4]))
        elif iv['type'] == 'loop':
            i0 = next(i for i, w in enumerate(rows) if w[4] >= s0); i1 = max(i for i, w in enumerate(rows) if w[4] <= s1)
            A, B = rows[i0], rows[i1]; Lg = math.hypot(B[0] - A[0], B[2] - A[2]); tx, tz = (B[0] - A[0]) / Lg, (B[2] - A[2]) / Lg
            sd = iv.get('side', 1); nx, nz = -tz * sd, tx * sd
            dc = Lg * iv.get('at', .5); hc = A[1] + (B[1] - A[1]) * dc / Lg; bh, W, e = iv.get('h', 20) / 2, iv.get('w', 6), iv.get('e', 3)
            ease = lambda u: (1 - math.cos(math.pi * u)) / 2
            def curve(a, k):  # (d le long de la corde A→B, décalage latéral, hauteur) : entrée, boucle (θ de 0 à 2π), sortie
                P = [(dc * j / k, -e / 2 * ease(j / k), A[1] + (hc - A[1]) * j / k) for j in range(k + 1)]
                for j in range(1, k + 1):
                    th = 2 * math.pi * j / k; P.append((dc + a * math.sin(th), -e / 2 + e * th / (2 * math.pi) + W * math.sin(th / 2) ** 2, hc + bh * (1 - math.cos(th))))
                P += [(dc + (Lg - dc) * j / k, e / 2 * (1 - ease(j / k)), hc + (B[1] - hc) * j / k) for j in range(1, k + 1)]
                C = [0.0]
                for j in range(1, len(P)): C.append(C[-1] + math.dist(P[j], P[j - 1]))
                return P, C
            target = iv.get('len', 4 * Lg); lo, hi = .5, 80.0
            for _ in range(40):
                a = (lo + hi) / 2
                if curve(a, 300)[1][-1] < target: lo = a
                else: hi = a
            P, C = curve(a, 3000); m = max(2, round(C[-1])); new = []; j = 0
            for k in range(m + 1):
                c = C[-1] * k / m
                while j < len(C) - 2 and C[j + 1] < c: j += 1
                f = (c - C[j]) / ((C[j + 1] - C[j]) or 1); d, lat, h = [P[j][q] + (P[j + 1][q] - P[j][q]) * f for q in range(3)]
                new.append([A[0] + tx * d + nx * lat, h, A[2] + tz * d + nz * lat, 0.0, A[4] + (B[4] - A[4]) * k / m])
            Q = rows[i0 - 1:i0] + new + rows[i1 + 1:i1 + 2]; R = None; bank = []
            for k in range(1, len(Q) - 1):  # dévers = angle entre le repère transporté (sans torsion) et le repère « naïf » du moteur (T × vertical)
                T3 = nrm3((Q[k + 1][0] - Q[k - 1][0], Q[k + 1][1] - Q[k - 1][1], Q[k + 1][2] - Q[k - 1][2])); R0 = nrm3((-T3[2], 0, T3[0])); U0 = cross3(R0, T3)
                R = R0 if R is None else nrm3(tuple(R[c] - dot3(R, T3) * T3[c] for c in range(3)))
                U = cross3(R, T3); b = math.degrees(math.atan2(-dot3(U, R0), dot3(U, U0)))
                if bank: b += 360 * round((bank[-1] - b) / 360)
                bank.append(b)
            rest = bank[-1] - 360 * round(bank[-1] / 360)  # torsion résiduelle (déport latéral) répartie sur l'élément : la voie ressort droite
            for k, w in enumerate(new): w[3] = bank[k] - rest * k / (len(new) - 1)
            rows[i0:i1 + 1] = new
            print('looping s=%g..%g : corde %.1f m -> %.1f m le long de la voie (demi-longueur %.1f m, hauteur %.1f m, largeur vue de dessus %.1f m), dévers max %.0f°' % (s0, s1, Lg, C[-1], a, 2 * bh, W + e / 2, max(abs(x) for x in bank)))
            inv_ground.append((iv, A[4], B[4]))
    nr = len(rows); SG = [w[4] for w in rows]; P2 = [(w[0], w[2]) for w in rows]; HS = [w[1] for w in rows]

    def inter(a, b, c, e):
        d1 = (b[0] - a[0], b[1] - a[1]); d2 = (e[0] - c[0], e[1] - c[1]); den = d1[0] * d2[1] - d1[1] * d2[0]
        if abs(den) < 1e-9: return False
        u = ((c[0] - a[0]) * d2[1] - (c[1] - a[1]) * d2[0]) / den; v = ((c[0] - a[0]) * d1[1] - (c[1] - a[1]) * d1[0]) / den
        return 0 <= u <= 1 and 0 <= v <= 1
    print('longueur au sol %.1f m, %d points' % (L0, n))
    for i in range(nr):
        for j in range(i + 8, nr):
            if i == 0 and j > nr - 8: continue
            if inter(P2[i], P2[(i + 1) % nr], P2[j], P2[(j + 1) % nr]):
                print('  croisement s=%d (h %.1f) x s=%d (h %.1f)  écart %.1f m' % (SG[i], HS[i], SG[j], HS[j], abs(HS[i] - HS[j])))
    ph = spec.get('phys', {}); roll = ph.get('roll', .098); drag = ph.get('drag', .0006)
    v = 5.5; mn = (99, 0); mx = 0; s3 = 0
    for i in range(nr):
        ds = math.hypot(dist(P2[i], P2[(i + 1) % nr]), HS[(i + 1) % nr] - HS[i]); s3 += ds
        if T['lift1'] + 12 < SG[i] < T['brk']:
            a = -9.81 * (HS[(i + 1) % nr] - HS[i]) / ds - roll - drag * v * v
            v = math.sqrt(max(1, v * v + 2 * a * ds))
            if v < mn[0]: mn = (round(v, 1), round(SG[i]))
            mx = max(mx, v)
    print('longueur 3D %.1f m ; vitesse mini %s m/s à s=%s ; maxi %.1f m/s (%d km/h) ; aux freins %.1f m/s' % (s3, mn[0], mn[1], mx, mx * 3.6, v))
    step = spec.get('cp_step', 3)
    inInv = lambda s: any(a - 6 <= s <= b + 6 for _, a, b in inv_ground)
    CR = []; i = 0  # rangs des points de contrôle : tous les `step` points, chaque point dans les inversions
    while i < nr: CR.append(i); i += 1 if inInv(SG[i]) else step
    if 'stp' in T:  # arrêt en gare : son propre point de contrôle (pas d'arrondi au point précédent, 3 m plus tôt)
        ti = round(T['stp'] * n / L0) if not inv_ground else min(range(nr), key=lambda r: abs(SG[r] - T['stp']))
        if ti not in CR: CR = sorted(CR + [ti])
    tagr = {}
    for k, s in T.items():
        ti = round(s * n / L0) if not inv_ground else min(range(nr), key=lambda r: abs(SG[r] - s))
        tagr.setdefault(max(c for c in CR if c <= ti), []).append(k)
    cps = []
    for i in CR:
        w = rows[i]; row = [round(w[0], 2), round(w[1], 2), round(w[2], 2), round(w[3], 1) if w[3] else 0]
        row += tagr.get(i, [])
        cps.append(row)

    # tunnels : conversion de s (au sol) en abscisse du moteur (longueur 3D le long de la spline Catmull-Rom des points de contrôle, comme engine/core.js)
    def engine_s(sg):
        m = len(cps); SUB = 24
        if inv_ground:  # rang fractionnaire du point de s au sol sg, puis indice fractionnaire du point de contrôle
            r = next((q for q in range(1, nr) if SG[q] >= sg), nr - 1); rf = r - 1 + (sg - SG[r - 1]) / ((SG[r] - SG[r - 1]) or 1)
            jj = max(q for q in range(len(CR)) if CR[q] <= rf); nx_ = CR[jj + 1] if jj + 1 < len(CR) else nr; fi = jj + (rf - CR[jj]) / (nx_ - CR[jj])
        else: fi = sg * n / L0 / step
        def pt(i, t):
            P = [cps[(i + d) % m] for d in (-1, 0, 1, 2)]; t2 = t * t; t3 = t2 * t
            return [.5 * ((2 * P[1][k]) + (-P[0][k] + P[2][k]) * t + (2 * P[0][k] - 5 * P[1][k] + 4 * P[2][k] - P[3][k]) * t2 + (-P[0][k] + 3 * P[1][k] - 3 * P[2][k] + P[3][k]) * t3) for k in range(3)]
        i0 = int(fi); acc = 0.0; prev = None
        for i in range(i0 + 1):
            for j in range(SUB):
                q = pt(i, j / SUB)
                if prev: acc += math.dist(q, prev)
                prev = q
                if i == i0 and j == int(round((fi - i0) * SUB)) % SUB: return acc
        return acc
    tunnels = [[round(engine_s(t[0]), 1), round(engine_s(t[1]), 1)] + t[2:] for t in tunnels_ground]
    print('tunnels : s au sol', tunnels_ground, '-> s moteur', tunnels)
    inversions = [{'type': iv['type'], 's0': round(engine_s(a), 1), 's1': round(engine_s(b), 1), 'n': iv.get('n', 1)} for iv, a, b in sorted(inv_ground, key=lambda q: q[1])]
    if inversions: print('inversions (s moteur) :', inversions)
    # figures nommées dans OSM (roller_coaster:element = loop, corkscrew, butterfly, batwing… ; tag en usage, non documenté) : gardées pour l'éditeur
    #   (réglage ultérieur du tangage et du roulis, propriétaire 20/11) ; le moteur ne les lit pas encore. OSM.elements=[{type, s0, s1, id}] (s moteur).
    el_iv = []
    for i in range(len(raw)):
        ty = tags(WAY[ewy[i]]).get('roller_coaster:element')
        if not ty: continue
        if el_iv and el_iv[-1][0] == ty and abs(el_iv[-1][2] - cumr[i]) < 1e-6: el_iv[-1][2] = cumr[i + 1]; el_iv[-1][3] += [] if ewy[i] in el_iv[-1][3] else [ewy[i]]
        else: el_iv.append([ty, cumr[i], cumr[i + 1], [ewy[i]]])
    elements = [{'type': ty, 's0': round(engine_s(a), 1), 's1': round(engine_s(b), 1), 'id': ['w' + m for m in ws]} for ty, a, b, ws in el_iv]
    if elements: print('figures OSM (roller_coaster:element, s moteur) :', [(e['type'], e['s0'], e['s1']) for e in elements])
    stations = [{'role': g[0] or 'load', 's0': round(engine_s(g[1]), 1), 's1': round(engine_s(g[2]), 1), 'id': ['w' + m for m in g[3]]} for g in st_groups] if len(st_groups) > 1 or any(g[0] for g in st_groups) else []
    ele_out = [[round(engine_s(a), 1), h] for a, h in ele_pts]

# ── décor
X0, X1, Z0, Z1 = spec['bbox']; inb = lambda p: X0 <= p[0] <= X1 and Z0 <= p[1] <= Z1
def chain_pts(v):  # chemin de la spec : un tronçon OSM, ou une liste de tronçons mis bout à bout dans l'ordre (chacun retourné au besoin)
    if not isinstance(v, list): return [list(xy(i, 1)) for i in nds(WAY[str(v)])]
    out = []
    for w in v:
        n = nds(WAY[str(w)])
        if out and n[-1] == out[-1]: n = n[::-1]
        elif out and n[0] != out[-1] and n[-1] != out[-1]:
            if len(out) == len(nds(WAY[str(v[0])])) and n[0] in (out[0],) or n[-1] == out[0]: out = out[::-1]; n = n if n[0] == out[-1] else n[::-1]
            else: sys.exit('paths : %s ne touche pas le tronçon précédent' % w)
        out += n[1:] if out else n
    return [list(xy(i, 1)) for i in out]
SPATHS = {str(i) for v in spec.get('paths', {}).values() for i in (v if isinstance(v, list) else [v])}
drop = set(track) | {str(i) for i in spec.get('drop_ways', [])} | {str(i) for i in spec.get('paths', {}).values()}
# voies décoratives (issue #33, propriétaire 20/11, Zeus w1353118255) : tronçon roller_coaster=track NON RELIÉ au circuit = décor, dessiné comme une voie
#   immobile (aucun train, aucune zone) -> OSM.deco=[{p:[[x,z]…], id, v}]. Règle générique : composante connexe (nœuds partagés) de tronçons roller_coaster=track
#   sans boucle (pas un autre circuit), sans tronçon du circuit, de la spec (paths, drop_ways) ni tronçon à rôle (roller_coaster:track maintenance, storage, moving…,
#   qui reste une voie de garage), plus proche de CE circuit que de tout autre circuit et à moins de DECO_D m de lui (ESTIMÉ). Hauteur : celle de la gare (moteur).
DECO_D = 25
deco = []; deco_src = []; DECO = set()
if BASE is None:
    RCW = {m: nds(w) for m, w in WAY.items() if tags(w).get('roller_coaster') == 'track' and len(nds(w)) > 1}
    par_ = {m: m for m in RCW}
    def root_(a):
        while par_[a] != a: par_[a] = par_[par_[a]]; a = par_[a]
        return a
    byn_ = collections.defaultdict(list)
    for m, n_ in RCW.items():
        for x_ in n_: byn_[x_].append(m)
    for ms_ in byn_.values():
        for m in ms_[1:]: par_[root_(m)] = root_(ms_[0])
    comps_ = collections.defaultdict(list)
    for m in RCW: comps_[root_(m)].append(m)
    cyc_ = lambda ms: sum(len(RCW[m]) - 1 for m in ms) >= len({x_ for m in ms for x_ in RCW[m]})
    others_c = [[xy(x_) for m in ms for x_ in RCW[m]] for ms in comps_.values() if cyc_(ms) and not set(ms) & set(track)]
    dmin_ = lambda P, Q: min(dist(a, b) for a in P for b in Q[::2] or Q)
    for ms in comps_.values():
        if cyc_(ms) or set(ms) & (drop | SPATHS) or any(tags(WAY[m]).get('roller_coaster:track', 'track') != 'track' for m in ms): continue
        P = [xy(x_) for m in ms for x_ in RCW[m]]; d_ = dmin_(P, raw)
        if d_ < DECO_D and all(d_ < dmin_(P, Q) for Q in others_c):
            for m in sorted(ms):
                deco.append({'p': [list(xy(x_, 1)) for x_ in RCW[m]], 'id': 'w' + m, 'v': ver(WAY[m])}); DECO.add(m)
    if deco: print('voies décoratives (hors circuit, immobiles) :', sorted(DECO))
drop |= DECO
KEYS = ('building', 'highway', 'natural', 'landuse', 'leisure', 'water', 'waterway', 'barrier', 'amenity', 'tourism', 'man_made', 'railway')
feats = []; others = []; others_src = []
def area(p): return sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p))) / 2
def inside(pt, P):
    c = False; j = len(P) - 1
    for i in range(len(P)):
        if (P[i][1] > pt[1]) != (P[j][1] > pt[1]) and pt[0] < (P[j][0] - P[i][0]) * (pt[1] - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]: c = not c
        j = i
    return c
# zones piétonnes (highway=pedestrian + area=yes, area:highway=*, place=square, multipolygones highway=pedestrian) : surfaces praticables partout
isped = lambda t: (t.get('highway') == 'pedestrian' and (t.get('area') == 'yes' or t.get('type') == 'multipolygon')) or 'area:highway' in t or t.get('place') == 'square'
def lay(t):
    try: return float(t.get('layer', 0))
    except ValueError: return 0
def lvl(t):  # niveau d'un chemin : le plus bas de layer et level OSM (level « -1;0 » : -1) ; 0 si absent
    v = 0
    for k in ('layer', 'level'):
        for x in str(t.get(k, '')).replace(',', ';').split(';'):
            try: v = min(v, float(x))
            except ValueError: pass
    return v
def bheight(t):  # hauteur d'un bâtiment en m : height OSM, sinon building:levels × 3 m ; None si absente (moteur : 7 m ESTIMÉ)
    for k, m in (('height', 1), ('building:levels', 3)):
        try: v = float(t.get(k, '').replace(',', '.').replace('m', '').strip()) * m
        except ValueError: continue
        if 0 < v < 200: return round(v, 2)
    return None
def wnum(t):  # largeur OSM (width) en m, None si absente ou illisible
    try: v = float(t.get('width', '').replace(',', '.').replace('m', '').strip()); return v if 0.3 < v < 20 else None
    except ValueError: return None
# chemin couvert (sous un bâtiment, un auvent, en souterrain) : dessiné sous le toit, qui s'efface au zoom (moteur)
iscov = lambda t: t.get('tunnel') in TUNV or t.get('covered') == 'yes' or t.get('indoor') in ('yes', 'corridor') or lay(t) < 0
def add(t, p, closed, holes=None, src=None):
    kind = 'highway=pedestrian' if isped(t) else next((k + '=' + t[k] for k in KEYS if k in t), None)
    if kind == 'natural=bare_rock': kind = 'natural=rock'  # décision du propriétaire 19/11 : bare_rock est un rocher (relief, tunnels dessous), y compris en multipolygone avec trous
    if kind and kind != 'landuse=commercial' and any(inb(q) for q in p):
        f = {'k': kind, 'n': t.get('name'), 'c': 1 if closed else 0, 'p': p}
        if src: f['id'], f['v'] = src
        if kind.startswith('highway=') and not closed and iscov(t): f['cv'] = 1
        if kind.startswith('highway=') and not closed and lvl(t) < 0: f['lv'] = lvl(t)  # niveau souterrain (-1, -2…) : caché dans l'emprise de la gare tant qu'elle est affichée (moteur)
        if kind.startswith('building') and bheight(t): f['bh'] = bheight(t)  # hauteur du bâtiment (voie qui le survole : bâtiment dessiné sous la voie, moteur)
        if kind.startswith('highway=') and not closed and t.get('bridge') not in (None, 'no') and not iscov(t): f['br'] = max(1, int(lay(t))); f.update({'w': wnum(t)} if wnum(t) else {})  # passerelle piétonne : dessinée au-dessus de la voie si elle la franchit (moteur)
        if closed and holes:  # anneaux intérieurs (multipolygone) : lac dans une place, îlot…, orientés à l'opposé de l'anneau extérieur (remplissage « nonzero » du canevas)
            h = [q if area(q) * area(p) < 0 else q[::-1] for q in holes if len(q) > 3 and inside(q[0], p)]
            if h: f['h'] = h
        feats.append(f)
for wid, w in WAY.items():
    t = tags(w); n_ = nds(w)
    if not t or not n_: continue
    p = [list(xy(i, 1)) for i in n_]
    if t.get('roller_coaster'):
        if BASE is None and wid not in track and wid not in drop and any(inb(q) for q in p): others.append(p); others_src.append(WSRC(wid))  # drop_ways / paths : tronçons exportés à part (ex. voie de garage), pas dessinés comme voie voisine
        continue
    if wid in drop and not (wid in SPATHS and t.get('highway') and (iscov(t) or t.get('bridge') not in (None, 'no'))): continue  # chemin de la spec couvert ou en passerelle : gardé dans le décor (f.cv, f.br)  # chemin de la spec couvert : gardé dans le décor (f.cv) pour effacer le toit qui le recouvre
    add(t, p, n_[0] == n_[-1], src=WSRC(wid))
def rings_of(ids):  # anneaux fermés assemblés à partir des tronçons d'un multipolygone
    segs = [nds(WAY[m]) for m in ids if m in WAY and len(nds(WAY[m])) > 1]; out = []
    while segs:
        cur = segs.pop(0)
        while cur[0] != cur[-1]:
            for k, sg in enumerate(segs):
                if sg[0] == cur[-1]: cur = cur + sg[1:]; segs.pop(k); break
                if sg[-1] == cur[-1]: cur = cur + sg[::-1][1:]; segs.pop(k); break
                if sg[-1] == cur[0]: cur = sg[:-1] + cur; segs.pop(k); break
                if sg[0] == cur[0]: cur = sg[::-1][:-1] + cur; segs.pop(k); break
            else: break
        if cur[0] == cur[-1] and len(cur) > 3: out.append([list(xy(i, 1)) for i in cur])
    return out
for r in root.iter('relation'):
    t = tags(r); RS = ['r' + r.get('id'), ver(r)]
    if t.get('type') == 'multipolygon' and isped(t):
        mem = [(m.get('ref'), m.get('role')) for m in r.findall('member') if m.get('type') == 'way']
        inner = rings_of([m for m, ro in mem if ro == 'inner'])
        for ring in rings_of([m for m, ro in mem if ro != 'inner']): add(t, ring, True, inner, src=RS)
    elif t.get('type') == 'multipolygon':  # anneaux extérieurs assemblés à partir de leurs tronçons (ex. rocher fait de plusieurs ways) ; tronçons non refermables : lignes
        mem = [(m.get('ref'), m.get('role')) for m in r.findall('member') if m.get('type') == 'way' and m.get('ref') in WAY]
        holes = rings_of([m for m, ro in mem if ro == 'inner'])
        outs = [m for m, ro in mem if ro != 'inner']; rings = rings_of(outs)
        for ring in rings: add(t, ring, True, holes, src=RS)
        used_ = {tuple(q) for ring in rings for q in ring}
        for m in outs:
            n_ = nds(WAY[m])
            if n_ and n_[0] != n_[-1] and not all(tuple(xy(i, 1)) in used_ for i in n_): add(t, [list(xy(i, 1)) for i in n_], False, holes, src=RS)
# chemins à l'intérieur d'une zone piétonne : fondus dans la zone (non dessinés, f.in = 1 ; les promeneurs peuvent encore les suivre)
PED = [f for f in feats if f['k'] == 'highway=pedestrian' and f['c']]
def in_ped(q): return any(inside(q, f['p']) and not any(inside(q, h) for h in f.get('h', [])) for f in PED)
nin = 0
for f in feats:
    if f['k'] in ('highway=footway', 'highway=path', 'highway=steps') and not f['c'] and not f.get('cv') and sum(in_ped(q) for q in f['p']) >= .8 * len(f['p']): f['in'] = 1; nin += 1
print('zones piétonnes : %d ; chemins fondus dedans : %d ; chemins couverts : %d' % (len(PED), nin, sum(1 for f in feats if f.get('cv'))))
NODE_WAYS_ALL = collections.defaultdict(list)
for w in WAY.values():
    if tags(w).get('highway'):
        for i in nds(w): NODE_WAYS_ALL[i].append(w)
doors = [[*xy(i, 1), t['entrance'], t.get('name'), *NSRC(i)] for i, t in NTAG.items() if 'entrance' in t and inb(xy(i))]
# barrières de file (nœuds barrier=swing_gate | gate | lift_gate posés sur un chemin) -> OSM.barriers=[[x, z, ref, hinge, tx, tz, bout]] :
#   ref = barrières liées (même ref : bougent ensemble), hinge = swing_gate:hinge (left / right vu dans le sens du chemin, '' inconnu),
#   (tx, tz) = direction du chemin au nœud (sens de dessin OSM), bout = 1 si le nœud termine un chemin (barrière de bifurcation).
BARK = ('swing_gate', 'gate', 'lift_gate')
barriers = []
for i, t in NTAG.items():
    if t.get('barrier') not in BARK or not inb(xy(i)): continue
    tx = tz = 0.0; end = 0
    for w in NODE_WAYS_ALL.get(i, []):
        n_ = nds(w); k = n_.index(i); a, b = xy(n_[max(0, k - 1)], 2), xy(n_[min(len(n_) - 1, k + 1)], 2); l = dist(a, b) or 1
        if not tx and not tz: tx, tz = round((b[0] - a[0]) / l, 3), round((b[1] - a[1]) / l, 3)
        if k in (0, len(n_) - 1): end = 1
    barriers.append([*xy(i, 1), t.get('ref', ''), t.get('swing_gate:hinge', ''), tx, tz, end, *NSRC(i)])  # [7] = id du nœud, [8] = version
# escaliers (highway=steps), y compris ceux de la file et de la sortie : [[x,z]…], sens de montée (incline up = dans le sens du tronçon : 1, down : -1, inconnu : 0), couvert
steps = []
NODE_WAYS = collections.defaultdict(list)
for wid, w in WAY.items():
    if tags(w).get('highway') and w is not None:
        for i in (nds(w)[:1] + nds(w)[-1:]): NODE_WAYS[i].append(w)
        for i in nds(w)[1:-1]: NODE_WAYS[i].append(w)
for wid, w in WAY.items():
    t = tags(w); n_ = nds(w)
    if t.get('highway') != 'steps' or len(n_) < 2: continue
    p = [list(xy(i, 1)) for i in n_]
    if not any(inb(q) for q in p): continue
    inc = t.get('incline', ''); up = 1 if inc in ('up', 'yes') or inc.endswith('%') and not inc.startswith('-') else -1 if inc in ('down',) or inc.startswith('-') else 0
    wd = wnum(t) or min([wnum(tags(o)) for i in (n_[0], n_[-1]) for o in NODE_WAYS[i] if o is not w and wnum(tags(o))] or [0]) or None  # largeur : escalier, sinon chemin raccordé
    steps.append({'p': p, 'up': up, **({'cv': 1} if iscov(t) else {}), **({'lv': lvl(t)} if lvl(t) < 0 else {}), **({'w': wd} if wd else {}), 'id': 'w' + wid, 'v': ver(w)})
print('escaliers : %d ; passerelles : %d ; rochers : %d' % (len(steps), sum(1 for f in feats if f.get('br')), sum(1 for f in feats if f['k'] in ('natural=rock', 'natural=stone') and f['c'])))
# chemins à largeur OSM (highway non fermé avec width=*) : [w, [[x,z]…]] — le moteur dessine la file à cette largeur là où elle les suit (engine/render.js QWP)
widths = []
for wid, w in WAY.items():
    t = tags(w); n_ = nds(w)
    if t.get('highway') and wnum(t) and len(n_) > 1 and n_[0] != n_[-1]:
        p = [list(xy(i, 1)) for i in n_]
        if any(inb(q) for q in p): widths.append([wnum(t), p, *WSRC(wid)])
print('chemins à largeur OSM : %d' % len(widths))
res = {'cps': cps, **({'widths': widths} if widths else {}), **({'stairs': steps} if steps else {}), **({'doors': doors} if doors else {}), **({'barriers': barriers} if barriers else {}), **({'tunnels': tunnels} if tunnels else {}), **({'inversions': inversions} if inversions else {}), 'feats': feats, 'others': others,
       'paths': {k: chain_pts(v) for k, v in spec.get('paths', {}).items()},
       'polys': {k: [list(xy(i, 1)) for i in nds(WAY[str(v)])] for k, v in spec.get('polys', {}).items()},
       'trees': [list(xy(i, 1)) for i, t in NTAG.items() if t.get('natural') == 'tree' and inb(xy(i))],
       'pois': [[list(xy(i, 1)), t.get('name'), *NSRC(i)] for i, t in NTAG.items() if t.get('name') and inb(xy(i))]}
if deco: res['deco'] = deco  # voies décoratives immobiles (id, v dans chaque objet)
# OSM.src : origine des objets qui n'ont pas de place pour un champ (tableaux de points, dictionnaires lus par clé) ; mêmes indices que la structure décrite
SRC = {'track': [WSRC(m) for m in (chain_ways if BASE is None else track)]}
if others_src: SRC['others'] = others_src                                                    # même ordre que OSM.others
if res['paths']: SRC['paths'] = {k: [WSRC(m) for m in (v if isinstance(v, list) else [v])] for k, v in spec['paths'].items()}  # tronçons de chaque chemin de la spec
if res['polys']: SRC['polys'] = {k: [WSRC(v)] for k, v in spec['polys'].items()}
SRC['trees'] = [NSRC(i) for i, t in NTAG.items() if t.get('natural') == 'tree' and inb(xy(i))]  # même ordre que OSM.trees
res['src'] = SRC
# salle de contrôle (issue #33, propriétaire 20/11) : bâtiment (way fermé) nommé « Salle de contrôle » / « control room » (casse et accents libres) dans la zone :
#   position par défaut du pupitre (le moteur la prend si GAME.controlRooms est absent ; l'éditeur la surcharge). Rectangle d'aire minimale du contour ;
#   orientation : vitre (côté +z local du pupitre, engine/render.js drawBooth) tournée vers le point de voie le plus proche. OSM.ctl=[{x, z, angle (degrés), w, d, name, id, v}]
import re, unicodedata
CTLRX = re.compile(r'salle\s*de\s*contr[oô]le|control\s*room', re.I)
def mrect(P):
    best = None
    for k in range(len(P) - 1):
        ex, ez = P[k + 1][0] - P[k][0], P[k + 1][1] - P[k][1]; l = math.hypot(ex, ez)
        if l < 1e-6: continue
        ux, uz = ex / l, ez / l; a_ = [q[0] * ux + q[1] * uz for q in P]; b_ = [-q[0] * uz + q[1] * ux for q in P]
        A_ = (max(a_) - min(a_)) * (max(b_) - min(b_))
        if best is None or A_ < best[0]:
            ca, cb = (max(a_) + min(a_)) / 2, (max(b_) + min(b_)) / 2
            best = (A_, ca * ux - cb * uz, ca * uz + cb * ux, math.atan2(uz, ux), max(a_) - min(a_), max(b_) - min(b_))
    return best
ctl = []
for wid, w in WAY.items():
    t = tags(w); n_ = nds(w)
    if 'building' not in t or len(n_) < 4 or n_[0] != n_[-1] or not CTLRX.search(unicodedata.normalize('NFC', t.get('name', ''))): continue
    P = [xy(i) for i in n_]
    if not any(inb(q) for q in P): continue
    _, cx, cz, th, a_, b_ = mrect(P)
    tp = min(cps, key=lambda c: (c[0] - cx) ** 2 + (c[2] - cz) ** 2) if cps else None
    dx, dz = (tp[0] - cx, tp[2] - cz) if tp else (0.0, 1.0)
    cand = [(th + k * math.pi / 2, a_ if k % 2 == 0 else b_, b_ if k % 2 == 0 else a_) for k in range(4)]
    t_, ww, dd = max(cand, key=lambda c: -math.sin(c[0]) * dx + math.cos(c[0]) * dz)
    ang = (math.degrees(t_) + 180) % 360 - 180
    ctl.append({'x': round(cx, 2), 'z': round(cz, 2), 'angle': round(ang, 1), 'w': round(ww, 2), 'd': round(dd, 2), 'name': t.get('name'), 'id': 'w' + wid, 'v': ver(w)})
if ctl: res['ctl'] = ctl; print('salle de contrôle OSM :', ctl)
if BASE is None:
    if elements: res['elements'] = elements
    if stations: res['stations'] = stations
    if ele_out: res['ele'] = ele_out
# OSM.attrs (issue #46, D12) : attributs OSM qui servent de valeur par défaut aux réglages de l'éditeur (GAME.look, couleur de la voie) et que l'éditeur peut renvoyer vers OSM.
#   Liste d'objets {role, id, v, l (m), t:{tag brut…}, h:{colour normalisée #rrggbb}} ; roles : queue (chemins de file de la spec « queue_paths » : surface, colour), plat (polygone de sol
#   area:highway=footway + covered=yes dans la gare : surface, colour), rail (barrier=fence|handrail|wall le long d'une allée de file : barrier, material), roof (bâtiment de la gare :
#   roof:colour), track (tronçon de voie : colour). Chemins de file, bâtiment de la gare et tronçons de voie sont exportés même sans tag (t = {} : l'éditeur peut leur en proposer) ; garde-corps seulement avec barrier + material (ou wall). Le moteur n'en tire qu'une valeur par défaut.
NCOL = {'black': '#000000', 'white': '#ffffff', 'gray': '#808080', 'grey': '#808080', 'red': '#ff0000', 'maroon': '#800000', 'brown': '#a52a2a', 'orange': '#ffa500', 'yellow': '#ffff00', 'green': '#008000', 'blue': '#0000ff', 'darkgray': '#a9a9a9', 'lightgray': '#d3d3d3', 'silver': '#c0c0c0', 'beige': '#f5f5dc', 'tan': '#d2b48c'}
def hexcol(v):  # colour OSM (#rgb, #rrggbb ou nom CSS courant) -> #rrggbb, None si illisible
    v = (v or '').strip().lower()
    if re.fullmatch(r'#[0-9a-f]{6}', v): return v
    if re.fullmatch(r'#[0-9a-f]{3}', v): return '#' + ''.join(c * 2 for c in v[1:])
    return NCOL.get(v)
def attr_of(role, wid, keys, force=False):  # force : exporté même sans tag (l'éditeur peut alors en proposer un à cet objet)
    t = tags(WAY[str(wid)]); got = {k: t[k] for k in keys if k in t}
    if not got and not force: return None
    pp = [xy(i) for i in nds(WAY[str(wid)])]
    o = {'role': role, 'id': 'w' + str(wid), 'v': ver(WAY[str(wid)]), 'l': round(sum(math.hypot(pp[k + 1][0] - pp[k][0], pp[k + 1][1] - pp[k][1]) for k in range(len(pp) - 1)), 1), 't': got}  # l : longueur en m (le moteur prend la valeur dominante par longueur)
    h = {k: hexcol(got[k]) for k in got if k in ('colour', 'roof:colour') and hexcol(got[k])}
    if h: o['h'] = h
    if role == 'queue': o['p'] = [[round(q[0], 1), round(q[1], 1)] for q in pp]  # tracé du chemin (m, repère du moteur) : le moteur y rattache chaque tronçon de file dessiné, pour un sol par chemin (GAME.look.ways, issue #45)
    return o
attrs = []
QPW = [m for k in spec.get('queue_paths', []) for m in (spec['paths'][k] if isinstance(spec['paths'][k], list) else [spec['paths'][k]])]
for m in QPW:
    if tags(WAY[str(m)]).get('highway') and tags(WAY[str(m)]).get('highway') != 'steps':
        attrs.append(attr_of('queue', m, ('surface', 'colour'), True))
stp = [xy(i) for i in nds(WAY[str(spec['polys']['station'])])] if spec.get('polys', {}).get('station') else None
if stp:
    attrs.append(attr_of('roof', spec['polys']['station'], ('roof:colour',), True))
    for wid, w in WAY.items():
        t = tags(w); n_ = nds(w)
        if t.get('area:highway') == 'footway' and t.get('covered') == 'yes' and len(n_) > 3 and n_[0] == n_[-1]:
            P_ = [xy(i) for i in n_]
            if inside((sum(q[0] for q in P_) / len(P_), sum(q[1] for q in P_) / len(P_)), stp):
                a = attr_of('plat', wid, ('surface', 'colour')); attrs.append(a or {'role': 'plat', 'id': 'w' + wid, 'v': ver(w), 't': {}})
QP = [[xy(i) for i in nds(WAY[str(m)])] for m in QPW]
def dseg(q, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]; l2 = dx * dx + dz * dz
    u = 0 if l2 == 0 else max(0, min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dz) / l2))
    return math.hypot(q[0] - a[0] - u * dx, q[1] - a[1] - u * dz)
def near_queue(q): return any(dseg(q, P_[k], P_[k + 1]) < 2.0 for P_ in QP for k in range(len(P_) - 1))
for wid, w in WAY.items():  # garde-corps le long des allées de file : tous les sommets à moins de 2 m (ESTIMÉ) d'un chemin de file
    t = tags(w); n_ = nds(w)
    if t.get('barrier') in ('fence', 'handrail', 'wall') and n_ and QP and all(near_queue(xy(i)) for i in n_):
        a = attr_of('rail', wid, ('barrier', 'material'))
        if a and ('material' in a['t'] or a['t']['barrier'] == 'wall'): attrs.append(a)
for m in (chain_ways if BASE is None else []):
    attrs.append(attr_of('track', m, ('colour',), True))
if attrs: res['attrs'] = attrs
print('OSM.attrs :', dict(collections.Counter(a['role'] for a in attrs)) or 'aucun')
for k in spec.get('skip', []): res.pop(k, None)  # clés non exportées (spec « skip »), tous modes
if BASE is not None:  # décor seul : voie, file et gare du fichier de base, décor relu dans OSM
    res = dict(BASE, **{k: v for k, v in res.items() if k not in ('cps', 'tunnels', 'inversions', 'others') and k not in spec.get('skip', [])})
    if not spec.get('paths'): res.pop('paths', None)
    if not spec.get('polys'): res.pop('polys', None)
open(out, 'w').write('/* Données © contributeurs OpenStreetMap (ODbL) — tracé au sol et alentours. Hauteurs estimées (sauf OSM.ele, relevées). Généré par tools/make_site.py. */\nconst OSM=' + json.dumps(res, separators=(',', ':'), ensure_ascii=False) + ';\n')
print('écrit', out, '-', len(feats), 'éléments de décor,', len(others), 'autres voies')

if png and BASE is None:
    from PIL import Image, ImageDraw
    sc = spec.get('png_scale', 5); im = Image.new('RGB', (int((X1 - X0) * sc), int((Z1 - Z0) * sc)), (112, 150, 92)); dr = ImageDraw.Draw(im)
    P = lambda p: ((p[0] - X0) * sc, (p[1] - Z0) * sc)
    col = {'building': (170, 92, 72), 'landuse=forest': (44, 92, 52), 'natural=wood': (44, 92, 52), 'landuse=grass': (146, 190, 112), 'natural=water': (72, 120, 196), 'waterway': (72, 120, 196), 'highway': (226, 206, 160), 'highway=service': (150, 150, 150)}
    for o in ('landuse', 'natural', 'leisure', 'waterway', 'highway', 'building'):
        for f in feats:
            if not f['k'].startswith(o): continue
            c = col.get(f['k']) or col.get(f['k'].split('=')[0]) or (200, 80, 200); pp = [P(p) for p in f['p']]
            if f['c'] and not f['k'].startswith('highway') and len(pp) > 2: dr.polygon(pp, fill=c)
            else: dr.line(pp, fill=c, width=3)
    for o in others: dr.line([P(p) for p in o], fill=(90, 90, 110), width=2)
    for k, p in res['paths'].items(): dr.line([P(q) for q in p], fill=(255, 0, 255), width=2); dr.text(P(p[0]), k, fill=(255, 255, 0))
    for k, p in res['polys'].items(): dr.line([P(q) for q in p], fill=(255, 255, 255), width=2)
    for i in range(nr):
        h = HS[i]; c = (int(min(255, 40 + h * 7)), int(max(0, 200 - h * 6)), 40)
        dr.line([P(P2[i]), P(P2[(i + 1) % nr])], fill=c, width=4)
        if i % 25 == 0: x, y = P(P2[i]); dr.ellipse([x - 3, y - 3, x + 3, y + 3], fill='black'); dr.text((x + 5, y - 12), '%d|%.0f' % (SG[i], h), fill='black')
    im.save(png); print('aperçu', png)
