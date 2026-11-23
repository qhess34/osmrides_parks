#!/usr/bin/env node
/* Test rapide : node tools/check.js <site> [--build] — joue une journée complète et résume en quelques lignes. */
const { chromium } = require('playwright');
const { INSTALL } = require('./offpath.js');
const path = require('path'), { execFileSync } = require('child_process'), fs = require('fs');
const site = process.argv[2] || 'zeus', build = process.argv.includes('--build');
const root = path.resolve(__dirname, '..');
(async () => {
  fs.mkdirSync('/tmp/t1', { recursive: true });
  let url;
  if (build) {
    const out = `/tmp/t1/${site}.html`;
    execFileSync('python3', [path.join(root, 'tools/build.py'), site, out], { stdio: 'ignore' });
    url = 'file://' + out;
  } else url = `file://${root}/jeu.html?type=parc&lieu=asterix&el=${site}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !/\.game\.js$/.test((m.location() || {}).url || '')) // lieux/parc/asterix/<el>.game.js facultatif : absent = erreur de chargement attendue
  errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { try { for (const k of Object.keys(localStorage)) if (k.startsWith('t2z.save.')) localStorage.removeItem(k); } catch (e) {} }); // départ propre : pas de partie sauvegardée
  await page.goto(url);
  await page.waitForFunction(() => typeof act === 'function' && (act('help'), true), undefined, { timeout: 10000 });
  await page.click('[data-act=closeHelp]');
  // Manœuvre scriptée avec les vrais boutons du pupitre (garage SITE.yard, docs/manoeuvres.md) : sortir le train garé, garer l'autre à vide, deux refus
  let man = 'skipped';
  {
    const until = (cond, max = 20000) => page.evaluate(([c, m]) => { const f = new Function('return ' + c); act('speed', 0); G.wx.next = 1e6;
      for (let i = 0; i < m; i++) { if (f()) break; step(.025); } ui(); return f(); }, [cond, max]);
    const click = async id => { try { await page.click(id, { timeout: 3000 }); } catch (e) { throw new Error('click ' + id + ' after: ' + steps.join(' ') + (process.env.DBG ? ' ' + e.message : '')); } };
    const logHas = re => page.evaluate(r => new RegExp(r).test($('log').textContent), re);
    await page.evaluate(() => { G.wear.chain = 0; G.wear.brake = 0; G.liftBroken = false; G.brakeFault = false; }); // le scénario de manœuvre ne dépend pas des pannes aléatoires (usure)
    const steps = [];
    const ok = (name, v) => { steps.push(name + (v ? '' : ':FAIL')); return v; };
    const hasYard = await page.evaluate(() => typeof LANES !== 'undefined' && trains.length > 1 && trains[1].st === 'garage');
    const brake = hasYard && await page.evaluate(() => YZ === 'Fin'); // zone de raccordement du garage (engine/garage.js YZ, issue #36)
    const trav = hasYard && await page.evaluate(() => TRAV);
    const gates = async () => { // portillons : ouverture et fermeture uniquement au bouton
      await click('#bGate'); ok('gateOpen', await page.evaluate(() => G.gatesOpen));
      await click('#bGate'); ok('gateShut', await until('!G.gatesOpen&&G.gate<.05', 400));
    };
    const forceBrake = async (k, i) => { // freins forcés de la voie k (issue #11) serrés pendant le mouvement du train i : arrêt immédiat, Dispatch refusé, relâchés puis reprise au Dispatch
      ok('laneMoving' + k, await page.evaluate(i => !!trains[i].mv, i));
      await click(`#zL${k}_k`); const g0 = await page.evaluate(i => trains[i].g, i);
      ok('laneBrakeStop' + k, await until(`!trains[${i}].mv&&G.zk.L${k}`, 2) && await until('false', 80) === false && await page.evaluate(([i, g0, k]) => !trains[i].mv && Math.abs(trains[i].g - g0) < .3 && $('zL' + k + '_k').classList.contains('lit'), [i, g0, k]));
      await click(`#zL${k}_d`); ok('refuseLaneBrake' + k, await logHas('freins forcés serrés') && await page.evaluate(i => !trains[i].mv, i));
      await click(`#zL${k}_k`); ok('laneBrakeRel' + k, await page.evaluate(k => !G.zk['L' + k] && !$('zL' + k + '_k').classList.contains('lit'), k));
      await click(`#zL${k}_d`); ok('laneResume' + k, await page.evaluate(i => !!trains[i].mv, i));
    };
    const carrierFull = async i => { // zone porteuse à un seul train (issue #11) : le train i est sur le chariot / rail du pont ; voie pleine en face → refus, aucun mouvement
      const k = await page.evaluate(() => LANES.findIndex((l, j) => trains.some(t => t.st === 'garage' && t.lane === j)) + 1);
      if (!k) return ok('carrierFull:none', true);
      await click('#y' + k); ok('refuseCarryFull', await logHas('ne peut pas y être porté') && await page.evaluate(() => !devMoving())); // l'appareil chargé ne vient pas face à une voie pleine
      // garde du Dispatch (laneDispatch) : appareil chargé placé de force face à la voie pleine, Dispatch refusé, aucun mouvement, puis état rendu
      ok('refuseCarrierFull', await page.evaluate(([i, k]) => { const d = Object.assign({}, G.dev); G.dev.pos = G.dev.to = k; G.dev.k = 1;
        const r = act('zone', 'L' + k + ':d'), still = !trains.some(t => t.mv) && trains[i].lane < 0; Object.assign(G.dev, d);
        return still && new RegExp('porte déjà un train').test($('log').textContent); }, [i, k]));
    };
    const shotDir = (process.argv.find(a => a.startsWith('--shots=')) || '').slice(8);
    const shot = async name => { if (!shotDir) return; fs.mkdirSync(shotDir, { recursive: true });
      await page.evaluate(() => { G.roofOff = true; cam.g = { x: SW0.x + SW0.tx * 10 - SW0.vx * 10, z: SW0.z + SW0.tz * 10 - SW0.vz * 10, s: 10 }; cam.follow = -1; for (let i = 0; i < 40; i++) render(.05); });
      await page.screenshot({ path: path.join(shotDir, name + '.png') }); };
    if (trav && await page.evaluate(() => RA)) { // Trace du Hourra : rail A escamotable + chariot du rail B ; commandes par zones
      const o = await page.evaluate(() => { const g = trains.filter(t => t.st === 'garage'), t = g[Math.min(2, g.length - 1)]; return { i: t.i, k: t.lane + 1 }; });
      const d0 = await page.evaluate(() => DEV0);
      await click('#bAuto'); await gates();
      await click('#zSt_f'); ok('depart0', await until("trains[0].st==='run'&&trains[0].s>S_ST+TLEN+3", 4000));
      await page.evaluate(() => act('zone', 'B1:k')); ok('refuseAuto', await logHas('en AUTO : passez'));
      await click('#zB1_m'); await click('#zB1_k'); ok('blk1Held', await until('trains[0].blk&&trains[0].v===0&&Math.abs(trains[0].s-BLK[0])<.5', 8000) && await logHas('arrêté au frein de bloc 1'));
      await shot('1-repos');
      // sortir le train de la voie k : chariot face à la voie, Dispatch de la voie (sur le rail B), rail A retiré, chariot sur G, Avancer (rail B) vers la gare
      await click('#y' + o.k); ok('dev' + o.k, await until(`devOn(${o.k - 1})`, 4000));
      await click(`#zL${o.k}_d`); ok('onCar' + o.i, await until(`trains[${o.i}].lane<0&&!trains[${o.i}].mv`, 8000));
      await click('#yG'); ok('refuseRailA', await logHas('ne vient en ligne que si') && await page.evaluate(() => !devMoving()));
      await click('#yA1'); ok('raOut', await until('raOut()', 4000));
      await click('#yG'); ok('carried' + o.i, await until(`devMoving()&&onCar(trains[${o.i}])`, 40));
      ok('onRailB' + o.i, await until(`trains[${o.i}].st==='run'&&G.dev.pos===PG&&tZone(trains[${o.i}])==='RB'`, 4000));
      await click('#zRB_f'); ok('station' + o.i, await until(`trains[${o.i}].st==='station'`, 4000));
      await click('#yA0'); ok('refuseRailB', await logHas('ne revient sur le circuit que si') && await page.evaluate(() => raOut()));
      await click('#y' + d0); ok('devRest', await until(`devOn(${d0 - 1})`, 4000));
      await click('#yA0'); ok('raIn', await until('raIn()', 4000));
      ok('stillHeld', await page.evaluate(() => trains[0].v === 0 && Math.abs(trains[0].s - BLK[0]) < .5));
      await click('#zB1_k'); ok('blk1Waits', await until('false', 200) || await page.evaluate(() => trains[0].v === 0 && Math.abs(trains[0].s - BLK[0]) < .5)); // MANU, roues de propulsion : relâcher ne suffit pas
      await click('#zB1_f'); ok('blk1Released', await until('trains[0].s>BLK[0]+5', 2000));
      // garer le train 0 (vide) : frein final en MANU serré (arrêt avant le pont), rail A retiré, chariot sur G, relâcher, Avancer (frein final) sur le rail B,
      // chariot sur une voie libre (il l'emporte), Dispatch de la voie (il y entre), chariot au repos, rail A sur le circuit
      await click('#zFin_m'); await click('#zFin_k');
      ok('preHeld0', await until('trains[0].v===0&&Math.abs(trains[0].s-S_PRE)<.5', 20000) && await logHas('frein final serré'));
      await click('#zFin_f'); ok('refuseFinBrake', await logHas('freins serrés, relâchez'));
      await click('#yA1'); ok('raOut2', await until('raOut()', 4000)); await shot('2-railA-retire');
      await click('#yG'); ok('devG2', await until('!devMoving()&&G.dev.pos===PG', 4000));
      await click('#zFin_k'); ok('stillPre0', await until('false', 200) || await page.evaluate(() => trains[0].v === 0 && Math.abs(trains[0].s - S_PRE) < .5));
      await click('#zFin_f'); ok('onB0', await until('atAnchor(trains[0])&&G.dev.pos===PG', 4000)); await shot('3-chariot-en-ligne');
      const f = await page.evaluate(() => LANES.findIndex((l, j) => !trains.some(t => t.st === 'garage' && t.lane === j)) + 1);
      await click('#y' + f); ok('carry0', await until("devMoving()&&trains[0].st==='garage'&&trains[0].lane<0", 40));
      await click('#yA0'); ok('refuseMovingA', await logHas('ne revient sur le circuit que si'));
      ok('dev' + f, await until(`devOn(${f - 1})`, 4000)); await carrierFull(0); await shot('4-chariot-voie');
      await click('#zRB_f'); ok('refuseRBpush', await logHas('au bouton Dispatch de cette voie'));
      await click(`#zL${f === 1 ? 2 : 1}_d`); ok('refuseNotOn', await logHas('n.est pas en place sur cette voie'));
      await click(`#zL${f}_d`); ok('in0', await until(`trains[0].lane===${f - 1}&&trains[0].g>G_B+2`, 400)); await forceBrake(f, 0);
      await click('#y' + (f === 1 ? 2 : 1)); ok('refuseLocked', await logHas('verrouillé'));
      ok('parked0', await until(`trains[0].st==='garage'&&trains[0].lane===${f - 1}&&!trains[0].mv&&!nearDev(trains[0])`, 8000));
      ok('buffer0', await page.evaluate(() => LANES[trains[0].lane].end - trains[0].g > .5 && trains[0].g <= LANES[trains[0].lane].stop + .01)); // marge au butoir (issue #11)
      if (f !== d0) { await click('#y' + d0); ok('devRest2', await until(`devOn(${d0 - 1})`, 4000)); }
      await click('#yA0'); ok('raIn2', await until('raIn()', 4000)); await shot('5-railA-revenu');
      await click('#zAuto'); ok('allAuto', await page.evaluate(() => !G.zm.Fin && !G.zm.B1));
      // stockage : en AUTO, frein avant gare (Pre), rail mobile du parcours (RA) et frein final (Fin) retiennent un train chacun pendant que la gare est occupée
      ok('dispatchOnly', await page.evaluate(() => !document.getElementById('zL1_f') && !document.getElementById('zL1_b') && !!document.getElementById('zL1_k') && !!document.getElementById('zL1_d') && !!document.getElementById('zPre_m')));
      // le 3e train part d'avant le dernier frein de bloc (cantonnement)
      const three = await page.evaluate(() => { const g = trains.filter(t => t.st === 'garage' && !t.mv).slice(0, 3); if (g.length < 3 || !trains.some(t => t.st === 'station')) return null;
        g.forEach((t, k) => { t.st = 'run'; t.s = k < 2 ? S_PRE - 14 - k * (TLEN + 3) : BLK[BLK.length - 1] - 20; t.v = 4; t.lane = 0; t.g = 0; t.mv = 0; t.depReq = false; t.inLift = false; t.inBrake = false; t.blk = false; t.entering = false; t.toPre = false; t.hold = 0; t.fdrive = 0; t.told = false; t.preTold = false; t.lkTold = false; });
        return g.map(t => t.i); });
      if (three) {
        const [a, b, c] = three;
        ok('storePre', await until(`trains[${a}].v===0&&tZone(trains[${a}])==='Pre'&&Math.abs(trains[${a}].s-S_PSB)<.5`, 3000));
        ok('storeRA', await until(`trains[${b}].v===0&&tZone(trains[${b}])==='RA'&&Math.abs(trains[${b}].s-S_HOLD)<.5`, 3000));
        ok('storeFin', await until(`trains[${c}].v===0&&tZone(trains[${c}])==='Fin'&&Math.abs(trains[${c}].s-S_PRE)<.6`, 3000));
        ok('heldStation', await page.evaluate(i => trains.some(t => t.st === 'station') && trains[i].st === 'run', a));
        // frein avant gare en MANU : serré, relâchement refusé tant que la gare est occupée ; retour en AUTO
        await click('#zPre_m'); await click('#zPre_k'); ok('preManu', await page.evaluate(() => zK('Pre')));
        await click('#zPre_k'); ok('refusePre', await logHas('Frein avant gare : relâchement refusé'));
        await click('#zAuto'); ok('preAuto', await page.evaluate(() => !G.zm.Pre));
        await shot('6-stockage');
        if (shotDir) { await page.evaluate(() => { G.roofOff = true; const f = frameAt(L - 8, mkF()); cam.g = { x: f.p.x, z: f.p.z, s: 9 }; cam.follow = -1; for (let i = 0; i < 40; i++) render(.05); });
          await page.screenshot({ path: path.join(shotDir, 'hourra-pregare.png') }); }
        for (const [k, i] of [a, b, c].entries()) { // la gare se libère : chaque train entre à son tour (Pre, puis RA → Pre, puis Fin → RA → Pre)
          await until("trains.some(t=>t.st==='station'&&t.phase==='board')", 8000);
          await until("trains.some(t=>t.st==='station'&&!blockReason(t))", 4000);
          await gates(); await click('#zSt_f');
          ok('enter' + 'ABC'[k], await until(`trains[${i}].st==='station'`, 4000));
          await until(`trains[${i}].phase==='board'`, 8000);
        }
      }
      await click('#bAuto');
    } else if (trav && await page.evaluate(() => LREV && SG)) { // OzIris : pont transbordeur à RAIL UNIQUE (le rail du circuit vient chercher les trains ; P, 1…3), voies en amont (yard.rev)
      ok('noYG', await page.evaluate(() => !document.getElementById('yG') && !!document.getElementById('yP') && !document.getElementById('zRA_m') && !!document.getElementById('zRB_m')
        && !document.getElementById('zL1_f') && !document.getElementById('zL1_b') && !!document.getElementById('zL1_d')));
      await click('#bAuto'); await gates();
      // garer le train 0 (vide) : Rail du pont en MANU, freins serrés (le train s'y arrête), pont sur la voie 3 (il emporte le train), relâcher, Rail du pont AR (dans la voie), pont sur P
      await click('#zRB_m'); await click('#zRB_k'); ok('rbManu', await page.evaluate(() => zK('RB')));
      await click('#zSt_f'); ok('depart0', await until("trains[0].st==='run'&&trains[0].s>S_ST+TLEN+3", 4000));
      ok('rolling0', await until('onRail(trains[0])&&trains[0].v>0', 20000));
      await click('#y3'); ok('refuseRolling', await logHas('verrouillé') && await page.evaluate(() => !devMoving()));
      ok('onRail0', await until("atAnchor(trains[0])&&tZone(trains[0])==='RB'", 4000)); await shot('1-train-sur-rail-du-pont');
      await click('#y3'); ok('carry0', await until("devMoving()&&trains[0].st==='garage'&&trains[0].lane<0", 40));
      await until('G.dev.k>.5', 400); await shot('2-rail-emporte-le-train');
      ok('dev3', await until('devOn(2)', 4000)); await shot('3-face-voie-3');
      await carrierFull(0);
      await click('#zL3_d'); ok('refuseRBBrake', await logHas('Freins de Rail du pont serrés'));
      await click('#zRB_k'); await click('#zRB_b'); ok('refuseRBpush', await logHas('au bouton Dispatch de cette voie'));
      await click('#zL1_d'); ok('refuseNotOn', await logHas('n.est pas en place sur cette voie'));
      await click('#zL3_d'); ok('in0', await until('trains[0].lane===2&&trains[0].g>G_B+2', 400)); await forceBrake(3, 0); await shot('4-recul-dans-la-voie-3');
      await click('#yP'); ok('refuseLocked', await logHas('verrouillé'));
      ok('parked0', await until("trains[0].st==='garage'&&trains[0].lane===2&&!trains[0].mv&&!nearDev(trains[0])", 8000));
      ok('buffer0', await page.evaluate(() => LANES[trains[0].lane].end - trains[0].g > .5 && trains[0].g <= LANES[trains[0].lane].stop + .01)); // marge au butoir (issue #11)
      await click('#yP'); ok('devP', await until('circIn()', 4000));
      await click('#zAuto'); ok('allAuto', await page.evaluate(() => !G.zm.RB && !G.zm.B1));
      // sortir le train 1 (voie 1) : pont (vide) face à la voie 1, Dispatch de la voie 1 (sur le rail du pont), pont sur P : il repart seul vers la gare (zone en AUTO)
      await click('#y1'); ok('dev1', await until('devOn(0)', 4000));
      await click('#zL1_d'); ok('onCar1', await until('trains[1].lane<0&&!trains[1].mv', 8000)); await shot('5-sortie-sur-rail-du-pont');
      await click('#yP'); ok('back1', await until("trains[1].st==='run'&&circIn()&&tZone(trains[1])==='RB'", 4000));
      ok('station1', await until("trains[1].st==='station'&&trains[1].phase==='board'", 8000));
      // rail hors de P : le train du circuit attend avant le pont (frein final en AUTO), puis passe quand le rail revient
      await gates(); await click('#zSt_f'); ok('depart1', await until("trains[1].st==='run'&&trains[1].s>S_ST+TLEN+3", 4000));
      await click('#y2'); ok('dev2', await until('devOn(1)', 4000));
      ok('circuitHeld1', await until('trains[1].v===0&&Math.abs(trains[1].s-S_PRE)<.5', 20000) && await logHas('attend avant'));
      await shot('6-circuit-interrompu');
      if (/circuitHeld1:FAIL/.test(steps.join(' '))) console.log('DBG', await page.evaluate(() => JSON.stringify({t1: [trains[1].st, trains[1].s, trains[1].v, zoneOf(trains[1].s)], S_PRE, lb: G.liftBroken, bf: G.brakeFault, dev: G.dev, log: $('log').textContent.slice(0, 600)})));
      await click('#zL2_d'); ok('onCar2', await until('trains[2].lane<0&&!trains[2].mv', 8000));
      // train 1 ARRÊTÉ dans le dernier canton (avant le pont) : il ne bloque pas le retour en ligne (propriétaire, 2026-11-17) ; seul un train qui y roule bloque
      ok('refuseRollingLast', await page.evaluate(() => { const c = trains[2], o = trains[1], k = {s: o.s, v: o.v}; o.v = 1; const a = anchorFree(c); o.v = 0; const b = anchorFree(c); Object.assign(o, k); return !a && b; }));
      await click('#yP'); ok('backStopped2', await until("trains[2].st==='run'&&circIn()", 4000) && !await logHas('Dernier canton occupé'));
      ok('held1', await page.evaluate(() => { let ok = true; for (let i = 0; i < 8000 && trains[2].st !== 'station'; i++) { step(.025); // train 1 retenu (cantonnement) tant que le rail du pont porte le train 2
        if (atAnchor(trains[2]) && (trains[1].v > .05 || trains[1].s > S_PRE + .5)) ok = 'moved'; if (trains[1].st === 'run' && trains[2].st === 'run' && trains[2].s > trains[1].s && trains[2].s - trains[1].s < TLEN) ok = 'gap'; } // gap : avant que le train 2 repasse s=0
        ui(); if (!(ok === true && trains[2].st === 'station' && trains[1].st === 'run')) console.error('DBG held1', JSON.stringify({ok, t1: [trains[1].st, trains[1].s, trains[1].v], t2: [trains[2].st, trains[2].s, trains[2].v], S_PRE, R0, R1, S_HOLD})); return ok === true && trains[2].st === 'station' && trains[1].st === 'run'; }));
      ok('pass2', await until("trains[2].phase==='board'", 8000));
      await gates(); await click('#zSt_f'); ok('depart2', await until("trains[2].st==='run'&&trains[2].s>S_ST+TLEN+3", 4000));
      ok('pass1', await until("trains[1].st==='station'", 8000));
      // sortir le train 0 (voie 3) : il revient sur le circuit en P et y est retenu (zone de stockage) tant que la gare est occupée
      await click('#y3'); await until('G.dev.k>.3', 400); await click('#bStop'); // arrêt d'urgence : le pont est figé
      { const k = await page.evaluate(() => G.dev.k); await until('false', 100); await click('#y1');
        ok('estopFrozen', await page.evaluate(k0 => devMoving() && G.dev.k === k0, k) && await logHas('arrêt d.urgence')); }
      await click('#bStop'); ok('dev2b', await until('devOn(2)', 4000));
      await click('#zL3_d'); ok('onCar2b', await until('trains[0].lane<0&&!trains[0].mv', 8000));
      ok('carHoldsAhead', await page.evaluate(() => { // rail du pont = zone d'attente (propriétaire, 2026-11-17) : un train au-delà du pont ne bloque pas le retour, un train en amont (dernier canton) oui
        const c = trains[0], o = trains.find(x => x !== c && x.st !== 'garage'); if (!o) return true; const k = {st: o.st, s: o.s, v: o.v}; o.st = 'run'; o.v = 1;
        o.s = R1 + TLEN + 1; const a = anchorFree(c); o.s = S_PRE - 1; const b = anchorFree(c); Object.assign(o, k); return a && !b; }));
      await click('#yP'); ok('back2b', await until("trains[0].st==='run'&&circIn()&&atAnchor(trains[0])", 4000)); await shot('7-retour-en-P');
      ok('stored2', await until('false', 200) || await page.evaluate(() => (atAnchor(trains[0]) || onPsb(trains[0])) && trains.some(t => t.st === 'station'))); // stocké au frein final / rail du pont, ou sur la zone d'attente avant gare (Pre)
      await click('#bAuto');
    } else if (hasYard && !trav && !brake) { // Tonnerre 2 Zeus (aiguillage dans le prolongement de la gare) ; Goudurix : aiguillage en amont (yard.back), entrée au garage en marche arrière
      const lbk = await page.evaluate(() => LBK), PUSH = '#zL1_d', SB = lbk ? 'S_ST' : 'SW_B'; // commandes par zones ; garage : bouton Dispatch de la voie (issue #11)
      ok('dispatchOnly', await page.evaluate(() => !document.getElementById('zL1_f') && !document.getElementById('zL1_b') && !!document.getElementById('zL1_k') && !!document.getElementById('zL1_d') && !!document.getElementById('zSt_f')));
      await click('#bAuto'); await gates();
      await click('#zSt_f'); ok('depart0', await until(`trains[0].st==='run'&&trains[0].s>${SB}+TLEN+3`, 4000));
      await click('#y1'); ok('dev1', await until('devOn(0)', 800));
      await click('#zL1_d'); ok('out1', await until("trains[1].st==='station'", 8000));
      await click('#yP'); ok('devP', await until('!devOff()', 800));
      // frein final en MANU, serré : il retient le train 0 ; relâchement refusé tant que la gare est occupée (anti-collision)
      await click('#zFin_m'); await click('#zFin_k');
      ok('finHeld0', await until("trains[0].st==='run'&&trains[0].v===0&&Math.abs(trains[0].s-S_HOLD)<.4", 20000));
      await click('#zFin_k'); ok('refuseAntiCollision', await logHas('relâchement refusé, section suivante occupée'));
      await click('#zSt_f'); ok('depart1', await until(`trains[1].st==='run'&&trains[1].s>${SB}+TLEN+3`, 4000));
      await click('#zFin_k'); ok('arrive0', await until("trains[0].st==='station'&&trains[0].phase==='board'", 20000));
      await click(PUSH); ok('refuseNotOn', await logHas('n.est pas en place sur cette voie'));
      await click('#y1'); ok('dev1b', await until('devOn(0)', 800));
      await click('#bGate'); await click(PUSH); ok('refuseGates', await logHas('Portillons ouverts : fermez-les'));
      await click('#bGate'); await until('!G.gatesOpen&&G.gate<.05', 400);
      await click(PUSH); ok('in0', await until("trains[0].st==='garage'&&trains[0].g>4", 400)); await forceBrake(1, 0);
      await click('#yP'); ok('refuseLocked', await logHas('verrouillé'));
      ok('parked0', await until("trains[0].st==='garage'&&!trains[0].mv&&!nearDev(trains[0])", 8000));
      ok('buffer0', await page.evaluate(() => LANES[trains[0].lane].end - trains[0].g > .5 && trains[0].g <= LANES[trains[0].lane].stop + .01)); // marge au butoir (issue #11)
      await click('#yP'); ok('devP2', await until('!devOff()', 800));
      // frein final en MANU : serré, il retient le train 1 ; relâché, le train entre en gare
      await click('#zFin_k');
      ok('finHeld1', await until("trains[1].st==='run'&&trains[1].v===0&&Math.abs(trains[1].s-S_HOLD)<.4", 20000) && await logHas('serré au pupitre'));
      await click('#zFin_k'); ok('finRel1', await until("trains[1].st==='station'", 2000));
      await click('#zAuto'); ok('allAuto', await page.evaluate(() => !G.zm.Fin));
      await click('#bAuto');
    } else if (hasYard && !trav && brake) { // Goudurix : aiguillage au frein final (le train s'arrête à l'aiguillage, la zone porteuse est le frein final)
      ok('dispatchOnly', await page.evaluate(() => !document.getElementById('zL1_b') && !!document.getElementById('zL1_d') && !!document.getElementById('zFin_f')));
      await click('#bAuto'); await gates();
      await click('#zSt_f'); ok('depart0', await until("trains[0].st==='run'&&trains[0].s>S_ST+TLEN+3", 4000));
      // sortir le train garé : aiguillage sur la voie, Dispatch de la voie, puis aiguillage sur P une fois le train dégagé
      await click('#y1'); ok('dev1', await until('devOn(0)', 400));
      await click('#zL1_d'); ok('out1', await until("trains[1].st==='run'&&trains[1].v===0&&Math.abs(trains[1].s-S_HOLD)<.4", 8000)); // revenu sur le frein final
      await click('#yP'); ok('devP', await until('!devOff()', 800));
      ok('in1', await until("trains[1].st==='station'", 8000));
      // frein final en MANU, serré : il retient le train 0 ; relâchement refusé tant que la gare est occupée (anti-collision)
      await click('#zFin_m'); await click('#zFin_k');
      ok('finHeld0', await until("trains[0].st==='run'&&trains[0].v===0&&Math.abs(trains[0].s-S_HOLD)<.4", 30000));
      await click('#zFin_k'); ok('refuseAntiCollision', await logHas('relâchement refusé, section suivante occupée'));
      // le train 1 repart (gare libre), puis garer le train 0 (vide, arrêté à l'aiguillage) : aiguillage sur la voie (entrée en gare bloquée), freins relâchés, Dispatch de la voie le fait entrer
      await click('#zSt_f'); ok('depart1', await until("trains[1].st==='run'&&trains[1].s>S_ST+TLEN+3", 4000));
      await click('#y1'); ok('dev1b', await until('devOn(0)', 800));
      await click('#zFin_k'); ok('finRel0', await until("!G.zk.Fin", 400));
      await click('#zL1_d'); ok('in0', await until("trains[0].st==='garage'&&trains[0].g>4", 4000)); await forceBrake(1, 0);
      await click('#yP'); ok('refuseLocked', await logHas('verrouillé'));
      ok('parked0', await until("trains[0].st==='garage'&&!trains[0].mv&&!nearDev(trains[0])", 12000));
      await click('#yP'); ok('devP2', await until('!devOff()', 800));
      await click('#zAuto'); ok('allAuto', await page.evaluate(() => !G.zm.Fin));
      await click('#bAuto');
    } else if (hasYard) steps.push('scenario-missing:FAIL');
    man = steps.length ? steps.join(' ') : 'no yard train';
  }
  { // règle du lift (par défaut pour toutes les attractions) : un seul train sur le lift (le suivant attend au pied), train retenu en haut tant que la zone de freinage suivante est occupée
    const p2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await p2.goto(url); await p2.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p2.click('[data-act=closeHelp]');
    const lf = await p2.evaluate(() => { act('speed', 0); G.wx.next = 1e6; const o = [], A = trains[0], B = trains[1]; if (!B) return 'single-train';
      const run = (c, m) => { for (let i = 0; i < m; i++) { if (c()) break; step(.025); } return c(); };
      for (const t of trains) { t.seats.fill(null); } B.st = 'station'; B.s = S_ST; B.g = 0; B.phase = 'board'; B.v = 0; A.st = 'run'; A.s = S_LIFT0 + 20; A.v = 4; A.inLift = true; A.blk = false;
      G.liftOff = true; B.st = 'run'; B.s = S_ST + 4; B.v = 3; B.inLift = false; B.blk = false; B.inBrake = false; G.estop = false;
      run(() => false, 600); o.push(B.st === 'run' && B.v === 0 && B.s < S_LIFT0 && B.s > S_LIFT0 - 3 ? 'footHold' : 'footHold:FAIL');
      G.liftOff = false; run(() => A.s > S_REL + 1, 4000); run(() => B.s > S_LIFT0 + 5, 2000); o.push(B.s > S_LIFT0 + 1 ? 'footGo' : 'footGo:FAIL');
      // train retenu en haut : un autre train occupe la zone suivante (A arrêté sur la zone de freinage, freins serrés au pupitre)
      A.st = 'run'; A.s = BLK.length ? BLK[0] - 3 : S_HOLD; A.v = 0; A.blk = true; A.hold = 0; G.zm.Fin = true; G.zk.Fin = true; if (BLK.length) { G.zm.B1 = true; G.zk.B1 = true; } if (PSB) { G.zm.Pre = true; G.zk.Pre = true; } if (TRAV) { G.zm[ZR] = true; G.zk[ZR] = true; } // A ne doit pas quitter la zone (frein avant gare, rail du pont)
      run(() => B.wait && B.v === 0, 6000); o.push(B.wait && B.s > S_LIFT1 - 6 && B.s < S_REL ? 'topHold' : 'topHold:FAIL'); return o.join(' '); });
    man += ' | lift: ' + lf;
    await p2.close(); const p3 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await p3.goto(url); await p3.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p3.click('[data-act=closeHelp]');
    const tr = await p3.evaluate(() => { const i = BTRIM.findIndex(v => v > 0); if (i < 0) return ''; act('speed', 0); G.wx.next = 1e6; const A = trains[0]; A.st = 'run'; A.s = Math.max(S_REL, BLK[i] - 120); A.v = 14; A.inLift = true; A.seats.fill(null); A.blk = false;
      for (const t of trains) if (t !== A) { t.st = 'garage'; t.g = 1e3; } let vB = null, prev = A.s, stop = false;
      for (let k = 0; k < 40000 && A.st === 'run'; k++) { step(.025); if (prev < BLK[i] && A.s >= BLK[i]) vB = A.v; if (A.blk && A.v === 0) stop = true; prev = A.s; }
      return ' | trim: ' + (vB !== null && vB <= BTRIM[i] + 1 && !stop && A.st !== 'run' ? 'slows' : 'slows:FAIL'); });
    man += tr;
    // freins de bloc à roues de propulsion (drive:'fwd') : AV seul (pas d'AR), en MANU le train arrêté n'en repart qu'à AV, AV refusé si le canton suivant est occupé
    await p3.reload(); await p3.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p3.click('[data-act=closeHelp]');
    const bf = await p3.evaluate(() => { if (!BLK.length || !BDRV[0]) return ''; act('speed', 0); G.wx.next = 1e6; const o = [], A = trains[0], B = trains[1];
      const run = (c, m) => { for (let i = 0; i < m; i++) { if (c()) break; step(.025); } return c(); }, L = r => r.test($('log').textContent);
      o.push(document.getElementById('zB1_f') && document.getElementById('zB1_x') && !document.getElementById('zB1_b') ? 'avOnly' : 'avOnly:FAIL');
      for (const t of trains) { t.seats.fill(null); if (t !== A) { t.st = 'garage'; t.g = 1e3; } } A.st = 'run'; A.s = BLK[0] - 25; A.v = 5; A.inLift = true; A.blk = false; A.bgo = 0; A.bst = 0;
      act('zone', 'B1:m'); act('zone', 'B1:k'); run(() => A.blk && A.v === 0, 4000); act('zone', 'B1:k');
      run(() => false, 200); o.push(A.v === 0 && Math.abs(A.s - BLK[0]) < .5 ? 'manuWaits' : 'manuWaits:FAIL');
      act('zone', 'B1:b'); o.push(L(/marche avant seulement/) ? 'refuseAR' : 'refuseAR:FAIL');
      if (B) { B.st = 'run'; B.s = BLK[0] + TLEN + 15; B.v = 0; act('zone', 'B1:f'); o.push(L(/Canton suivant occupé/) && !A.bgo ? 'refuseBusy' : 'refuseBusy:FAIL'); B.st = 'garage'; B.g = 1e3; }
      act('zone', 'B1:f'); run(() => A.s > BLK[0] + 5, 2000); o.push(A.s > BLK[0] + 5 ? 'avGo' : 'avGo:FAIL'); act('zone', 'B1:m'); return ' | blkAV: ' + o.join(' '); });
    man += bf;
    // pont droit : un train porté par le chariot face à une voie ne bloque pas le dernier canton (propriétaire, 2026-11-17) ; le train qui arrive est retenu avant le pont (aucun rail en ligne)
    await p3.reload(); await p3.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p3.click('[data-act=closeHelp]');
    const cb = await p3.evaluate(() => { if (!TRAV || trains.length < 2) return ''; act('speed', 0); G.wx.next = 1e6; const o = [], C = trains.find(t => t.st === 'garage') || trains[1], A = trains.find(t => t !== C);
      for (const t of trains) { t.seats.fill(null); if (t !== A && t !== C) { t.st = 'garage'; t.g = 1e3; } }
      C.st = 'garage'; C.lane = -1; C.g = G_B; C.mv = 0; C.v = 0; G.dev.pos = G.dev.to = 1; G.dev.k = 1; if (RA) { G.ra.pos = G.ra.to = 1; G.ra.k = 1; }
      o.push(onCar(C) && !yardBlocks(null) ? 'carAwayFree' : 'carAwayFree:FAIL');
      G.dev.pos = G.dev.to = PC; const inl = yardBlocks(null); G.dev.pos = G.dev.to = 1; o.push(inl ? 'carInLineBlocks' : 'carInLineBlocks:FAIL');
      A.st = 'run'; A.s = (BLK.length ? BLK[BLK.length - 1] : S_BRK) - 30; A.v = 6; A.inLift = true; A.blk = false; A.inBrake = false;
      for (let i = 0; i < 12000 && !(A.v === 0 && A.s > S_BRK); i++) step(.025); for (let i = 0; i < 200; i++) step(.025);
      o.push(A.st === 'run' && A.v === 0 && Math.abs(A.s - S_PRE) < .6 && onCar(C) ? 'heldBeforeCar' : 'heldBeforeCar:FAIL(' + A.s.toFixed(1) + '/' + S_PRE.toFixed(1) + ')');
      // train ARRÊTÉ avant le pont : le chariot revient en ligne avec son train (propriétaire, 2026-11-17), le train arrêté reste retenu tant que le rail porteur est occupé
      const n0 = ($('log').textContent.match(/Dernier canton occupé/g) || []).length; act('pos', PC);
      for (let i = 0; i < 2000 && devMoving(); i++) step(.025);
      o.push(G.dev.pos === PC && C.st === 'run' && ($('log').textContent.match(/Dernier canton occupé/g) || []).length === n0 ? 'carBackStopped' : 'carBackStopped:FAIL');
      let held = true; for (let i = 0; i < 2400; i++) { step(.025); if (held === true && (onRail(C) || atAnchor(C)) && (A.v > .05 || A.s > S_PRE + .5)) held = 'moved' + i + '/' + [C.st, C.s, C.v, A.s, A.v].map(x => typeof x === 'number' ? x.toFixed(2) : x); if (held === true && C.st === 'run' && C.s > A.s && C.s - A.s < TLEN) held = 'gap' + i; }
      o.push(held === true ? 'stoppedHeld' : 'stoppedHeld:FAIL(' + held + ')'); return ' | carBlk: ' + o.join(' '); });
    man += cb; await p3.close();
    // sécurités (SITE.car.restraint) : arrivée verrouillée, ouverture au bouton, départ refusé sécurités ouvertes, verrouillage refusé portillons ouverts, verrouillage = fermeture wagon par wagon par les opérateurs puis validation
    const p4 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    p4.on('pageerror', e => errors.push(String(e.message || e)));
    await p4.goto(url); await p4.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p4.click('[data-act=closeHelp]');
    const u4 = (c, m = 4000) => p4.evaluate(([c, m]) => { const f = new Function('return ' + c); act('speed', 0); G.wx.next = 1e6; for (let i = 0; i < m; i++) { if (f()) break; step(.025); } ui(); return f(); }, [c, m]);
    const log4 = re => p4.evaluate(r => new RegExp(r).test($('log').textContent), re);
    const rs = [];
    const T0 = await p4.evaluate(() => { G.wear.chain = 0; G.wear.brake = 0; const t = trains.find(o => o.st === 'station'); t.seats = t.seats.map((_, i) => i < 2 ? { ci: 1, w: 50, on: true } : null);
      t.st = 'run'; t.s = S_ST - 3; t.v = 1; return t.i; }); // un train arrive en gare avec deux passagers
    rs.push(await u4(`trains[${T0}].st==='station'&&trains[${T0}].phase==='unload'`) && await log4('verrouillés. Ouvrez les sécurités') ? 'arriveLocked' : 'arriveLocked:FAIL');
    await u4('false', 120); rs.push(await p4.evaluate(i => count(trains[i]) === 2 && !G.resOpen, T0) ? 'noUnloadLocked' : 'noUnloadLocked:FAIL');
    await p4.click('#bAuto'); await p4.click('#bRes');
    rs.push(await u4(`trains[${T0}].phase==='board'&&count(trains[${T0}])===0&&trains[${T0}].rc.every(v=>v>.98)`) ? 'openUnload' : 'openUnload:FAIL');
    await p4.click('#bGo'); rs.push(await log4('Départ refusé : sécurités ouvertes') && await p4.evaluate(i => trains[i].st === 'station', T0) ? 'refuseDepartOpen' : 'refuseDepartOpen:FAIL');
    await p4.click('#bGate'); await p4.click('#bRes'); rs.push(await log4('fermez d.abord les portillons') && await p4.evaluate(() => G.resOpen) ? 'refuseLockGates' : 'refuseLockGates:FAIL');
    await p4.click('#bGate'); await u4('G.gate<.05', 200);
    await p4.click('#bRes'); rs.push(await p4.evaluate(i => trains[i].phase === 'check' && !G.resOpen && trains[i].rc.every(v => v > .9), T0) ? 'lockStartsCheck' : 'lockStartsCheck:FAIL');
    rs.push(await u4(`NCARS<3||(trains[${T0}].rc.some(v=>v<.05)&&trains[${T0}].rc.some(v=>v>.5))`, 2000) ? 'opsCloseByCar' : 'opsCloseByCar:FAIL');
    rs.push(await u4(`trains[${T0}].phase==='ready'`, 4000) && await p4.evaluate(i => trains[i].rc.every(v => v < .05) && OPS.every(o => o.ok), T0) ? 'validated' : 'validated:FAIL');
    await p4.click('#bGo'); rs.push(await u4(`trains[${T0}].st==='run'`, 200) ? 'depart' : 'depart:FAIL');
    man += ' | res: ' + rs.join(' '); await p4.close();
    // évacuation d'un train à quai (issue #26) : sécurités verrouillées = passagers assis, rien ne change ; sécurités ouvertes = ils descendent par la sortie (quai de débarquement, SITE.exit), train vide en gare
    const p6 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    p6.on('pageerror', e => errors.push(String(e.message || e)));
    await p6.goto(url); await p6.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p6.click('[data-act=closeHelp]');
    await p6.evaluate(INSTALL);
    const u6 = (c, m = 4000) => p6.evaluate(([c, m]) => { const f = new Function('return ' + c); act('speed', 0); G.wx.next = 1e6; for (let i = 0; i < m; i++) { if (f()) break; step(.025); if (i % 5 === 0) for (const k of G.walkers) if (k.ev) __opPt(k.x, k.z, k.kind, 'trainEvac'); } ui(); return f(); }, [c, m]);
    const es = [], ek = (n, v) => es.push(n + (v ? '' : ':FAIL'));
    const E = await p6.evaluate(() => { G.wear.chain = 0; G.wear.brake = 0; G.wear.track = 0; __op.bad = 0; const t = trains.find(o => o.st === 'station'); if (!t) return -1;
      t.phase = 'board'; G.resOpen = false; t.seats = t.seats.map((_, i) => i < Math.min(4, SEATS) ? { ci: 2, w: 60, on: true } : null); return t.i; });
    if (E >= 0) {
      const T = `trains[${E}]`, n0 = await p6.evaluate(T => count(eval(T)), T);
      await u6('false', 2); const dis = await p6.evaluate(() => G.queue.length || $('bEvac').disabled); await p6.evaluate(() => act('evac')); await u6('false', 300);
      ek('lockedStay', dis && await p6.evaluate(([T, n0]) => count(eval(T)) === n0 && !eval(T).evq && eval(T).st === 'station' && !G.walkers.some(k => k.ev), [T, n0]));
      await p6.click('#bRes'); await u6(`${T}.rc.every(v=>v>.98)`, 400);
      const m0 = await p6.evaluate(() => [G.stats.riders, Math.round(G.money)]);
      await p6.click('#bEvac'); ek('emptied', await u6(`count(${T})===0&&!${T}.evq`, 2000) && await p6.evaluate(T => eval(T).st === 'station' && G.walkers.filter(k => k.ev).length > 0, T));
      ek('outByExit', await u6(`!G.walkers.some(k=>k.ev&&k.i<=k.pe)`, 4000));
      ek('noIncome', await p6.evaluate(m0 => G.stats.riders === m0[0] && Math.round(G.money) <= m0[1], m0));
      const ob = await p6.evaluate(() => __op.bad); ek('onPaths' + (ob ? '=' + ob : ''), ob === 0);
    } else es.push('noTrainInStation');
    man += ' | trainEvac: ' + es.join(' '); await p6.close();
    // règle de départ (propriétaire, 2026-11-15) : appareil de voie hors de P, départ autorisé seulement si une zone de freinage peut retenir le train avant l'appareil
    const p5 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    p5.on('pageerror', e => errors.push(String(e.message || e)));
    await p5.goto(url); await p5.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p5.click('[data-act=closeHelp]');
    const u5 = (c, m = 4000) => p5.evaluate(([c, m]) => { const f = new Function('return ' + c); act('speed', 0); G.wx.next = 1e6; for (let i = 0; i < m; i++) { if (f()) break; step(.025); } ui(); return f(); }, [c, m]);
    const log5 = re => p5.evaluate(r => new RegExp(r).test($('log').textContent), re);
    const ds = [], dk = (n, v) => ds.push(n + (v ? '' : ':FAIL'));
    const D = await p5.evaluate(() => { G.wear.chain = 0; G.wear.brake = 0; G.wear.track = 0; return { ra: TRAV && RA, at: HOLD_Z, trav: TRAV, k: trains.findIndex(t => t.st === 'station') }; });
    if (D.k >= 0) {
      const off = D.ra ? '#yA1' : '#y1', on = D.ra ? '#yA0' : '#yP', T = `trains[${D.k}]`;
      await p5.click(off); dk('devOff', await u5(D.ra ? 'raOut()' : 'devOn(0)', 800));
      await p5.click('#bGo');
      if (D.at === 'St') { /* la gare est la dernière zone d'attente avant l'appareil (HOLD_Z) : départ refusé */ await u5('false', 400); dk('refuseNoBrake', await log5('ne peut pas partir : .* hors de P, aucune zone de freinage') && await p5.evaluate(T => eval(T).st === 'station', T)); }
      else {
        dk('departOk', await u5(`${T}.st==='run'&&${T}.s>S_ST+TLEN`, 4000));
        const hs = D.trav ? 'S_PRE' : 'HOLD_S'; /* retenu avant le chariot (pont droit) ou à la dernière zone d'attente avant l'appareil */
        dk('heldBefore', await u5(`${T}.v===0&&Math.abs(${T}.s-${hs})<.6`, 30000) && await p5.evaluate(T => eval(T).st === 'run', T));
        await u5('false', 200); dk('stillHeld', await p5.evaluate(([T, hs]) => eval(T).v === 0 && Math.abs(eval(T).s - eval(hs)) < .6, [T, hs]));
        await p5.click(on); dk('released', await u5(`${T}.st==='station'||${T}.s>${hs}+3`, 12000));
      }
    }
    man += ' | dep: ' + ds.join(' '); await p5.close();
  }
  // issue #37 : barrières indépendantes posées à la main (GAME.barriers 'b<n>') ; une barrière fermée bloque : personne ne la franchit (file, entrée, évacuation),
  // fourche : autre chemin pris ou attente ; pendant une évacuation, personne n'entre ni n'avance vers la gare ; l'évacué arrêté repart quand on l'ouvre
  {
    const p7 = await browser.newPage(); p7.on('pageerror', e => errors.push(String(e.message || e)));
    await p7.goto(url); await p7.waitForFunction(() => typeof act === 'function' && (act('help'), true)); await p7.click('[data-act=closeHelp]');
    const bt = await p7.evaluate(() => {
      const R = [], ck = (n, v) => R.push(n + (v ? '' : ':FAIL'));
      act('speed', 0); G.wx.next = 1e6; G.crowd = 3; if (!G.open) act('open');
      const across = (e, d, open) => { let i = 1; while (i < e.P.length - 1 && e.C[i] < d) i++; const a = e.P[i - 1], b = e.P[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, k = (d - e.C[i - 1]) / l, tx = (b[0] - a[0]) / l, tz = (b[1] - a[1]) / l, c = [a[0] + tx * l * k, a[1] + tz * l * k];
        return { x: +(c[0] - tz * 1.3).toFixed(2), z: +(c[1] + tx * 1.3).toFixed(2), ang: +(Math.atan2(-tx, tz) * 180 / Math.PI).toFixed(1), len: 2.6, open: !!open }; };
      const set = B => { GM.barriers = B; reGates(); };
      let viol = 0; const prev = new Map(), mon = () => { for (const v of G.queue) { if (v.mode !== 'q') continue; const o = prev.get(v), dl = v.e.len - v.r;
          if (o) for (const x of o.e.bx) if (!x.b.open && o.dl < x.d - 1e-6 && (v.e !== o.e || dl > x.d + 1e-6)) viol++;
          prev.set(v, { e: v.e, dl }); } };
      // overlapQ devant une barrière fermée (issue #40) : visiteurs de file, arrivants arrêtés et évacués arrêtés, à moins de QPW (même niveau), relevé toutes les 20 itérations
      let ovB = 0, ovBn = 0; const ovBEx = [], ovb = () => { const W = G.queue.filter(v => v.mode === 'q' || !v.mv).map(v => [v.x, v.z, v.lv | 0, v.mode]);
          for (const k of G.walkers) if (k.kind === 'evac' && k.bk) W.push([k.x, k.z, 0, 'evac']); ovBn = Math.max(ovBn, W.length);
          for (let a = 0; a < W.length; a++) for (let c = a + 1; c < W.length; c++) if (W[a][2] === W[c][2] && Math.hypot(W[a][0] - W[c][0], W[a][1] - W[c][1]) < QPW) { ovB++; if (ovBEx.length < 3) ovBEx.push([+W[a][0].toFixed(1), +W[a][1].toFixed(1), W[a][3] + '/' + W[c][3], it7]); } };
      let it7 = 0; const run = (n, f) => { for (let i = 0; i < n; i++) { step(.05); mon(); if (f) f(); if (++it7 % 20 === 0) ovb(); } };
      const B0 = JSON.parse(JSON.stringify(GM.barriers || {}));
      set({}); run(4000); // file remplie, sans barrière
      const e = SEG_IN, d = Math.min(e.len * .5, 12);
      set({ b1: across(e, d) }); run(1200);
      ck('blocked', viol === 0); ck('waitBefore', G.queue.some(v => v.mode === 'q' && v.e === e && e.len - v.r < d && e.len - v.r > d - 1.5));
      set({ b1: across(e, .1) }); const inQ = new Set(G.queue.filter(v => v.mode === 'q')); let ent = 0; run(4000, () => { for (const v of G.queue) if (v.mode === 'q' && !inQ.has(v)) { ent++; inQ.add(v); } });
      ck('entryShut', ent === 0 && viol === 0 && G.queue.some(v => v.mode === 'app'));
      if (LOOPS.length) { const l = LOOPS[0];
        set({ b1: across(l.short, Math.min(.5, l.short.len / 2)) }); ck('otherWay', l.r === l.loop);
        set({ b1: across(l.short, Math.min(.5, l.short.len / 2)), b2: across(l.loop, Math.min(.5, l.loop.len / 2)) }); ck('forkShortest', l.r === l.short); // aucun trajet ouvert : le plus court, arrêt devant la barrière
        run(1200); ck('forkBlocked', viol === 0); }
      // barrières de l'attraction (GAME.barriers) toutes fermées 200 s de jeu, puis rouvertes : arrivants en file devant elles, repartis ensuite
      set(B0); for (const g of BARS) g.open = false; qRoute(); run(4000); const nW = G.queue.filter(v => v.mode === 'app' && !v.mv).length;
      for (let i = 0; i < BARS.length; i++) toggleBar(i); run(400); ck('lineGo', !nW || G.queue.some(v => v.mode === 'q' || v.mv));
      // évacuation : barrière fermée au milieu du premier tronçon, file remplie au-delà
      set({}); run(2000); set({ b1: across(e, d) }); const qd = G.queue.filter(v => v.mode === 'q' && e.len - v.r > d + .5 || v.mode === 'q' && v.e !== e).length;
      act('evac'); let adv = 0, cross = 0; const wp = new Map(), b = BARS[0];
      run(800, () => { if (evacOn()) { if (G.queue.some(v => v.mode === 'q')) adv++; }
        for (const k of G.walkers) if (k.kind === 'evac') { const o = wp.get(k); if (o && segX(o, [k.x, k.z], b.H, b.A) != null && !b.open) cross++; wp.set(k, [k.x, k.z]); } });
      const held = G.walkers.filter(k => k.kind === 'evac' && k.bk).length;
      ck('evacHeld' + (qd ? '' : '(vide)'), cross === 0 && (held > 0 || !qd)); ck('evacNoAdvance', adv === 0);
      toggleBar(0); run(1200); ck('evacResume', !G.walkers.some(k => k.kind === 'evac' && k.bk));
      set(B0); ck('overlapQ=' + ovB + (ovB ? ' ex ' + JSON.stringify(ovBEx) : '') + ' (max ' + ovBn + ')', ovB === 0); return R.join(' ');
    });
    man += ' | bars: ' + bt; await p7.close();
  }
  // issue #34 / #37 : file déduite des chemins OSM (SITE.queue.ways) ou écrite à la main (SITE.queue.parts) ; anciennes clés GAME.barriers converties (lues, jamais réécrites)
  const qa = await page.evaluate(() => { const A = QS.auto || {};
    return (A.used ? 'auto(' + A.forks.join(',') + (A.dir ? '' : ', sens déduit') + ')' : 'manuel') + ' bars=' + BARS.length + ' (' + BARS.filter(b => b.from).length + ' converties)'; });
  man += ' | queue=' + qa;
  await page.evaluate(INSTALL); // contrôle offpath : visiteurs hors des chemins (tools/offpath.js)
  const r = await page.evaluate(() => {
    act('speed', 0); G.wx.next = 1e6; __opStroll();
    if (!G.open) act('open');
    let it = 0, opened = null, gp = 0;
    let rp = 0, ev = null, evN = 0, zMax = 0, ovQ = 0, ovA = 0, passQ = 0, jumpQ = 0, directQ = 0; const passEx = []; const ovEx = []; const evBad = [];
    const press = () => { ui(); $('bGate').click(); gp++; }; // le joueur ouvre et ferme les portillons au bouton du pupitre
    const pressRes = () => { ui(); $('bRes').click(); rp++; }; // et les sécurités : ouvrir à l'arrivée, verrouiller portillons fermés (les opérateurs les ferment et les vérifient)
    const p0 = G.played; let tPrev = G.time, wraps = 0; // jeu continu : 9 h de jeu simulées (ancienne journée 10:00-19:00)
    for (; it < 400000 && G.played - p0 < 540; it++) {
      step(.025); if (G.time < tPrev) wraps++; tPrev = G.time;
      if (it % 5 === 0) __opSample();
      if (it === 9000 || it === 22000) { // évacuation de la file en pleine journée, visiteurs des portillons compris (issue #21)
        ev = { it, plat: G.plat.filter(r => r), res: (G.platR || []).filter(r => r), wait: G.walkers.filter(k => k.kind === 'wait'), n0: G.plat.filter(r => r).length + (G.platR || []).filter(r => r && r.on).length + G.walkers.filter(k => k.kind === 'wait').length }; act('evac');
        ev.w = G.walkers.filter(k => k.kind === 'evac' && k.pe); evN += ev.n0; }
      if (ev && it === ev.it + 1600) { // 40 s de jeu plus tard : travées et couloir d'attente vidés des évacués (nouveaux venus exclus), évacués sortis du quai
        const left = ev.plat.filter(r => G.plat.includes(r)).length + ev.res.filter(r => (G.platR || []).includes(r)).length + ev.wait.filter(k => G.walkers.includes(k)).length + ev.w.filter(k => G.walkers.includes(k) && k.i <= k.pe).length;
        if (left) evBad.push(ev.it + ':' + left + '/' + ev.n0); ev = null; }
      if (it === 14000) for (const v of G.queue) if (Math.random() < .5) v.pat = 0; // abandons dans toute la file
      for (const k of G.walkers) if (k.kind === 'wait' && !k.pq) { // passQ (issue #44) : à son départ, un arrivant dont la place est devant quelqu'un qui attend déjà dans sa colonne de travée (même abscisse) qu'il a dû dépasser (plus en arrière que sa place, plus en avant que son départ)
        k.pq = 1; const e = k.pts[k.pts.length - 1], b0 = latP(k.pts[0]), W = []; G.plat.forEach((r, i) => { if (r) W.push(slotPos(i)); }); (G.platR || []).forEach((r, j) => { if (r && BRES[j]) W.push(BRES[j]); });
        if (W.some(q => sameCol(q, e) && latP(q) > latP(e) + .05 && latP(q) < b0 - .05)) { passQ++; if (passEx.length < 4) passEx.push([+e[0].toFixed(1), +e[2].toFixed(1)]); } }
      for (const k of G.walkers) if (k.kind === 'wait' && !k.jq) { // jumpQ (issue #44, 23/11) : arrivant de la file qui obtient une place de portillon alors que quelqu'un attend déjà en réserve (toutes travées) ou à un rang plus en arrière de sa colonne
        k.jq = 1; const e = k.pts[k.pts.length - 1], o = k.pts[0], near = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]) < .05;
        const own = G.plat.some((r, i) => near(slotPos(i), o)) || BRES.some(q => near(q, o)); // déplacement interne (réserve, rang) : pas un arrivant
        const seat = G.plat.findIndex((r, i) => r && near(slotPos(i), e));
        if (!own && seat >= 0 && ((G.platR || []).some(r => r) || G.plat.some((r, i) => r && i !== seat && sameCol(slotPos(i), e) && latP(slotPos(i)) > latP(e) + .05))) jumpQ++;
        else if (!own && seat >= 0 && BRES.length && G.platR.some(r => !r)) directQ++; } // directQ (issue #44, 23/11) : arrivant qui va droit à un portillon alors que la réserve a de la place (il doit d'abord entrer dans la zone d'attente)
      if (it % 200 === 0 && it > 4000) { // overlapQ (issue #28) : paires de visiteurs de file (allées, fourches, escaliers, passerelles ; même niveau) et des travées / réserve à moins d'une épaisseur dessinée (QPW)
        const W = G.queue.filter(v => v.mode === 'q').map(v => [v.x, v.z, v.lv | 0]); G.plat.forEach((r, i) => { if (r && r.on) { const q = slotPos(i); W.push([q[0], q[2], 'p', 'slot']); } }); (G.platR || []).forEach((r, j) => { if (r && r.on && BRES[j]) W.push([BRES[j][0], BRES[j][2], 'p', 'res']); });
        for (const k of G.walkers) if (k.kind === 'wait' && k.i > 1 && k.i < k.pts.length) W.push([k.x, k.z, 'p', 'walk' + (k.pts.length - k.i)]); // issue #44 : visiteurs qui gagnent leur place sur le quai, comptés contre ceux qui attendent (jamais au travers ni par-dessus eux), pas entre eux (en marche)
        for (let a = 0; a < W.length; a++) for (let b = a + 1; b < W.length; b++) if (W[a][2] === W[b][2] && !(/^walk/.test(W[a][3]) && /^walk/.test(W[b][3])) && Math.hypot(W[a][0] - W[b][0], W[a][1] - W[b][1]) < QPW) { ovQ++; if (ovEx.length < 4) ovEx.push([+W[a][0].toFixed(1), +W[a][1].toFixed(1)].concat(W[a][3] ? [W[a][3] + '/' + W[b][3]] : [])); }
        const A = G.queue.filter(v => v.mode === 'app' && !v.mv); for (let a = 0; a < A.length; a++) for (let b = a + 1; b < A.length; b++) if (Math.hypot(A[a].x - A[b].x, A[a].z - A[b].z) < QPW) ovA++; } // arrivants arrêtés devant la barrière d'entrée : relevé seulement
      if (it % 40) continue;
      if (BAREA) zMax = Math.max(zMax, G.plat.filter(r => r && r.on).length + G.platR.filter(r => r && r.on).length); // zone d'attente éditée : visiteurs qui y attendent (issue #24)
      const u = trains.find(t => t.st === 'station' && t.phase === 'unload' && count(t));
      if (u && !G.resOpen) pressRes(); // arrivée : sécurités verrouillées tant que le joueur ne les ouvre pas
      const h = trains.find(t => t.st === 'station' && t.phase === 'board' && t.hs);
      if (h && G.resOpen && !G.gatesOpen && G.gate < .05) pressRes(); // train hors service vidé : verrouiller pour qu'il reparte au garage
      const s = trains.find(t => t.st === 'station' && t.phase === 'board' && !t.hs);
      if (s) { if (!G.gatesOpen && opened !== s && !s.depReq) { if (!G.resOpen) pressRes(); press(); opened = s; }
        else if (G.gatesOpen && (s.depReq || count(s) === SEATS)) press();
        else if (!G.gatesOpen && G.gate < .05 && opened === s && (G.resOpen || s.rcT) && (s.depReq || count(s) === SEATS)) pressRes(); }
      else { if (G.gatesOpen) press(); if (!trains.some(t => t.st === 'station')) opened = null; }
      if (G.liftBroken) act('job', 'liftFix');
      if (G.brakeFault) act('job', 'brakeFix');
      trains.forEach((t, i) => { if (t.fault === 'lapbars') act('rearm', i); });
    }
    const s = G.stats || {};
    return { done: G.played - p0 >= 540 && !G.over && $('mBil').classList.contains('hidden'), wraps, it, gp, rp, time: G.time, riders: s.riders, disp: s.disp, money: Math.round(G.money), off: __op.bad, offN: __op.n, strollQ: __op.strollQ, offBy: __op.byKind, offEx: __op.ex.slice(0, 6), evN, evBad, zMax, ovQ, ovA, ovEx, passQ, passEx, jumpQ, directQ, zSeats: SEATS, zRes: BAREA ? BRES.length : 0 };
  });
  await page.evaluate(() => { cam.g = null; for (let i = 0; i < 4; i++) render(.05); });
  await page.screenshot({ path: `/tmp/t1/${site}.png` });
  await browser.close();
  const ok = r.done && errors.length === 0 && r.riders > 0 && !/FAIL/.test(man) && r.off <= 2 && r.strollQ === 0 && !r.evBad.length && r.ovQ === 0 && r.passQ === 0 && r.jumpQ === 0 && r.directQ === 0;
  console.log(`site ${site}${build ? ' (build)' : ''}: 9h done=${r.done} (clock wraps=${r.wraps}) after ${r.it} steps, gate presses=${r.gp}, restraint presses=${r.rp}`);
  console.log(`riders=${r.riders} dispatches=${r.disp} money=${r.money}`);
  console.log(`offpath=${r.off} (sur ${r.offN} positions) strollQ=${r.strollQ} overlapQ=${r.ovQ}${r.ovQ ? ' ex ' + JSON.stringify(r.ovEx) : ''} (arrivants ${r.ovA}) jumpQ=${r.jumpQ} directQ=${r.directQ} passQ=${r.passQ}${r.passQ ? ' ex ' + JSON.stringify(r.passEx) : ''} evacPlat=${r.evBad.length ? 'FAIL ' + r.evBad.join(',') : 'ok'} (${r.evN} aux portillons)` + (r.zRes ? ` zone=${r.zMax} (${r.zSeats} places aux portillons + réserve ${r.zRes})` : '') + (r.off ? ' -> ' + JSON.stringify(r.offBy) + ' ex ' + JSON.stringify(r.offEx) : ''));
  console.log(`manoeuvre: ${man}`);
  console.log(`page errors=${errors.length}` + (errors.length ? ' -> ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log('FAIL: ' + e.message); process.exit(1); });
