#!/usr/bin/env node
/* Test de la sauvegarde automatique (engine/save.js) et du bac à sable : node tools/save.js [zeus hourra oziris goudurix]
   Pour chaque site : 2 h de jeu, manœuvre de garage en cours, zone en MANU, barrière, instantané, départ vers index.html (pagehide),
   retour, comparaison, 30 min de plus ; puis alternance entre attractions, « Nouvelle partie », bac à sable. Sortie courte PASS/FAIL. */
const { chromium } = require('playwright');
const path = require('path'), root = path.resolve(__dirname, '..');
const sites = process.argv.slice(2).filter(a => !a.startsWith('-')); if (!sites.length) sites.push('zeus', 'hourra', 'oziris', 'goudurix');
const URL = (s, m) => `file://${root}/jeu.html?type=parc&lieu=asterix&el=${s}` + (m ? '&mode=' + m : '');
const INDEX = `file://${root}/index.html`;
let fails = [];
const ok = (name, c, info) => { if (!c) fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); return c; };
const snap = () => ({
  played: G.played, time: G.time, money: G.money, speed: G.speed, sat: G.sat, open: G.open, q: G.queue.length, plat: G.plat.filter(r => r).length,
  walkers: G.walkers.length, riders: G.stats.riders, wx: G.wx.type, zm: JSON.stringify(G.zm), zk: JSON.stringify(G.zk), dev: [G.dev.pos, G.dev.to, G.dev.k],
  loops: LOOPS.map(l => l.on), bars: BARS.map(b => b.open), wear: [G.wear.chain, G.wear.track, G.wear.brake].map(v => +v.toFixed(2)), gates: G.gatesOpen, res: G.resOpen,
  trains: trains.map(t => ({ s: t.s, v: t.v, st: t.st, lane: t.lane, g: t.g, ph: t.phase, n: count(t), seated: seated(t), rc: t.rc.map(v => v.toFixed(3)).join(',') + '/' + t.rcT })) });
function cmp(a, b) {
  const bad = [], eq = (k, x, y, tol) => { if (typeof x === 'number' ? Math.abs(x - y) > (tol || 0) : String(x) !== String(y)) bad.push(`${k}:${x}!=${y}`); };
  for (const k of ['speed', 'open', 'q', 'plat', 'walkers', 'riders', 'wx', 'zm', 'zk', 'gates', 'res']) eq(k, a[k], b[k]);
  eq('time', a.time, b.time, .02); eq('played', a.played, b.played, .02); eq('money', a.money, b.money, 1); eq('sat', a.sat, b.sat, .05); eq('loops', a.loops, b.loops); eq('bars', a.bars, b.bars); eq('wear', a.wear, b.wear, .02);
  eq('dev.pos', a.dev[0], b.dev[0]); eq('dev.to', a.dev[1], b.dev[1]); eq('dev.k', a.dev[2], b.dev[2], .002);
  a.trains.forEach((t, i) => { const u = b.trains[i]; eq(`T${i}.s`, t.s, u.s, .01); eq(`T${i}.v`, t.v, u.v, .001); eq(`T${i}.st`, t.st, u.st); eq(`T${i}.lane`, t.lane, u.lane);
    eq(`T${i}.g`, t.g, u.g, .01); eq(`T${i}.ph`, t.ph, u.ph); eq(`T${i}.n`, t.n, u.n); eq(`T${i}.seated`, t.seated, u.seated); eq(`T${i}.rc`, t.rc, u.rc); });
  return bad;
}
// Fait tourner le jeu : portillons au bouton (le moteur ne les actionne jamais seul), dépannage si besoin. Retourne le nombre de minutes de jeu écoulées.
const drive = (page, minutes, o = {}) => page.evaluate(([min, o]) => {
  act('speed', 0); if (!G.sandbox) G.wx.next = 1e6; const t0 = G.played; let i = 0, wxChanged = false; // jeu continu : durée mesurée en minutes de jeu cumulées (G.played), l'horloge boucle 10:00-19:00
  while ((G.played - t0 < min || (o.until && !new Function('return ' + o.until)() && G.played - t0 < min + 150)) && i++ < 90000) {
    if (!G.open && !o.closed) act('open');
    const st = trains.find(t => t.st === 'station'); // sécurités au bouton : ouvrir à l'arrivée / avant l'embarquement, verrouiller portillons fermés (vérification par les opérateurs)
    if (st && !G.resOpen && !st.rcT && ((st.phase === 'unload' && count(st)) || (st.phase === 'board' && !st.hs && !st.depReq && G.plat.some(r => r)))) act('res');
    if (G.gatesOpen && trains.some(t => t.st === 'station' && t.depReq)) act('gates');
    else if (!G.gatesOpen && trains.some(t => t.st === 'station' && t.phase === 'board' && !t.hs && !t.depReq) && G.plat.some(r => r)) act('gates');
    else if (st && st.phase === 'board' && (G.resOpen || st.rcT) && !G.gatesOpen && G.gate < .05 && (st.depReq || st.hs)) act('res');
    if (G.liftBroken) act('job', 'liftFix'); if (G.brakeFault) act('job', 'brakeFix');
    trains.forEach(t => { if (t.fault === 'lapbars') act('rearm', t.i); });
    step(.025); if (G.wx.type !== 'clear') wxChanged = true;
  }
  ui(); return { min: G.played - t0, wxChanged };
}, [minutes, o]);
const load = async (ctx, url, errors, first) => {
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !/\.game\.js$/.test((m.location() || {}).url || '')) // lieux/parc/asterix/<el>.game.js facultatif : absent = erreur de chargement attendue
  errors.push('console: ' + m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.G && window.t2zSave);
  if (first) { await page.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await page.click('[data-act=closeHelp]'); }
  return page;
};
const keySize = (page) => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('t2z.save.')).map(k => k + '=' + Math.round(localStorage[k].length / 1024) + 'K').join(' '));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const errors = [], sizes = {}, snaps2 = {};
  for (const site of sites) {
    let page = await load(ctx, URL(site, 'career'), errors, true);
    ok(site + ' fresh start', await page.evaluate(() => G.played < 1 && !/Partie reprise/.test($('log').textContent)));
    await drive(page, 120, { until: 'trains.some(t => t.st === "run" && count(t) > 0 && t.s > S_LIFT0)' });
    // manœuvre de garage en cours + zone en MANU + barrière
    const pre = await page.evaluate(() => {
      const r = { riders: G.stats.riders, q: G.queue.length };
      const z = ZONES.find(Z => Z.auto && Z.id !== 'Fin' && !/^R/.test(Z.id)) || ZONES.find(Z => Z.auto);
      act('zone', z.id + ':m'); r.zone = z.id; if (BARS.length) toggleBar(0); // barrière de file (issue #37)
      if (!devMoving()) { const p = POS_ORDER.find(p => p !== G.dev.pos && p !== 0) || POS_ORDER[0]; act('pos', p); }
      for (let i = 0; i < 400 && devMoving() && G.dev.k < .4; i++) step(.025);
      r.moving = devMoving(); r.dev = [G.dev.pos, G.dev.to, G.dev.k]; r.inLane = trains.some(t => t.st === 'garage' && t.lane >= 0);
      return r; });
    pre.run = await page.evaluate(() => trains.filter(t => t.st === 'run' && count(t) > 0).length); ok(site + ' loaded train running', pre.run > 0, pre); ok(site + ' queue>0', pre.q > 0, pre);
    await page.evaluate(() => { act('speed', 0); ui(); });
    const A = await page.evaluate(snap);
    await page.goto(INDEX);
    const prog = await page.evaluate(s => document.querySelector(`a.card[data-el=${s}] .prog`).textContent, site);
    ok(site + ' index progress', /Partie en cours/.test(prog), prog);
    sizes[site] = await keySize(page);
    page = await load(ctx, URL(site, 'career'), errors, false);
    const logT = await page.evaluate(() => $('log').textContent);
    ok(site + ' log reprise', /Partie reprise : \d\d:\d\d\./.test(logT), logT.slice(0, 120));
    ok(site + ' help hidden', await page.evaluate(() => $('mHelp').classList.contains('hidden')));
    const B = await page.evaluate(snap), bad = cmp(A, B);
    ok(site + ' state equal', !bad.length, bad.slice(0, 6));
    const r = await drive(page, 30);
    ok(site + ' +30 min', r.min >= 29.9, r);
    await page.evaluate(() => { act('speed', 0); });
    snaps2[site] = await page.evaluate(snap);
    ok(site + ' no errors', !errors.length, errors.slice(0, 3));
    console.log(`${site}: q=${pre.q} run=${pre.run} moving=${pre.moving} inLane=${pre.inLane} zone=${pre.zone} t=${A.time.toFixed(1)} bad=${bad.length}`);
    await page.close();
  }
  // alternance entre attractions : chacune garde son état
  if (sites.length > 1) {
    for (const site of sites.concat(sites[0])) {
      const page = await load(ctx, URL(site, 'career'), errors, false);
      const bad = cmp(snaps2[site], await page.evaluate(snap));
      ok('switch ' + site, !bad.length, bad.slice(0, 5)); await page.close();
    }
  }
  // Nouvelle partie : efface la sauvegarde du mode choisi et redémarre
  {
    const page = await load(ctx, URL(sites[0], 'career'), errors, false);
    await page.click('[data-act=help]'); await page.click('#bNew');
    ok('modal mNew', await page.evaluate(() => !$('mNew').classList.contains('hidden')));
    await Promise.all([page.waitForNavigation(), page.click('#bNewCareer')]);
    await page.waitForFunction(() => window.G && window.t2zSave);
    ok('new game clean', await page.evaluate(() => G.played < 2 && G.time < 602 && G.queue.length === 0 && !/Partie reprise/.test($('log').textContent) && !localStorage.getItem(t2zSave.KEY)));
    await page.close();
  }
  // Bac à sable : pas de budget, de météo ni de panne ; sauvegarde séparée
  {
    const site = sites[0];
    let page = await load(ctx, URL(site, 'sandbox'), errors, true);
    ok('sandbox header', await page.evaluate(() => $('hMode').offsetParent !== null && $('hMoneyBox').offsetParent === null));
    await page.evaluate(() => { G.wear.chain = 99; G.wear.brake = 99; G.wear.track = 99; trains.forEach(t => t.wear = 99); G.wx.next = 1; });
    const r = await drive(page, 120, { until: 'trains.some(t => t.st === "run" && count(t) > 0)' });
    const S = await page.evaluate(() => ({ money: G.money, wx: G.wx.type, lb: G.liftBroken, bf: G.brakeFault, wear: G.wear, faults: trains.filter(t => t.fault || t.hs).length, riders: G.stats.riders, costs: G.stats.costs, income: G.stats.income, bad: /Panne|Défaut|Orage|Averse|hors service/.test($('log').textContent) }));
    ok('sandbox 2h', r.min >= 119 && !r.wxChanged && S.money === 3000 && S.wx === 'clear' && !S.lb && !S.bf && !S.faults && !S.bad && S.costs === 0 && S.income === 0, [r, S]);
    await page.evaluate(() => act('speed', 0)); const A = await page.evaluate(snap);
    await page.goto(INDEX);
    page = await load(ctx, URL(site, 'sandbox'), errors, false);
    const bad = cmp(A, await page.evaluate(snap)); ok('sandbox restore', !bad.length && await page.evaluate(() => G.sandbox), bad);
    const r2 = await drive(page, 30); ok('sandbox +30', r2.min >= 29.9 && await page.evaluate(() => G.money === 3000 && G.wx.type === 'clear'));
    const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('t2z.save.parc.asterix.' + SITE.id)));
    await page.goto(INDEX); const keys2 = await page.evaluate(s => Object.keys(localStorage).filter(k => k.startsWith('t2z.save.parc.asterix.' + s)), site);
    ok('modes coexist', keys2.includes(`t2z.save.parc.asterix.${site}.sandbox`), keys2);
    sizes.sandbox = await keySize(page);
  }
  // Jeu continu : l'horloge passe 19:00 et repart à 10:00 sans rien remettre à zéro ; salaires horaires ; fin de partie à tout moment ; ancienne sauvegarde (journées) relue
  {
    const site = sites[0];
    let page = await load(ctx, URL(site, 'career'), errors, false);
    const W = await page.evaluate(() => { act('speed', 0); G.wx.next = 1e6; if (!G.open) act('open'); G.time = 1130; const a = { riders: G.stats.riders, money: G.money, q: G.queue.length, played: G.played };
      for (let i = 0; i < 2400; i++) step(.025); // 30 min de jeu : passe 19:00
      return { a, time: G.time, riders: G.stats.riders, q: G.queue.length, played: G.played, open: G.open, costs: G.stats.costs, modal: !$('mBil').classList.contains('hidden'), day: 'day' in G }; });
    ok('continuous wrap', W.time > 600 && W.time < 640 && W.riders >= W.a.riders && W.open && !W.modal && !W.day && Math.abs(W.played - W.a.played - 30) < .1, W);
    const B = await page.evaluate(() => { $('bBil').click(); const r = { vis: !$('mBil').classList.contains('hidden'), txt: $('bTable').textContent, btn: $('bBtn').textContent }; $('bBtn').click(); r.closed = $('mBil').classList.contains('hidden'); return r; });
    ok('bilan button', B.vis && /Passagers transportés/.test(B.txt) && /salaires/.test(B.txt) && B.btn === 'Reprendre' && B.closed, B);
    const O = await page.evaluate(() => { const m0 = G.money; G.money = -1990; G.wage = 0; for (let i = 0; i < 4000 && !G.over; i++) step(.025);
      return { over: G.over, vis: !$('mBil').classList.contains('hidden'), title: $('bTitle').textContent, btn: $('bBtn').textContent, open: G.open }; });
    ok('game over anytime', O.over && O.vis && O.title === 'Fin de partie' && O.btn === 'Recommencer' && !O.open, O);
    await page.evaluate(() => t2zSave.save()); ok('game over clears save', await page.evaluate(() => !localStorage.getItem(t2zSave.KEY)));
    await page.close();
    // ancienne sauvegarde : champs day / dayDone / closedMsg et fenêtre day_modal ignorés
    page = await load(ctx, URL(site, 'career'), errors, false);
    const D = await page.evaluate(() => { act('speed', 0); G.wx.next = 1e6; act('open'); for (let i = 0; i < 4000; i++) step(.025);
      const d = t2zSave.capture(); d.day = 3; d.g.day = 3; d.g.dayDone = true; d.g.closedMsg = true; d.g.time = 1140; delete d.g.played; delete d.g.wage;
      d.day_modal = ['Fin du jour 3', '<tr><td>x</td></tr>', 'msg', 'Jour suivant']; return [t2zSave.KEY, JSON.stringify(d)]; });
    await page.goto(INDEX); await page.evaluate(D => localStorage.setItem(D[0], D[1]), D); page = await load(ctx, URL(site, 'career'), errors, false);
    const L = await page.evaluate(() => { const r = { day: 'day' in G || 'dayDone' in G || 'closedMsg' in G, time: G.time, played: G.played, modal: !$('mBil').classList.contains('hidden'), log: /Partie reprise/.test($('log').textContent) };
      act('speed', 0); for (let i = 0; i < 400; i++) step(.025); r.t2 = G.time; r.err = Number.isNaN(G.money); return r; });
    ok('old save', !L.day && L.time < 601 && L.played < 1 && !L.modal && L.log && L.t2 > 604 && !L.err, L);
    await page.evaluate(() => localStorage.removeItem(t2zSave.KEY)); await page.close();
  }
  // stockage indisponible : le jeu démarre quand même
  {
    const c2 = await browser.newContext(); await c2.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
    const errs = []; const p = await c2.newPage(); p.on('pageerror', e => errs.push(String(e.message)));
    await p.goto(URL(sites[0], 'career')); await p.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p.click('[data-act=closeHelp]');
    const r = await drive(p, 5); ok('no storage', r.min >= 4.9 && !errs.length, errs.slice(0, 2)); await c2.close();
  }
  { // migration unique : ancienne clé t2z.save.<el>.<mode> -> nouvelle clé, ancienne effacée
    const p = await (await browser.newContext()).newPage();
    await p.goto(INDEX); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('t2z.save.zeus.career', '{"x":1}'); });
    await p.goto(INDEX);
    const r = await p.evaluate(() => [localStorage.getItem('t2z.save.zeus.career'), localStorage.getItem('t2z.save.parc.asterix.zeus.career')]);
    ok('migration anciennes clés', r[0] === null && r[1] === '{"x":1}', r);
  }
  await browser.close();
  console.log('sizes:', JSON.stringify(sizes));
  console.log(fails.length ? 'FAIL ' + fails.join(' | ') : 'PASS save ' + sites.join(' '));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FAIL', e); process.exit(1); });
