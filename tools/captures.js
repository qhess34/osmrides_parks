#!/usr/bin/env node
/* Captures des tutoriels (img/tutos/*.jpg, JPEG < 120 Ko, dsf 1) sur de vraies parties : NODE_PATH=$(npm root -g) node tools/captures.js
   Scénarios : Zeus (pupitre, quai, portillons, lapbars, lift, file), Hourra (zones), 4 garages, mobile, Nouvelle partie. À relire si un libellé change. */
const { chromium, devices } = require('playwright');
const fs=require('fs'),path=require('path'),ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'img/tutos');fs.mkdirSync(OUT,{recursive:true});
const U=s=>'file://'+ROOT+'/jeu.html?type=parc&lieu=asterix&el='+s;
const Q=70;
async function open(b,site,vp,extra='',syn='0'){
  const ctx=await b.newContext(vp);const p=await ctx.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push(String(e.message)));
  await p.addInitScript(v=>{try{localStorage.setItem('t2z.syn',v)}catch(e){}},syn);await p.addInitScript(()=>{try{for(const k of Object.keys(localStorage))if(k.startsWith('t2z.save.'))localStorage.removeItem(k);}catch(e){}});
  await p.goto(U(site)+extra);await p.waitForFunction(() => typeof act === 'function' && (act('help'), true));await p.click('[data-act=closeHelp]');
  return p;}
const run=(p,n)=>p.evaluate(n=>{act('speed',0);G.wx.next=1e6;for(let i=0;i<n;i++)step(.05);ui();},n);
const cam=async(p,k,s)=>{await p.evaluate(([k,s])=>{G.roofOff=true;if(k==='yard'){cam.key='';cam.follow=-1;cam.g={x:SW0.x+SW0.tx*10-SW0.vx*10,z:SW0.z+SW0.tz*10-SW0.vz*10,s:s||10};}else setCam(k);if(s)cam.g.s=s;for(let i=0;i<40;i++)render(.05);},[k,s]);};
const log=p=>p.evaluate(()=>$('log').textContent.slice(-300));
async function save(p,name,o={}){const f=OUT+'/'+name+'.jpg';await p.screenshot({path:f,type:'jpeg',quality:o.q||Q,...(o.clip?{clip:o.clip}:{})});console.log(name,(fs.statSync(f).size/1024).toFixed(0)+' Ko');}
(async()=>{const b=await chromium.launch();
 const D={viewport:{width:1100,height:690},deviceScaleFactor:1};
 // 1 premiers pas (Zeus)
 let p=await open(b,'zeus',D,'','1');
 await save(p,'01-pupitre');await p.click('#bSyn');
 await p.click('#bOpen');await run(p,2400);
 console.log('after open',await log(p));
 await cam(p,'gare',22);await save(p,'02-quai');
 await p.click('#bRes');await p.click('#bGate');await run(p,600);console.log('gates',await p.evaluate(()=>[G.gatesOpen,trains[0].phase,count(trains[0])]));
 await cam(p,'gare',22);await save(p,'03-portillons');
 await run(p,1500);console.log('ready?',await log(p));await p.click('#bGate');await run(p,40);await p.click('#bRes');await p.evaluate(()=>{act('speed',0);for(let i=0;i<3000&&!OPS.some(o=>o.ok);i++)step(.05);ui();});console.log('shut',await p.evaluate(()=>[G.gatesOpen,trains[0].phase,G.auto]),await log(p));
 {const bb=async id=>(await p.locator(id).boundingBox());const g=await bb('#bGate'),y=await bb('#bByp'),d=await bb('#desk');
  await save(p,'04-lapbars',{clip:{x:d.x,y:g.y-12,width:d.width,height:y.y+y.height+34-(g.y-12)}});}
 console.log(await p.evaluate(()=>[OPS.map(o=>o.ok),trains[0].phase]));
 console.log('err',p.errs);
 // file
 await p.evaluate(()=>{G.crowd=2;});await run(p,3000);await cam(p,'file',9);await save(p,'10-file',{q:62});
 await p.close();
 // 2 zones (Trace du Hourra)
 p=await open(b,'hourra',D,'','1');
 await p.click('#zB1_m');
 const z=await p.locator('#deskZones').boundingBox();console.log('zones',z);
 await save(p,'05b-zones-pupitre',{clip:{x:z.x,y:z.y,width:z.width,height:Math.min(z.height,500)}});
 await p.close();
 p=await open(b,'zeus',D);
 const until=(c,m=40000)=>p.evaluate(([c,m])=>{const f=new Function('return '+c);act('speed',0);G.wx.next=1e6;for(let i=0;i<m;i++){if(f())break;step(.05);}ui();return f();},[c,m]);
 await p.click('#bOpen');await until('G.plat.filter(Boolean).length>=20');await p.click('#bRes');await p.click('#bGate');await until('trains[0].depReq');await p.click('#bGate');await until('G.gate<.05');await p.click('#bRes');
 await until("trains[0].st==='run'&&trains[0].s>S_LIFT0+25");await p.click('#zLift_off');await run(p,60);
 await p.evaluate(()=>{setCam('suivi0');cam.g.s=14;for(let i=0;i<60;i++)render(.05);});console.log('lift',await p.evaluate(()=>[trains[0].s,S_LIFT0,S_LIFT1,trains[0].v,G.lift]),await log(p));
 await save(p,'06-lift');await p.close();
 // 3 garages
 for(const [s,k,sc] of [['zeus','yard',9],['hourra','garage'],['oziris','garage'],['goudurix','garage']]){
  p=await open(b,s,D);await cam(p,k,sc);await save(p,'07-garage-'+s);console.log(s,p.errs);await p.close();}
 // 4 mobile
 const IP={...devices['iPhone 13'],viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:1};
 p=await open(b,'zeus',IP);await p.evaluate(()=>act('open'));await run(p,600);await save(p,'11-mobile-carte');
 await p.click('[data-act=tab][data-arg=pupitre]');await run(p,10);await save(p,'12-mobile-pupitre');
 await p.click('[data-act=tab][data-arg=carte]');await p.click('#bFs').catch(()=>{});await save(p,'13-mobile-plein-ecran');console.log(p.errs);
 await p.close();
 // 5 sauvegarde
 p=await open(b,'zeus',D);await p.click('[data-act=help]');await p.click('#bNew');await save(p,'14-nouvelle-partie');await p.close();
 await b.close();})();
