/* Contrôle « offpath » : aucun visiteur hors des chemins (voir docs/NOUVELLE-ATTRACTION.md §6).
   install(page) injecte l'échantillonneur dans la page de jeu ; sample() à appeler pendant les pas de simulation ; report() renvoie le bilan.
   Zones permises : chemins OSM (largeur ci-dessous), file, approche, sortie, quais (côté embarquement derrière les portillons, côté débarquement),
   porte de sortie. Interdits : la voie (gabarit) sauf montée / descente au train, l'intérieur de la gare hors quais, les autres bâtiments,
   et la zone entre voie et portillons tant que ceux-ci ne sont pas ouverts. */
const SRC = () => {
  const HW = { foot: 1.9, road: 3, queue: 1.5, app: 1.6, exit: 1.5 };
  const dseg = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1e-9; let t = ((px - a[0]) * dx + (pz - a[1]) * dz) / l; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(a[0] + dx * t - px, a[1] + dz * t - pz); };
  const dpoly = (px, pz, P) => { let m = 1e9; for (let i = 1; i < P.length; i++) { if (!P[i] || !P[i - 1]) continue; const d = dseg(px, pz, P[i - 1], P[i]); if (d < m) m = d; } return m; };
  const inPoly = (px, pz, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pz) !== (P[j][1] > pz) && px < (P[j][0] - P[i][0]) * (pz - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
  const lines = [], areas = [], blds = [], cov = []; // cov : chemins couverts OSM (f.cv : tunnel, layer<0…) — passage sous la voie ou la gare
  const add = (P, hw, q) => { if (P && P.length > 1) lines.push([P, hw, q]); };
  for (const f of OSM.feats) {
    if (f.cv) cov.push(f.p);
    if (/^highway=(footway|steps|pedestrian)$/.test(f.k)) { if (f.c && f.p.length > 3) areas.push(f); else add(f.p, HW.foot); } // zones piétonnes (avec trous) : praticables partout
    else if (/^highway=(service|unclassified|track)$/.test(f.k)) add(f.p, HW.road);
    else if (/^building=/.test(f.k) && f.k !== 'building=roof') blds.push(f.p);
  }
  for (const k in (OSM.paths || {})) add(OSM.paths[k], HW.foot);
  for (const p of SITE.paths || []) add(p, HW.foot);
  for (const s of SEGS) add(s.P, HW.queue, 1);
  for (const Lp of (typeof LANDS !== 'undefined' ? LANDS : [])) areas.push({ p: Lp, q: 1 });
  if (typeof BAREA !== 'undefined' && BAREA) areas.push({ p: BAREA, q: 1 }); // zone d'attente éditée (GAME.boardAreas, engine/garage.js) : sol du quai, praticable // paliers rectangulaires au sommet des escaliers en applique (engine/render.js)
  for (const a of SITE.approach) add(a.pts, HW.app);
  add(SITE.exit.path, HW.exit, 1); for (const t of SITE.exit.tails) add(t, HW.exit);
  add(SITE.board.via, HW.exit, 1); for (const w of (typeof WALKS !== "undefined" ? WALKS : [])) add(w, 1.1, 1);
  { const A = SITE.approach.map(a => a.pts); for (const p of A) add([p[p.length - 1], SITE.queue.entry0], HW.app); }
  const SP = SITE.plat || {}, P = Object.assign({ load: 7.9, exit: 0, back: .1, front: 1.6 }, SP), poly = SITE.stationPoly || [];
  const a = BAYS[NCARS - 1], b = BAYS[0];
  const quad = (l0, l1) => [[a.x - a.tx * (P.back + CAR / 2) + a.rx * l0, a.z - a.tz * (P.back + CAR / 2) + a.rz * l0], [b.x + b.tx * P.front + b.rx * l0, b.z + b.tz * P.front + b.rz * l0], [b.x + b.tx * P.front + b.rx * l1, b.z + b.tz * P.front + b.rz * l1], [a.x - a.tx * (P.back + CAR / 2) + a.rx * l1, a.z - a.tz * (P.back + CAR / 2) + a.rz * l1]];
  const quads = [quad(PEDGE, P.load)]; if (P.exit) quads.push(quad(-PEDGE, -P.exit)); // bord de quai : PEDGE (engine/garage.js)
  // axe de la voie (seulement dans et autour de la gare : ailleurs la voie est en hauteur au-dessus des chemins)
  const T = []; { const f = mkF(); for (let s = 0; s < L; s += 1) { frameAt(s, f); if (poly.length && (inPoly(f.p.x, f.p.z, poly) || dpoly(f.p.x, f.p.z, poly) < 2.5)) T.push([f.p.x, f.p.z]); else T.push(null); } }
  const doors = (SITE.exit.door ? [SITE.exit.door] : []).concat(SITE.board.door ? [SITE.board.door] : []);
  const inStation = (x, z) => poly.length && inPoly(x, z, poly);
  const onPlat = (x, z) => quads.some(q => inPoly(x, z, q));
  const alongBay = (x, z) => { const u = (x - b.x) * b.tx + (z - b.z) * b.tz; return u < P.front + .5 && u > -(NCARS - 1) * CAR - P.back - .5; };
  const kb = (x, z) => BAYS[Math.max(0, Math.min(NCARS - 1, Math.round(-((x - b.x) * b.tx + (z - b.z) * b.tz) / CAR)))];
  const lat = (x, z) => { const c = kb(x, z); return (x - c.x) * c.rx + (z - c.z) * c.rz; };
  const nearQ = (x, z) => { for (const [Pl, hw, q] of lines) if (q && dpoly(x, z, Pl) <= hw) return true; return false; };
  const near = (x, z) => { for (const [Pl, hw] of lines) if (dpoly(x, z, Pl) <= hw) return true; for (const A of areas) if (inPoly(x, z, A.p) && !(A.h || []).some(H => inPoly(x, z, H))) return true; return false; };
  const test = (x, z, kind) => {
    const dt = dpoly(x, z, T);
    const rail = dt < 1.05, inSt = inStation(x, z), pl = onPlat(x, z), l = lat(x, z), bay = alongBay(x, z);
    const loadSide = l > 0 && SITE.loadSide !== undefined ? 1 : 1; // (rx,rz) pointe vers le quai d'embarquement
    if ((kind === 'board' || kind === 'alight') && bay && Math.abs(l) < Math.max(1.4, PEDGE + .1)) return null; // monte / descend du train
    if (cov.some(C => dpoly(x, z, C) <= 1.2)) return null; // dans un passage couvert, sous la voie (autre niveau)
    if (rail) return 'voie';
    if (inSt && !pl && !rail && !nearQ(x, z) && !areas.some(A => A.q && inPoly(x, z, A.p))) return 'gare';
    if (bay && l > PEDGE && l < PGATE - .1 && kind === 'wait') return 'portillon';
    if (bay && l < PGATE - .1 && kind === 'board' && G.gate < .85 && Math.abs(l) > PEDGE) return 'portillon';
    if (pl || near(x, z)) return null;
    if (doors.some(d => Math.hypot(x - d[0], z - d[1]) < 1.8)) return null;
    for (const B of blds) if (inPoly(x, z, B) && !inStation(x, z)) return 'bâtiment';
    return 'hors-chemin';
  };
  return { test, lines, quads, T, near, bay: alongBay, lat };
};
const INSTALL = `(()=>{const S=(${SRC.toString()})();window.__op={S,n:0,bad:0,byKind:{},ex:[],seen:0};
 window.__opPt=(x,z,kind,tag)=>{const r=S.test(x,z,kind);__op.n++;if(r){__op.bad++;const key=tag+':'+r;__op.byKind[key]=(__op.byKind[key]||0)+1;if(__op.ex.length<400)__op.ex.push([+x.toFixed(1),+z.toFixed(1),tag,r]);}};
 window.__opSample=()=>{for(const k of G.walkers)__opPt(k.x,k.z,k.kind||'walk',k.kind||'walk');
   for(const v of G.queue)__opPt(v.x,v.z,'queue','queue-'+v.mode);
   G.plat.forEach((r,i)=>{if(r&&r.on){const p=slotPos(i);__opPt(p[0],p[2],'wait','slot');}});(G.platR||[]).forEach((r,j)=>{if(r&&r.on&&BRES[j])__opPt(BRES[j][0],BRES[j][2],'wait','reserve');});};
 // strollQ : promeneurs sur un chemin de la file (réservé aux visiteurs de la file, propriétaire, lot 5) : doit rester à 0
 window.__opStroll=()=>{const QA=SEGS.map(g=>g.P);__op.strollQ=0;const f=new Set();for(const q of strollers){if(f.has(q.f))continue;f.add(q.f);const P=q.f.P,C=q.f.C,o={x:0,y:0,z:0};
   for(let d=0;d<=q.f.len;d+=1)for(const sd of [-1.1,0,1.1]){pathPos(P,C,d,o,sd);if(sd)__opPt(o.x,o.z,'stroll','stroller');else if(QA.some(A=>dPl(o.x,o.z,A)<.6))__op.strollQ++;}}};
})()`;
module.exports = { INSTALL };
