#!/usr/bin/env node
/* Test mobile : node tools/mobile.js [zeus hourra] [--shots=DIR] [--montage=fichier.jpg]
   iPhone 13 (portrait 390x844 et 360x640, paysage 844x390) en tactile réel (CDP Input.dispatchTouchEvent) :
   0 erreur de page, pas de défilement horizontal, onglets Carte / Pupitre / Journal, boutons du pupitre au doigt (>= 44 px),
   un doigt = déplacement, deux doigts = zoom, toucher sur barrière de file et sur un numéro du synoptique,
   plein écran (repli CSS, API absente) avec tiroir du pupitre, rotation ; plan.html : plein écran, déplacement, zoom. */
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
const root = path.resolve(__dirname, '..');
const sites = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!sites.length) sites.push('zeus', 'hourra');
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').slice(k.length + 3);
const shotDir = arg('shots'), montage = arg('montage');
if (shotDir) fs.mkdirSync(shotDir, { recursive: true });
const IP = devices['iPhone 13'];
const VP = {
  portrait: { ...IP, viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 } },
  small: { ...IP, viewport: { width: 360, height: 640 }, screen: { width: 360, height: 640 } },
  landscape: { ...IP, viewport: { width: 844, height: 390 }, screen: { width: 844, height: 390 } },
};
let fails = 0; const shots = [];
const ok = (name, v, extra) => { if (!v) fails++; console.log((v ? '  ok   ' : '  FAIL ') + name + (extra ? ' ' + extra : '')); return v; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(browser, vp, url, noFs) {
  const ctx = await browser.newContext(vp), page = await ctx.newPage(), errors = [];
  if (noFs) await page.addInitScript(() => { for (const k of ['requestFullscreen', 'webkitRequestFullscreen']) try { Object.defineProperty(Element.prototype, k, { value: undefined, configurable: true }); } catch (e) {} });
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !/\.game\.js$/.test((m.location() || {}).url || '')) // lieux/parc/asterix/<el>.game.js facultatif : absent = erreur de chargement attendue
  errors.push('console: ' + m.text()); });
  await page.goto(url);
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, errors, cdp };
}
const touch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i })) });
async function drag(cdp, from, to, n = 8) { await touch(cdp, 'touchStart', [from]); for (let i = 1; i <= n; i++) { await touch(cdp, 'touchMove', [[from[0] + (to[0] - from[0]) * i / n, from[1] + (to[1] - from[1]) * i / n]]); await sleep(16); } await touch(cdp, 'touchEnd', []); }
async function pinch(cdp, c, d0, d1, n = 8) { const P = d => [[c[0] - d / 2, c[1]], [c[0] + d / 2, c[1]]]; await touch(cdp, 'touchStart', P(d0)); for (let i = 1; i <= n; i++) { await touch(cdp, 'touchMove', P(d0 + (d1 - d0) * i / n)); await sleep(16); } await touch(cdp, 'touchEnd', []); }
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
const rectOf = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { x: r.x, y: r.y, w: r.width, h: r.height, vis: cs.visibility !== 'hidden' && cs.display !== 'none' }; }, sel);
const inView = async (page, sel) => { const r = await rectOf(page, sel); const v = await page.evaluate(() => [innerWidth, innerHeight]); return !!r && r.vis && r.x >= -1 && r.y >= -1 && r.x + r.w <= v[0] + 1 && r.y + r.h <= v[1] + 1 && r.w > 40 && r.h > 40; };
const shot = async (page, name) => { if (!shotDir) return; const f = path.join(shotDir, name + '.png'); await page.screenshot({ path: f }); shots.push(f); };
const frames = (page, n = 6) => page.evaluate(n => { for (let i = 0; i < n; i++) render(.05); }, n);
const smallTargets = (page, sel) => page.evaluate(s => [...document.querySelectorAll(s)].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && Math.min(r.width, r.height) < 43.5; }).map(b => (b.id || b.textContent.trim().slice(0, 12)) + ':' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)), sel);

async function game(browser, site, mode) {
  const label = `${site} ${mode}`; console.log(label);
  const { ctx, page, errors, cdp } = await open(browser, VP[mode], `file://${root}/jeu.html?type=parc&lieu=asterix&el=${site}`, true);
  await page.waitForFunction(() => typeof act === 'function' && (act('help'), true), undefined, { timeout: 10000 });
  // aide : défilable, bouton de fermeture visible sans défiler
  const h = await page.evaluate(() => { const d = document.querySelector('#mHelp>div'), b = d.querySelector('[data-act=closeHelp]').getBoundingClientRect(); return { scroll: d.scrollHeight > d.clientHeight, btnIn: b.bottom <= innerHeight + 1 && b.top >= 0, w: d.getBoundingClientRect().right <= innerWidth + 1 }; });
  ok('aide: bouton Fermer visible, boîte dans l\'écran', h.btnIn && h.w);
  await shot(page, `${site}-${mode}-0aide`);
  await page.tap('[data-act=closeHelp]');
  await page.evaluate(() => { act('speed', 0); G.wx.next = 1e6; });
  ok('pas de défilement horizontal', await noHScroll(page));
  ok('pas de défilement vertical de la page', await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1));
  const sz = await page.evaluate(() => ({ vw: VW, vh: VH, cw: cv.clientWidth, ch: cv.clientHeight, ww: wrap.clientWidth, wh: wrap.clientHeight }));
  ok('canevas = zone de la carte', sz.cw === sz.ww && sz.ch === sz.wh && sz.vw === sz.ww, JSON.stringify(sz));
  ok('carte: au moins 45 % de la hauteur', sz.wh >= innerHeightOf(mode) * .45, `hauteur ${sz.wh}`);
  ok('onglets présents', (await page.$$('#tabs button')).length === 3 && (await rectOf(page, '#tabs')).vis);
  await frames(page); await shot(page, `${site}-${mode}-1carte`);

  // pupitre : tiroir
  await page.tap('#tabs [data-arg=pupitre]');
  await sleep(350);
  ok('pupitre ouvert dans l\'écran', await inView(page, '#side'));
  const small = await smallTargets(page, '#desk button, #side .row button, #tabs button, .speed button');
  ok('boutons >= 44 px', small.length === 0, small.slice(0, 8).join(' '));
  await page.tap('#bOpen'); ok('tap #bOpen', await page.evaluate(() => G.open));
  await page.evaluate(() => { for (let i = 0; i < 400 && !trains.some(t => t.st === 'station' && ['board', 'check', 'ready'].includes(t.phase)); i++) step(.025); ui(); });
  await page.tap('#bRes'); ok('tap #bRes ouvre les sécurités', await page.evaluate(() => G.resOpen));
  await page.tap('#bGate'); ok('tap #bGate ouvre', await page.evaluate(() => G.gatesOpen));
  await page.tap('#bGate'); ok('tap #bGate ferme', await page.evaluate(() => !G.gatesOpen));
  await page.evaluate(() => { for (let i = 0; i < 400; i++) step(.025); ui(); });
  await page.tap('#bRes'); ok('tap #bRes verrouille', await page.evaluate(() => !G.resOpen));
  await page.evaluate(() => { for (let i = 0; i < 800 && trains.some(t => t.st === 'station' && t.phase === 'check'); i++) step(.025); ui(); });
  const go = await page.evaluate(() => !$('bGo').disabled);
  if (go) { await page.tap('#bGo'); ok('tap #bGo (départ)', await page.evaluate(() => trains.some(t => t.depReq || t.st === 'run'))); } else ok('#bGo grisé (pas de départ possible)', true, '(non testé)');
  await page.tap('#bStop'); ok('tap #bStop', await page.evaluate(() => G.estop)); await page.tap('#bStop');
  await page.tap('#zAuto', { timeout: 1500 }).catch(() => {});
  await page.evaluate(() => { const b = document.querySelector('#side'); b.scrollTop = 0; }); await shot(page, `${site}-${mode}-2pupitre`);
  await page.evaluate(() => { const b = document.querySelector('#side'); b.scrollTop = b.scrollHeight; });
  ok('pupitre défile (zones accessibles)', await page.evaluate(() => { const b = document.querySelector('#side'); return b.scrollHeight > b.clientHeight && b.scrollTop > 0; }));
  await page.tap('#tabs [data-arg=carte]'); await sleep(350);
  ok('pupitre refermé', !(await inView(page, '#side')));
  await page.tap('#tabs [data-arg=journal]'); await sleep(350);
  ok('journal ouvert', await inView(page, '#log')); await shot(page, `${site}-${mode}-3journal`);
  await page.tap('#tabs [data-arg=journal]'); await sleep(350);
  ok('journal refermé', !(await inView(page, '#log')));

  // gestes sur la carte : un doigt = déplacement, deux doigts = zoom
  await page.evaluate(() => { cam.g = null; cam.follow = -1; cam.key = ''; cam.x = VIEW.x; cam.z = VIEW.z; cam.s = Math.max(cam.s, 3); render(.05); });
  const vb = await rectOf(page, '#view'); const c = [vb.x + vb.w / 2, vb.y + vb.h * .4];
  const c0 = await page.evaluate(() => [cam.x, cam.z, cam.s]);
  await drag(cdp, c, [c[0] - 70, c[1] + 40]);
  const c1 = await page.evaluate(() => [cam.x, cam.z, cam.s]);
  ok('un doigt: déplacement', Math.abs(c1[0] - c0[0]) > 5 / c0[2] && Math.abs(c1[1] - c0[1]) > 3 / c0[2] && Math.abs(c1[2] - c0[2]) < 1e-6, `dx=${(c1[0] - c0[0]).toFixed(1)} dz=${(c1[1] - c0[1]).toFixed(1)} m`);
  await pinch(cdp, c, 60, 160);
  const c2 = await page.evaluate(() => cam.s);
  ok('deux doigts: zoom avant', c2 > c1[2] * 1.5, `s ${c1[2].toFixed(2)} -> ${c2.toFixed(2)}`);
  await pinch(cdp, c, 200, 60);
  const c3 = await page.evaluate(() => cam.s);
  ok('deux doigts: zoom arrière', c3 < c2 * .6, `s -> ${c3.toFixed(2)}`);

  // toucher une barrière de file (rayon de toucher >= 22 px) : placer la barrière au centre, toucher à 18 px
  const gate = await page.evaluate(() => { const g = BARS[0]; if (!g) return null; cam.g = null; cam.follow = -1; cam.key = ''; cam.s = 6; cam.x = g.h[0]; cam.z = g.h[1]; render(.05); return BARS.map(b => b.open); }); // issue #37 : barrières indépendantes
  if (gate) {
    const vb2 = await rectOf(page, '#view');
    await page.touchscreen.tap(vb2.x + vb2.w / 2 + 14, vb2.y + vb2.h / 2 + 12);
    const after = await page.evaluate(() => BARS.map(b => b.open));
    ok('tap barrière de file (à ~18 px)', JSON.stringify(after) !== JSON.stringify(gate), JSON.stringify(gate) + ' -> ' + JSON.stringify(after));
    await page.touchscreen.tap(vb2.x + vb2.w / 2 + 14, vb2.y + vb2.h / 2 + 12);
  } else ok('barrières de file', true, '(aucune sur ce site)');

  // synoptique : bouton, puis toucher d'un numéro de train
  await page.evaluate(() => { cam.g = null; cam.follow = -1; cam.key = ''; render(.05); if (!synOn) toggleSyn(); G.wx.next = 1e6; for (let i = 0; i < 6; i++) render(.05); });
  await shot(page, `${site}-${mode}-4synoptique`);
  const hit = await page.evaluate(() => { const h = SYN.hits[0]; if (!h) return null; const r = cv.getBoundingClientRect(); return { x: r.left + h.x, y: r.top + h.y, i: h.i, n: SYN.hits.length }; });
  if (hit) {
    await page.touchscreen.tap(hit.x + 6, hit.y + 6);
    ok('tap numéro du synoptique -> suivi', await page.evaluate(() => cam.follow >= 0), `${hit.n} trains repérés`);
  } else ok('synoptique: trains repérés', false);
  ok('synoptique ne déborde pas', await page.evaluate(() => { const b = SYN.box; return !b || (b[0] + b[2] <= VW + 1 && b[1] + b[3] <= VH * .8); }), await page.evaluate(() => JSON.stringify(SYN.box) + ' dans ' + VW + 'x' + VH));
  await page.evaluate(() => { toggleSyn(); setCam('vue'); });

  // plein écran (repli CSS) avec tiroir
  await page.tap('#bFs'); await sleep(300); await frames(page);
  const f = await page.evaluate(() => { const r = wrap.getBoundingClientRect(); return { fs: document.body.classList.contains('fs'), full: Math.abs(r.width - innerWidth) < 1 && Math.abs(r.height - innerHeight) < 1, cv: cv.clientWidth === wrap.clientWidth && cv.clientHeight === wrap.clientHeight, side: $('side').parentElement === wrap, label: $('bFs').textContent, hs: document.documentElement.scrollWidth <= innerWidth }; });
  ok('plein écran: la carte remplit la fenêtre', f.fs && f.full && f.cv && f.side && f.hs && f.label === 'Quitter le plein écran', JSON.stringify(f));
  ok('plein écran: barre visible', await inView(page, '#fsBar') || (await rectOf(page, '#fsBar')).vis);
  await shot(page, `${site}-${mode}-5plein`);
  await page.tap('#bDesk'); await sleep(350);
  ok('plein écran: tiroir pupitre ouvert', await inView(page, '#side'));
  await page.tap('#bGate', { timeout: 1500 }).catch(() => {}); // peut être grisé
  await page.tap('#bOpen'); ok('plein écran: tap #bOpen dans le tiroir', await page.evaluate(() => !G.open));
  await page.tap('#bOpen');
  await shot(page, `${site}-${mode}-6plein-pupitre`);
  await page.tap('#bDesk'); await sleep(350);
  ok('plein écran: tiroir refermé', !(await inView(page, '#side')));
  await drag(cdp, [vb.x + vb.w / 2, vb.y + vb.h / 2], [vb.x + vb.w / 2 - 50, vb.y + vb.h / 2 - 30]);
  // rotation en plein écran : le canevas suit
  const vs = page.viewportSize(); await page.setViewportSize({ width: vs.height, height: vs.width }); await sleep(300);
  ok('rotation: canevas = fenêtre', await page.evaluate(() => cv.clientWidth === innerWidth && cv.clientHeight === innerHeight && VW === innerWidth), await page.evaluate(() => `${cv.clientWidth}x${cv.clientHeight} / ${innerWidth}x${innerHeight}`));
  await page.setViewportSize(vs); await sleep(300);
  await page.keyboard.press('Escape'); await sleep(300);
  ok('Échap quitte le plein écran', await page.evaluate(() => !document.body.classList.contains('fs') && $('side').parentElement.tagName === 'MAIN' && $('bFs').textContent === 'Plein écran'));
  ok('après sortie: canevas = zone de la carte', await page.evaluate(() => cv.clientWidth === wrap.clientWidth && cv.clientHeight === wrap.clientHeight));
  ok('0 erreur de page', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}
const innerHeightOf = m => VP[m].viewport.height;

async function overflowSmall(browser, site) {
  const { ctx, page, errors } = await open(browser, VP.small, `file://${root}/jeu.html?type=parc&lieu=asterix&el=${site}`, true);
  await page.waitForFunction(() => typeof act === 'function' && (act('help'), true)); console.log(`${site} 360x640`);
  ok('aide 360 px: pas de débordement', await noHScroll(page));
  await page.tap('[data-act=closeHelp]'); await page.tap('#tabs [data-arg=pupitre]'); await sleep(350);
  ok('360 px: pas de défilement horizontal (pupitre ouvert)', await noHScroll(page));
  ok('360 px: pupitre sans débordement interne', await page.evaluate(() => { const s = document.querySelector('#side'); return s.scrollWidth <= s.clientWidth + 1; }), await page.evaluate(() => { const s = document.querySelector('#side'); return s.scrollWidth + ' > ' + s.clientWidth; }));
  await shot(page, `${site}-small-pupitre`);
  ok('0 erreur de page', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

async function parc(browser, mode) {
  console.log("plan.html " + mode);
  const { ctx, page, errors, cdp } = await open(browser, VP[mode], `file://${root}/plan.html?type=parc&lieu=asterix`, true);
  await page.waitForSelector('#fsb'); await sleep(300);
  ok('pas de défilement horizontal', await noHScroll(page));
  await shot(page, `parc-${mode}`);
  const vb = await rectOf(page, '#view'), c = [vb.x + vb.w / 2, vb.y + vb.h / 2];
  const a = await page.evaluate(() => [cam.x, cam.z, cam.s]);
  await drag(cdp, c, [c[0] - 60, c[1] + 30]);
  const b = await page.evaluate(() => [cam.x, cam.z, cam.s]);
  ok('un doigt: déplacement', Math.abs(b[0] - a[0]) > 2 && Math.abs(b[1] - a[1]) > 1);
  await pinch(cdp, c, 60, 170);
  ok('deux doigts: zoom', await page.evaluate(s => cam.s > s * 1.5, b[2]));
  await page.tap('#fsb'); await sleep(300);
  ok('plein écran: canevas = fenêtre', await page.evaluate(() => cv.clientWidth === innerWidth && cv.clientHeight === innerHeight && view.classList.contains('fs')));
  await shot(page, `parc-${mode}-plein`);
  await page.tap('#fsb'); await sleep(300);
  ok('sortie du plein écran', await page.evaluate(() => !view.classList.contains('fs') && cv.clientHeight === view.clientHeight && document.getElementById('fsb').textContent === 'Plein écran'));
  // toucher d'une attraction avec simulateur : ouvre jeu.html
  const t = await page.evaluate(() => { const a = ATT.find(x => x.site); cam = { x: a.x, z: a.z, s: Math.max(cam.s, 2) }; draw(); return a.site; });
  await sleep(200);
  const nav = page.waitForURL(/jeu\.html\?type=parc&lieu=asterix&el=/, { timeout: 4000 }).then(() => true, () => false);
  await page.touchscreen.tap(vb.x + vb.w / 2 + 10, vb.y + vb.h / 2 + 8);
  ok('tap sur une attraction jouable ouvre jeu.html', await nav, t);
  ok('0 erreur de page', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

async function native(browser) { // API Fullscreen réelle (bureau) : informatif si le navigateur sans écran ne l'accorde pas
  console.log('plein écran natif (bureau 1280x800)');
  const { ctx, page, errors } = await open(browser, { viewport: { width: 1280, height: 800 } }, `file://${root}/jeu.html?type=parc&lieu=asterix&el=${sites[0]}`, false);
  await page.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await page.click('[data-act=closeHelp]');
  await page.click('#bFs'); await sleep(500);
  const st = await page.evaluate(() => ({ fe: !!document.fullscreenElement, fs: document.body.classList.contains('fs') }));
  ok('natif: classe fs posée', st.fs, st.fe ? '(API active)' : '(API refusée en headless : repli CSS)');
  await page.click('#bDesk'); await sleep(300);
  ok('natif: tiroir pupitre', await inView(page, '#side'));
  await page.evaluate(() => document.fullscreenElement && document.exitFullscreen()); await sleep(500);
  if (st.fe) ok('natif: sortie par l\'API met à jour la page', await page.evaluate(() => !document.body.classList.contains('fs') && $('side').parentElement.tagName === 'MAIN'));
  else { await page.click('#fsBar [data-act=fs]'); ok('natif: bouton Quitter', await page.evaluate(() => !document.body.classList.contains('fs'))); }
  ok('0 erreur de page', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const s of sites) { await game(browser, s, 'portrait'); await game(browser, s, 'landscape'); await overflowSmall(browser, s); }
  await parc(browser, 'portrait'); await parc(browser, 'landscape');
  await native(browser);
  if (montage && shots.length) {
    const sel = shots.filter(f => /(1carte|2pupitre|5plein|6plein-pupitre|4synoptique)/.test(f) || /parc/.test(f));
    const pg = await browser.newPage({ viewport: { width: 1800, height: 1200 } });
    const html = '<body style="margin:0;background:#0f1626;color:#9aa7c4;font:11px system-ui"><div style="display:flex;flex-wrap:wrap;gap:6px;padding:6px;align-items:flex-start">' +
      sel.map(f => `<figure style="margin:0"><img style="height:${/landscape/.test(f) ? 150 : 300}px;display:block" src="file://${f}"><figcaption>${path.basename(f, '.png')}</figcaption></figure>`).join('') + '</div></body>';
    fs.writeFileSync('/tmp/mont.html', html); await pg.goto('file:///tmp/mont.html'); await sleep(500);
    const h = await pg.evaluate(() => document.body.scrollHeight); await pg.setViewportSize({ width: 1800, height: h });
    await pg.screenshot({ path: montage, type: 'jpeg', quality: 62 });
    console.log('montage', montage, Math.round(fs.statSync(montage).size / 1024) + ' Ko');
  }
  await browser.close();
  console.log(fails ? `FAIL (${fails})` : 'PASS');
  process.exit(fails ? 1 : 0);
})();
