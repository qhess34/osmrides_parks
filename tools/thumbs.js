#!/usr/bin/env node
/* Vignettes de l'écran de choix (img/accueil/<site>.jpg, 630x360) : NODE_PATH=$(npm root -g) node tools/thumbs.js — ajouter l'id de la nouvelle attraction à la liste. */
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();
for(const s of ['zeus','hourra','oziris','goudurix']){
 const p=await b.newPage({viewport:{width:1000,height:640},deviceScaleFactor:1});
 await p.addInitScript(()=>{try{localStorage.setItem('t2z.syn','0')}catch(e){}});
 await p.goto('file://'+require('path').resolve(__dirname,'..')+'/jeu.html?type=parc&lieu=asterix&el='+s+'&mode=sandbox');await p.waitForFunction(() => typeof act === 'function' && (act('help'), true));await p.click('[data-act=closeHelp]');
 await p.addStyleTag({content:'#cams,#hint,#fsBar{display:none!important}'});
 await p.evaluate(()=>{act('speed',0);setCam(CAMS.gare?'gare':'vue');cam.g.s=cam.g.s;for(let i=0;i<40;i++)render(.05);});
 const v=await p.locator('#view').boundingBox();
 await p.screenshot({path:require('path').resolve(__dirname,'..')+`/img/accueil/${s}.jpg`,type:'jpeg',quality:72,clip:{x:v.x,y:v.y,width:Math.min(v.width,640),height:360}});
 await p.close();}
await b.close()})();
