// Icônes de l'application (PNG) depuis le logo vectoriel img/logo/logo.svg (carte pliée + voie vue du dessus) :
//   NODE_PATH=$(npm root -g) node tools/make_icons.js [dossier]      (Playwright / Chromium préinstallés)
// Remplace tools/make_icons.py (ancien dessin). Le SVG est inséré dans la page : aucune ressource externe.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const out=path.resolve(process.argv[2]||'icons');
const svg=fs.readFileSync(path.resolve(__dirname,'../img/logo/logo.svg'),'utf8');
(async()=>{
  const b=await chromium.launch(),p=await b.newPage();
  // [fichier, taille px, part du côté occupée par le logo, fond]
  // maskable : logo réduit dans la zone de sécurité (80 %), fond plein ; Apple : fond plein (iOS arrondit lui-même)
  for(const [f,s,k,bg] of [['icon-192.png',192,1,'transparent'],['icon-512.png',512,1,'transparent'],
                           ['icon-maskable-512.png',512,.78,'#0f1626'],['apple-touch-icon.png',180,1.12,'#0f1626']]){
    await p.setViewportSize({width:s,height:s});
    const w=s*k,m=(s-w)/2;
    await p.setContent(`<body style="margin:0;overflow:hidden;background:${bg}"><div style="position:absolute;left:${m}px;top:${m}px;width:${w}px;height:${w}px">${svg.replace('<svg ','<svg width="100%" height="100%" ')}</div></body>`);
    await p.screenshot({path:path.join(out,f),omitBackground:bg==='transparent'});
  }
  await b.close();
})();
