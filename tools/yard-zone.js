// Essai du garage branché sur une zone d'attente quelconque (issue #36) : node tools/yard-zone.js <site> <zone> (ex. goudurix B1, hourra B2, hourra Fin).
// Aiguillage EN AMONT (issue #38) : node tools/yard-zone.js <site> <zone> back (ex. goudurix B1 back, hourra B3 back) : SITE.yard.back posé en mémoire en amont du point d'arrêt
// de la zone, roues de propulsion de la zone avec marche arrière (SITE.zones.<zone>.drive:true) ; sortie en marche avant, retenue avant l'appareil, entrée en marche arrière (AR), refus ;
// la même zone en marche avant seule (drive:'fwd') doit être refusée au chargement.
// SITE.yard est remplacé EN MÉMOIRE (aucun fichier de site modifié) par un aiguillage en aval du point d'arrêt de la zone, voie droite ESTIMÉE ; 3 trains, bac à sable.
const {chromium}=require('playwright');
const SITE_ID=process.argv[2]||'goudurix',ZONE=process.argv[3]||'B1',BACK=process.argv[4]==='back';
(async()=>{const b=await chromium.launch();const errs=[];
 const url='file://'+require('path').resolve(__dirname,'..')+'/jeu.html?type=parc&lieu=asterix&el='+SITE_ID+'&mode=sandbox';
 // 1) géométrie du circuit au point d'arrêt de la zone (jeu d'origine)
 let p=await b.newPage();await p.goto(url);await p.waitForFunction(()=>typeof act==='function');
 const geo=await p.evaluate(([z,bk])=>{const a=TLEN+3,s=bk?zStop(z)-a-6:zStop(z)+.8,f=frameAt(s,mkF()),l=Math.hypot(f.R.x,f.R.z);return {a,x:f.p.x,z:f.p.z,tx:f.T.x,tz:f.T.z,rx:f.R.x/l,rz:f.R.z/l};},[ZONE,BACK]);await p.close();
 const side=-1,gx=side*geo.rx,gz=side*geo.rz,dir=BACK?-1:1,P0=[geo.x+dir*geo.tx*14+gx*4.5,geo.z+dir*geo.tz*14+gz*4.5],P1=[P0[0]+dir*geo.tx*45,P0[1]+dir*geo.tz*45];
 const yard=BACK?{at:ZONE,device:'switch',back:true,a:geo.a,b:geo.a+6,slide:3.4,side,len:8.6,lanes:[{name:'Garage essai',pts:[P0,P1]}],move:{v:2.4,t:3}} // ESTIMÉ, essai seulement
  :{at:ZONE,device:'switch',a:.8,b:6.4,slide:3.4,side,len:8.6,lanes:[{name:'Garage essai',pts:[P0,P1]}],move:{v:2.4,t:3}};
 if(BACK){ // refus au chargement : zone en marche avant seule
  const q=await b.newPage(),e2=[];q.on('pageerror',e=>e2.push(e.message));
  await q.addInitScript(([Y,z])=>{const ap=Node.prototype.appendChild;Node.prototype.appendChild=function(n){if(n&&n.tagName==='SCRIPT'&&/engine\/core\.js$/.test(n.src)){const S=(0,eval)('SITE');S.yard=Y;S.zones=Object.assign({},S.zones,{[z]:Object.assign({},(S.zones||{})[z],{drive:'fwd'})});}return ap.call(this,n);};},[yard,ZONE]);
  await q.goto(url);await q.waitForTimeout(800);await q.close();
  if(!e2.some(m=>/drive:true/.test(m))){console.log('FAIL fwdOnlyNotRefused',e2.join(' | '));await b.close();process.exit(1);}
 }
 // 2) jeu avec SITE.yard remplacé juste avant le chargement du moteur
 p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
 await p.addInitScript(Y=>{const ap=Node.prototype.appendChild;Node.prototype.appendChild=function(n){if(n&&n.tagName==='SCRIPT'&&/engine\/core\.js$/.test(n.src)){const S=(0,eval)('SITE');S.yard=Y;if(Y.back)S.zones=Object.assign({},S.zones,{[Y.at]:Object.assign({},(S.zones||{})[Y.at],{drive:true})});delete S.holdBack;S.trains=S.trains.slice(0,3);delete S.maxRun;}return ap.call(this,n);};},yard);
 await p.goto(url);await p.waitForFunction(()=>typeof act==='function'&&typeof G!=='undefined');
 await p.evaluate(()=>{act('help');});await p.click('[data-act=closeHelp]');
 const R=await p.evaluate(()=>{
  const out=[],ok=(n,v)=>out.push(n+(v?'':':FAIL'));act('speed',0);G.wx.next=1e6;
  const cars=t=>{const a=[],f=mkF();for(let k=0;k<NCARS;k++){carFrame(t,k,f);a.push([f.p.x,f.p.z,f.p.y]);}return a;};
  let minD=1e9,minW='';
  const coll=()=>{const P=t=>{const f=mkF();carFrame(t,0,f);return f.p;};for(let i=0;i<trains.length;i++)for(let j=i+1;j<trains.length;j++){const A=cars(trains[i]),B=cars(trains[j]);for(const a of A)for(const q of B){const d=Math.hypot(a[0]-q[0],a[1]-q[1],a[2]-q[2]);if(d<minD){minD=d;minW=out.join(' ').split(' ').pop()+' '+trains.map(t=>t.st+':'+(t.st==='run'?t.s.toFixed(1)+'@'+t.v.toFixed(1):t.lane+'/'+t.g.toFixed(1)+'/'+t.mv)+':'+t.phase).join(' ')+' dev'+G.dev.pos+G.dev.to;}}}};
  const until=(f,m)=>{for(let i=0;i<m;i++){if(f())return true;step(.025);if(i%4===0)coll();}ui();return f();};
  const click=id=>{const e=document.getElementById(id.slice(1));if(!e)throw new Error('pas de bouton '+id);e.click();};
  const logHas=r=>new RegExp(r).test($('log').textContent);
  G.wear.chain=0;G.wear.brake=0;G.wear.track=0;
  if(LBK)return backTest(out,ok,until,click,logHas,coll,()=>({minD,minW}));
  ok('zone'+YZ,YZ===SITE.yard.at&&CARR===YZ&&HOLD_Z===YZ&&Math.abs(ANCH-zStop(YZ))<1e-9);
  const T0=trains[0],T1=trains[1];
  ok('init',T0.st==='station'&&T1.st==='garage');
  // sortie : appareil sur la voie 1, Dispatch → le train garé revient sur la zone, arrêté
  click('#y1');ok('dev1',until(()=>devOn(0),400));
  click('#zL1_d');const X=trains.find(t=>t.st==='garage'&&t.mv<0)||X;ok('outMoving',X.mv<0);
  ok('outOnZone',until(()=>X.st==='run'&&X.v===0&&Math.abs(X.s-ANCH)<.4,4000)&&logHas('est revenu sur '));
  until(()=>false,200);ok('heldDevOff',X.st==='run'&&X.v===0&&Math.abs(X.s-ANCH)<.4); // retenu : appareil hors de P
  act('zone',YZ+':m');act('zone',YZ+':k');ok('refuseRelease',logHas('relâchement refusé')||logHas('hors de P'));act('zone',YZ+':m');
  click('#yP');ok('devP',until(()=>!devOff(),400));
  ok('released',until(()=>X.st==='run'&&X.s>ANCH+TLEN,3000));
  ok('reachesFinOrStation',until(()=>(X.st==='run'&&X.v===0&&Math.abs(X.s-S_HOLD)<.5)||X.st==='station',20000));
  // entrée : train vide de la gare (moteurs de gare) retenu sur la zone (appareil hors de P), puis Dispatch vers la voie
  ok('stationFree',until(()=>trains.some(t=>t.st==='station'&&t.phase==='board')&&!devLock(),20000));
  const D=trains.find(t=>t.st==='station');click('#y1');ok('dev1b',until(()=>devOn(0),400));
  if(D.st==='station'&&!D.depReq)act('zone','St:f');ok('departEmpty',until(()=>D.st==='run'&&D.s>S_ST+TLEN,8000)&&!count(D));
  const dbg=()=>trains.map(t=>t.st+':'+(t.st==='run'?t.s.toFixed(1)+'@'+t.v.toFixed(1):t.lane)+':'+t.phase).join(' ');const atZ=t=>t.st==='run'&&t.v===0&&Math.abs(t.s-ANCH)<.4;ok('heldOnZone',until(()=>trains.some(atZ),40000)&&devOn(0));const E=trains.find(atZ)||D;until(()=>false,400);ok('stillHeld',atZ(E));
  act('zone',YZ+':m');act('zone',YZ+':f');ok('avRefused',logHas('freins serrés, relâchez'));act('zone',YZ+':k');ok('relRefused',logHas('relâchement refusé.*hors de P'));G.zk[YZ]=false;act('zone',YZ+':f');ok('avToLane',logHas('entre au garage au bouton Dispatch'));act('zone',YZ+':m');
  click('#zL1_d');ok('inMoving',E.st==='garage'&&E.mv>0);
  ok('parked',until(()=>E.st==='garage'&&!E.mv,4000)&&fwdLim(E)-E.g<.05);
  click('#yP');ok('devP2',until(()=>!devOff(),400));
  // exploitation automatique 5 min de jeu, appareil sur P : aucune collision
  act('zone','Fin:m');if(G.zm.Fin)act('zone','Fin:m');
  until(()=>false,12000);
  ok('runs',trains.some(t=>t!==E&&(t.st==='run'||t.st==='station')));
  return {steps:out.join(' '),minD:+minD.toFixed(2),minW,CAR,ANCH:+ANCH.toFixed(1),SW_A:+SW_A.toFixed(1),hold:HOLD_Z};
 function backTest(out,ok,until,click,logHas,coll,md){ // aiguillage en amont de la zone (issue #38)
  const atZ=t=>t.st==='run'&&t.v===0&&Math.abs(t.s-ANCH)<.4,fin=()=>{const m=md();return {steps:out.join(' '),minD:+m.minD.toFixed(2),minW:m.minW,ANCH:+ANCH.toFixed(1),SW_A:+SW_A.toFixed(1),SW_B:+SW_B.toFixed(1),hold:HOLD_Z};};
  ok('zone'+YZ,LBK&&YZ===SITE.yard.at&&CARR===YZ&&HOLD_Z!==YZ&&SW_B<ANCH-TLEN&&ZONES.find(o=>o.id===YZ).drive===true&&!!document.getElementById('z'+YZ+'_b'));
  const T1=trains[1];ok('init',trains[0].st==='station'&&T1.st==='garage');
  // sortie : appareil sur la voie, Dispatch → le train garé avance jusqu'au point d'arrêt de la zone (devant l'appareil), puis la zone le relâche selon ses règles
  click('#y1');ok('dev1',until(()=>devOn(0),400));
  click('#zL1_d');const X=trains.find(t=>t.st==='garage'&&t.mv<0)||T1;ok('outMoving',X.st==='garage'&&X.mv<0);
  ok('outOnZone',until(()=>X.st==='run'&&Math.abs(X.s-ANCH)<.6,6000)&&logHas('est revenu sur '));
  click('#yP');ok('devP',until(()=>!devOff(),2000));
  ok('released',until(()=>X.st==='run'&&X.s>ANCH+TLEN,6000));
  // retenue : appareil hors de P, le train suivant reste à la dernière zone d'attente avant l'appareil (gare : départ refusé)
  ok('devFree',until(()=>!devLock(),20000));click('#y1');ok('dev1b',until(()=>devOn(0),400));
  if(HOLD_Z==='St'){const D=trains.find(t=>t.st==='station');ok('departRefused',until(()=>D.phase==='board',8000)&&(act('zone','St:f'),logHas('aucune zone de freinage')));}
  else{ok('heldBefore',until(()=>trains.some(t=>t.st==='run'&&t.v===0&&Math.abs(t.s-HOLD_S)<.5),40000));until(()=>false,600);
   ok('stillHeld',trains.some(t=>t.st==='run'&&t.v===0&&Math.abs(t.s-HOLD_S)<.5)&&!trains.some(t=>t.st==='run'&&dnS(HOLD_S,t.s)>.6&&dnS(HOLD_S,t.s)<dnS(HOLD_S,SW_B)+TLEN));
   act('zone',HOLD_Z+':m');act('zone',HOLD_Z+':k');act('zone',HOLD_Z+':k');act('zone',HOLD_Z+':f');ok('releaseRefused',logHas('hors de P'));act('zone',HOLD_Z+':m');}
  click('#yP');ok('devP2',until(()=>!devOff(),2000));
  // entrée : zone en MANU, un train vide s'y arrête (appareil sur P), appareil sur la voie, refus (freins serrés, appareil sur P), puis AR = recul vers le garage
  if(!G.zm[YZ])act('zone',YZ+':m');if(!G.zk[YZ])act('zone',YZ+':k'); // MANU, freins serrés : le train s'y arrête
  for(const t of trains)if(t.st==='station')t.seats.fill(null);G.queue.length=0;
  const E=(()=>{let e=null;until(()=>{const d=!trains.some(t=>t.st==='run')&&trains.find(t=>t.st==='station'&&t.phase==='board'&&!t.depReq);if(d){d.seats.fill(null);if(G.gatesOpen)act('gate');if(!resShut(d))click('#bRes');act('zone','St:f');}e=trains.find(atZ);return !!e&&trains.every(t=>t===e||t.st!=='run');},60000);return e;})();ok('stopAtZone',!!E);if(!E){out.push('DBG zm='+G.zm[YZ]+' zk='+G.zk[YZ]+' '+trains.map(t=>t.st+':'+t.s.toFixed(1)+'@'+t.v.toFixed(1)+':'+t.phase+':'+count(t)).join(' ')+' LOG '+$('log').textContent.slice(-600));return fin();}
  ok('empty',!count(E)||(E.seats.fill(null),true));
  G.zk[YZ]=false;act('zone',YZ+':b');ok('arRefusedOnP',logHas('marche arrière vers le garage seulement'));
  ok('devFree2',until(()=>!devLock(),20000));click('#y1');ok('dev1c',until(()=>devOn(0),400));
  G.zk[YZ]=true;act('zone',YZ+':b');ok('arRefusedBrakes',logHas('freins serrés, relâchez'));G.zk[YZ]=false;
  act('zone',YZ+':b');ok('inMoving',E.st==='garage'&&E.mv>0);
  ok('reverses',until(()=>E.st==='garage'&&E.g>YD.a+2,4000));
  ok('parked',until(()=>E.st==='garage'&&!E.mv,6000)&&fwdLim(E)-E.g<.05);
  click('#yP');ok('devP3',until(()=>!devOff(),400));act('zone',YZ+':m');
  until(()=>false,12000);ok('runs',trains.some(t=>t!==E&&(t.st==='run'||t.st==='station')));
  return fin();}
 });
 console.log(SITE_ID,ZONE,JSON.stringify(R));console.log('errors='+errs.length,errs.slice(0,3).join(' | '));
 const pass=!/FAIL/.test(R.steps)&&!errs.length&&R.minD>2;console.log(pass?'PASS':'FAIL');await b.close();process.exit(pass?0:1);
})();
