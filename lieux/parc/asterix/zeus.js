'use strict';
/* Tonnerre 2 Zeus — configuration de l'attraction pour le moteur (engine/*.js).
   Les coordonnées viennent de lieux/parc/asterix/zeus.data.js (OpenStreetMap) ; ce qui est estimé est signalé. */
const SITE=(()=>{
  // File d'attente dans le sens de marche : entrée sous la statue → escalier de la gare (OSM 93696870, relue le 2026-11-17 : barrière d'entrée, fourche est en (-12,2 ; 28,4)),
  // puis haut de l'escalier couvert OSM 1353118268 (entrée du quai). Réimport complet du 2026-11-20 (issue #33) : voie, gare, garage et file relus dans OSM.
  const ST=OSM.paths.stair,W=OSM.paths.queue.concat([ST[ST.length-1]]),SHORT_E=OSM.paths.short;
  const at=(x,z)=>{let b=0,bd=1e9;W.forEach((p,i)=>{const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;b=i;}});return b;};
  const JB=at(-27.2,25.2),JA=at(-25.9,27.3),J2=at(-12.2,28.4),J1=at(-4.1,16.4),ENTRY0=[-28.6,-5.4];
  const PROM_W=[[-107.1,-8.2],[-95.1,-8.7],[-83.4,-9.8],[-74.9,-14],[-67,-17.3],[-61.1,-20.1],[-57.7,-19.1],[-50.9,-15.2],[-44.4,-11.1],[-39.7,-9.8],[-33.4,-9],[-30.1,-9.2]];
  const PROM_N=[[4.8,-56.4],[3.6,-42.4],[-.2,-32.2],[-8.6,-25],[-11.6,-19],[-13.2,-14.5],[-17.6,-8.5],[-20.9,-6.7]];
  const GM_=OSM.paths.garage,onGarage=x=>[x,GM_[0][1]+(x-GM_[0][0])*(GM_[GM_.length-1][1]-GM_[0][1])/(GM_[GM_.length-1][0]-GM_[0][0])]; // voie de maintenance réelle (OSM 938337765 + 938337766)
  return {
    id:'zeus',title:'Tonnerre 2 Zeus',kind:'wood',trackName:'Voie en bois',goal:400,lap:150,
    car:{len:1.5,n:14},                    // 14 wagons de 2 places côte à côte ; longueur de wagon estimée
    trains:[{name:'Train 1 « Éclair »',col:'#1c8a94',col2:'#f2c14e',wear:30},{name:'Train 2 « Foudre »',col:'#17727c',col2:'#d9dde2',wear:48}],
    stopBack:3,holdBack:4,dropAfter:14,loadSide:1,
    phys:{roll:.098,drag:.0006,vmin:3},
    // Garage dans le prolongement de la gare (SITE.yard, voir docs/manoeuvres.md) : aiguillage = tronçon en S coulissant, une voie où les trains se rangent en file.
    // Voie de garage = voie de maintenance réelle (OSM) ; position et course du chariot (a, b, slide) déduites de la carte ; vitesse de manœuvre et durée de déplacement estimées.
    yard:{at:'station',device:'switch',a:.8,b:6.4,slide:3.4,side:-1,len:8.6,lanes:[{name:'Garage',pts:[onGarage(21.5),onGarage(53.6)]}],move:{v:2.4,t:3}},
    // Second tunnel (propriétaire, 2026-11-16 : « il en existe un de plus », puis « entre les repères 18 et 19 » de docs/plans/zeus-trace-complete.png ; RCDB : Tunnel, Tunnel) :
    // absent d'OSM. Les ronds de ce plan sont en s du moteur (rond n = (n-1)×50 m ; vérifié : rond 18 = s 850, h 8,9 m, (83 ; 43) ; rond 19 = s 900, h 3,1 m, (45 ; 68)) :
    // galerie sombre à effets sur toute la diagonale qui revient de la boucle est vers le pied du lift, s 850–900 m. Bornes exactes et largeur ESTIMÉES (± quelques mètres).
    // Le premier tunnel (bas de la première descente) : polygone OSM man_made=tunnel 1353118256, couvert le long de la voie par le moteur (galerie, issue #42) ;
    // le polygone r18584330 recoupe la galerie à effets et la prolonge jusqu'à s 900.
    // Réimport du 2026-11-20 (issue #33) : la voie 3D est plus longue de quelques mètres (lift recalé sur OSM) : mêmes points au sol, s 847–897.
    tunnels:[{s:[847,897],under:'roof',w:2.3}],
    stationPoly:OSM.polys.station,stationAt:[0,2.5,9],stationRoofCol:'#a24e38',
    fade:[[0,2.5,9],[7.3,-3.7,1.5],[49,-3,8],[-4,11.4,4]],   // toits qui s'effacent : gare, poste de conduite, garage, escalier
    plat:{load:7.9,exit:3,back:.1,front:1.6},   // exit : quai de débarquement côté nord jusqu'au mur (ESTIMÉ d'après le bâtiment OSM) ; couloir de descente au milieu
    booth:[7.275,-3.7,0],boothLabel:[10.5,-6.6],beacon:[9.6,-4.9],
    // Entrée (propriétaire, issue #9) : file prolongée de 4,5 m dans la zone piétonne (45 % de ses 10 m de profondeur) et barrière d'entrée déplacée au bout,
    // devant la statue : AJUSTEMENT du jeu (le début du chemin de file OSM, et l'ancien nœud « Entrée T2Z », sont sous la statue, en (-28 ; -1,2)), voir engine/queue.js gateAtMouth.
    // File déduite des chemins de file OSM (issue #37) : chemin 93696870 + haut de l'escalier, raccourci ouest 937019288 (oneway), raccourci est 937019287 ; parts = repli.
    queue:{entry0:ENTRY0,link:[[-29.4,-9.2]],mouthMax:.45,gateAtMouth:true,ways:[W,OSM.paths.shortW,SHORT_E],
      parts:[
        {pts:[ENTRY0].concat(W.slice(0,JB+1))},
        // Repli écrit à la main (noms des fourches repris par la déduction) ; barrières : posées dans l'éditeur (GAME.barriers, issue #37).
        {name:'raccourci ouest',loop:W.slice(JB,JA+1),short:[W[JB],W[JA]]},
        {pts:W.slice(JA,J2+1)},
        {name:'raccourci est',loop:W.slice(J2,J1+1),short:SHORT_E||[W[J2],[-12.1,27],[-12,19.3],[-11.6,17.4],[-9.9,16.2],W[J1]]},
        {pts:W.slice(J1)}]},
    approach:[{w:.6,pts:PROM_W.concat([[-29.2,-9]])},{w:.4,pts:PROM_N.concat([[-29.2,-9]])}],
    noStroll:[[-27.5,-1.5]],
    board:{via:[[-3.9,7.9],[-4,6.9]],walk:5.25},   // couloir d'attente derrière les places (lot 6 : portillons rapprochés du bord du quai, engine/garage.js PGATE)
    exit:{door:[-.7,-3],path:[[-.7,-3],[-.7,-4.1],[-11.1,-4.1],[-11,-7.3],[-8.8,-8.8],[-6.2,-8.8],[-4.6,-9.7],[-4.4,-11.3],[.3,-15.5],[1.9,-19.4],[-3.2,-20.1],[-8.6,-25]], // sortie par la boutique
      tails:[[[-.2,-32.2],[3.6,-42.4],[4.8,-56.4]],[[-11.6,-19],[-13.2,-14.5],[-17.6,-8.5],[-20.9,-6.7]].concat(PROM_W.slice().reverse())]},
    catwalks:false,                        // passerelles de service et escaliers du lift et des freins (issue #7) : aucun sur Zeus (demande du propriétaire)
    jobsites:{liftFix:[37.8,39],chainRev:[37.8,39],trackRev:[-2,106.5],brakeFix:[-26,33],brakeRev:[-26,33],trainRev:[46,-4.6],rearm:[4,2.6]},
    view:{x:38,z:52,w:222,h:162,bounds:[-170,210,-130,230]},
    cams:{gare:{label:'Gare',x:5,z:2,s:19},file:{label:'File',x:-20,z:19,s:14},lift:{label:'Lift',x:35,z:40,s:8.5},descente:{label:'Descente',x:8,z:98,s:9},tunnel2:{label:'Tunnel à effets',x:66,z:56,s:7},croisement:{label:'Croisement',x:52,z:70,s:9},zeus:{label:'Zeus',x:-29,z:-1,s:19}},
    labels:o=>[['Gare',-4,-6.5],['Lift — 30 m',43,36],['Tunnel',o.tunnel[0]-2,o.tunnel[1]+8],['Tunnel à effets',72,52],['Freins',-33,30],["File d'attente",-34,20],['Zeus',-37,-5],['Entrée',-23.6,-3.6],['Garage',49,-12.5],['Aiguillage',17,-9.5]],
    hideNames:['Zeus'],strike:{spot:[-31,-1],area:[-60,140,-20,125]},
    text:{storm:'Zeus est en colère : orage sur l\'attraction ! Aucun train ne doit partir.',great:'Excellente exploitation, Zeus est fier de vous !'},
    // Moteurs (pneus) par zone : gare, frein final, voie de garage = freins + moteurs (défaut du moteur, ESTIMÉ, à confirmer par le propriétaire) ; SITE.zones pour changer.
    helpGarage:'<b>Garage</b> : manœuvre manuelle, commandée par zones au pupitre. Pour garer un train : train vide à quai, portillons fermés, aiguillage sur 1 (attendre qu\'il soit en place), puis Dispatch de la voie : le train avance jusqu\'au fond du garage et s\'arrête avant le butoir. Remettez l\'aiguillage sur P. Pour le sortir : gare libre (au besoin, frein final en MANU et serré pour retenir l\'autre train), aiguillage sur 1, puis Dispatch : il recule jusqu\'en gare ; aiguillage sur P. Dispatch choisit seul le sens (entrée si un train vide attend à quai et que la voie a de la place, sinon sortie) ; il refuse, avec la raison au journal, si l\'aiguillage n\'est pas sur la voie. L\'aiguillage ne bouge pas si un train est dessus ou tout près, et un train avec passagers ne quitte jamais le circuit.',
    draw:{
      floor(ctx,s,{lw}){ // garde-corps des quais (l'escalier d'accès est l'escalier OSM couvert, dessiné par le moteur quand son toit s'efface, issue #21)
        ctx.strokeStyle='#4d525a';lw(.1,.6);ctx.beginPath();ctx.moveTo(-8.8,-3);ctx.lineTo(-1.7,-3);ctx.moveTo(.3,-3);ctx.lineTo(9,-2.7);ctx.moveTo(-8.9,7.6);ctx.lineTo(-6,7.7);ctx.moveTo(-1.9,7.8);ctx.lineTo(12.4,8.1);ctx.stroke();
      },
      shadows(ctx,dry){ // ombre portée de la statue
        ctx.lineCap='round';ctx.strokeStyle=`rgba(12,28,14,${.32*dry})`;ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(-29,-.7);ctx.lineTo(-23.5,3.5);ctx.stroke();
        ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-24.6,2.7);ctx.lineTo(-25.6,6.5);ctx.stroke();ctx.lineCap='butt';
      },
      stationRoof(ctx){ // toit à deux pans : versant nord éclairé, versant sud à l'ombre, faîtage
        ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(-20,-20,40,22.5);ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(-20,2.5,40,20);
        ctx.strokeStyle='#e9d8c0';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-9.2,2.4);ctx.lineTo(9.3,2.75);ctx.stroke();
      },
      underRoof(ctx,roofA,{lw}){ // charpente et colonnes visibles quand le toit s'efface
        ctx.globalAlpha=(1-roofA)*.3;ctx.strokeStyle='#5b4632';lw(.14,.6);ctx.beginPath();for(let x=-7.5;x<9;x+=1.8){ctx.moveTo(x,-3.1);ctx.lineTo(x+.15,8.1);}ctx.stroke();
        ctx.globalAlpha=1-roofA;ctx.fillStyle='#f2eee4';for(let x=-8.7;x<=9.2;x+=2.98)for(const z of [-3.05+x*.012,8+x*.016]){ctx.beginPath();ctx.arc(x,z,.3,0,7);ctx.fill();}
        ctx.globalAlpha=1;
      },
      landmarks(ctx){ // statue de Zeus, à cheval sur l'entrée de la file (représentation stylisée, en pierre)
        ctx.save();ctx.translate(-29,-.7);ctx.rotate(1);ctx.scale(.78,.78);
        ctx.fillStyle='#8f897d';ctx.fillRect(-4.3,-1.5,2.8,3.6);ctx.fillRect(1.5,-1.5,2.8,3.6);
        ctx.fillStyle='#b9b2a2';ctx.beginPath();ctx.ellipse(0,0,3.1,2,0,0,7);ctx.fill();ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.ellipse(.35,.3,2.7,1.6,0,0,7);ctx.fill();
        ctx.fillStyle='#c9c2b2';ctx.beginPath();ctx.ellipse(-.1,-.1,2.6,1.5,0,0,7);ctx.fill();
        ctx.strokeStyle='#c9c2b2';ctx.lineCap='round';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2.3,0);ctx.lineTo(-4.5,-.6);ctx.moveTo(2.3,0);ctx.lineTo(3.5,1.2);ctx.stroke();ctx.lineCap='butt';
        ctx.fillStyle='#d6cfbf';ctx.beginPath();ctx.arc(0,-.1,1.3,0,7);ctx.fill();ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.arc(.25,.15,1.05,0,7);ctx.fill();
        ctx.fillStyle='#a8925a';ctx.beginPath();[[-6.6,-1.6],[-4.9,-1.2],[-5.3,-.6],[-3.6,.2],[-5.6,.2],[-5.1,-.4]].forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.fill();
        ctx.restore();
      }}
  };
})();
