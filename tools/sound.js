#!/usr/bin/env node
/* Espion des sons (on ne peut pas écouter ici) : node tools/sound.js [zeus hourra oziris goudurix]
   Vérifie que les sons synthétisés (engine/state.js sfx) sont déclenchés au bon moment, sans erreur, son ACTIVÉ (contexte Web Audio réel) :
   sécurités (air à l'ouverture, barres immobiles pendant 0,5 s puis ouvertes ; crémaillère à la fermeture), freins (serrage / desserrage),
   lift (marche, cliquetis des anti-retours selon le type, arrêt). Sortie courte PASS / FAIL. */
const { chromium } = require('playwright');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sites = process.argv.slice(2).filter(a => !a.startsWith('--'));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); let fail = 0;
  for (const site of sites.length ? sites : ['zeus', 'hourra', 'oziris', 'goudurix']) {
    const p = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = [];
    p.on('pageerror', e => errs.push(String(e.message))); p.on('console', m => { if (m.type() === 'error' && !/\.game\.js$/.test((m.location() || {}).url || '')) // lieux/parc/asterix/<el>.game.js facultatif : absent = erreur de chargement attendue
  errs.push(m.text()); });
    await p.addInitScript(() => { try { for (const k of Object.keys(localStorage)) if (k.startsWith('t2z.save.')) localStorage.removeItem(k); } catch (e) {} });
    await p.goto(`file://${root}/jeu.html?type=parc&lieu=asterix&el=${site}&mode=sandbox`);
    await p.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p.click('[data-act=closeHelp]');
    const muted0 = await p.evaluate(() => sfx.muted());
    await p.click('#bMute'); // son activé : le vrai graphe Web Audio est construit et utilisé
    const r = await p.evaluate(() => {
      const o = {}, N = sfx.N, run = (sec, rend) => { for (let i = 0; i < sec / .025; i++) { step(.025); if (rend && i % 4 === 0) render(.1); } };
      act('speed', 1); G.wx.next = 1e6; act('auto');
      const t = trains.find(x => x.st === 'station');
      const a0 = N.resAir; act('res'); run(.3); o.airFirst = N.resAir > a0 && t.rc.every(v => v < .01); run(.6); o.openAfter = t.rc.some(v => v > .05);
      run(2); const c0 = N.resClose; act('res'); run(3); o.ratchet = N.resClose > c0;
      if (G.bypass) act('bypass');
      const b0 = N.brakeOn + N.brakeOff, l0 = N.liftStart, k0 = N.liftClick;
      for (let i = 0; i < 6000; i++) { if (t.phase === 'ready' || t.st === 'run') break; step(.025); }
      if (t.st === 'station') act('depart');
      for (let i = 0; i < 7000 && (N.liftStop < 1 || N.brakeOn + N.brakeOff - b0 < 2); i++) { step(.025); if (i % 8 === 0) { cam.s = .3; render(.2); } } // rendu léger (vue lointaine) : brakeState et le lift tournent dans render
      o.brakes = N.brakeOn + N.brakeOff - b0 > 1; o.liftRun = N.liftStart > l0 && N.liftStop > 0; o.clicks = N.liftClick - k0; o.anti = SITE.kind !== 'bob';
      o.N = Object.assign({}, N); o.st = t.st + '/' + t.phase + '/' + Math.round(t.s); return o;
    });
    const ok = muted0 && r.airFirst && r.openAfter && r.ratchet && r.brakes && r.liftRun && (r.anti ? r.clicks > 5 : r.clicks === 0) && !errs.length;
    if (!ok) fail++;
    console.log(`${site}: mutedByDefault=${muted0} air-before-open=${r.airFirst} open-after-0.5s=${r.openAfter} ratchet=${r.ratchet} brakes=${r.brakes} lift=${r.liftRun} clicks=${r.clicks}${r.anti ? '' : ' (bob : sans anti-retours)'} st=${r.st} N=${JSON.stringify(r.N)} errors=${errs.length} ${errs.slice(0, 2).join(' | ')} -> ${ok ? 'ok' : 'FAIL'}`);
    await p.close();
  }
  await b.close(); console.log(fail ? 'FAIL' : 'PASS'); process.exit(fail ? 1 : 0);
})();
