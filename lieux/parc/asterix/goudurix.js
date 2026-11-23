'use strict';
/* Goudurix — configuration de l'attraction pour le moteur (engine/*.js).
   Montagnes russes en acier Vekoma MK-1200 à rails tubulaires, Parc Astérix (1989), sept inversions annoncées. Tracé, gare, chemins, voie de maintenance :
   lieux/parc/asterix/goudurix.data.js (OpenStreetMap). Ce qui est estimé est signalé « ESTIMÉ » ; caractéristiques et sources : docs/goudurix-notes.md. */
const SITE=(()=>{
  const PROM=OSM.paths.prom,PROM2=OSM.paths.prom2,QL=OSM.paths.qlink;
  // Embarquement à l'OUEST de la gare, portillons à l'ouest (propriétaire, 2026-11-15). OSM ne cartographie pas la file : on prend la promenade « Gouduriiiix Promenade »
  // (132709980) de l'entrée sud (23,8 ; 87,7) jusqu'à (-28 ; -2), puis un raccord ESTIMÉ vers le quai ouest. Le chemin 1102233771 (côté est, nord-sud) sert d'arrivée et de sortie.
  // File (OSM, mise à jour du propriétaire 2026-11-16) : départ de la promenade 1102233771 en (22,3 ; 25,0), chemin 1580112206 vers le sud-ouest, fourche en (5,3 ; 50,5) :
  // raccourci ou boucle 1580112207, puis le long de la voie de retour jusqu'à l'escalier 1580112204 qui monte à l'entrée du quai ouest (entrance=main (-3,0 ; -0,4)).
  // Mise à jour OSM du 2026-11-17 : la file 1580112206 commence à la barrière d'entrée OSM (19,4 ; 28,5), reliée à la promenade par 1580408092 ; barrières OSM B1 aux deux
  // pointes de la boucle. Indices de fourche retrouvés par les coordonnées.
  const Q=OSM.paths.q,QLOOP=OSM.paths.qloop,QIN=OSM.paths.qin,XO=OSM.paths.xout,ENTRY0=[21.4,26.1];
  const at=(x,z)=>{let b=0,bd=1e9;Q.forEach((p,i)=>{const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;b=i;}});return b;},F0=at(5.3,50.5),F1=at(-2.9,48.2);
  const EAST=OSM.paths.queue; // 1102233771 : de (16,5 ; 11,6) vers l'entrée sud (23,8 ; 87,7), passe par le départ de la file (22,3 ; 25,0) = EAST[2]
  // Sens de marche (propriétaire, 2026-11-15 : « le lift est la montée après la gare ») : gare vers le sud, lift droit sur l'axe nord-sud (s 44 → 136, OSM
  // « brake_run » + début de 541092982), puis les figures dans le lac, retour par la diagonale ouest (OSM « lift_hill », ici zone de freinage) et la courbe nord (OSM « launch_straight »).
  // Garage (OSM) : voie de maintenance 1221386549 (45 m, butoir au sud) qui se raccorde à ce retour, au nœud railway=switch (-15,2 ; -4,5), à 30 m avant la gare.
  // Propriétaire : « les trains vont au garage en marche arrière de la gare si l'aiguillage est orienté vers la voie ; l'aiguillage est un rail qui tourne sur lui-même, avec pour axe
  // le tube de rail » : yard.back (entrée en marche arrière depuis la gare, appareil en amont) et yard.rotary (rail rotatif). « L'aiguillage est un S » (propriétaire, 2026-11-15) :
  // yard.s, le tronçon mobile a deux faces (HYPOTHÈSE : une face droite = circuit, une face en S = voie de garage), le S est une courbe qui part du circuit au nœud OSM railway=switch
  // (bord de l'appareil côté gare, à 44,4 m en amont de l'arrêt de la tête du train) et rejoint la voie de maintenance OSM (3,4 m plus loin latéralement, ≈ 6 m en amont). Longueur
  // du S et durée de rotation (4 s) : ESTIMÉES.
  // Voie de garage : S OSM 1580112201 (du nœud railway=switch vers le sud) puis voie de maintenance 1221386549 ; le tronçon mobile en S va du nœud switch au 3e point du S (≈ 6 m).
  const lanePts=OSM.paths.gS.slice().reverse().slice(2).concat(OSM.paths.garage.slice().reverse().slice(1)),BRIDGE=[[42.3,9.7],[87.8,21.7],[89.9,26.6]]; // pont de bois OSM 161214279 (layer 1)
  return {
    id:'goudurix',title:'Goudurix',kind:'steel',trackName:'Voie tubulaire',goal:500,lap:120,
    // 2 trains de 7 wagons, 28 places = 4 par wagon en 2 rangées de 2 (RCDB, Wikipédia). Longueur (2,55 m) et largeur (1,5 m) d'un wagon ESTIMÉES.
    car:{len:2.55,n:7,seats:4,abreast:2,w:1.5},
    // Trains rouges (propriétaire, 2026-11-15) ; teinte exacte et liseré gris sombre SUPPOSÉS ; voie tubulaire jaune et supports rouges d'après la photo du propriétaire (teintes assourdies).
    trains:[{name:'Train 1',col:'#9a2d28',col2:'#3a3a3e',wear:30},{name:'Train 2',col:'#9a2d28',col2:'#3a3a3e',wear:44}],
    track:{spine:'#c4a32e',rail:'#b9532f',support:'#8e3b2c'}, // poutre et traverses jaunes, rails tubulaires orange-rouge, supports rouille (photo du propriétaire, 2026-11-15),
    // (propriétaire) un seul train sur le lift ; le lift retient le train en haut si la zone de freinage suivante est occupée : comportement par défaut du moteur
    // Deux zones de freinage (propriétaire) : frein de bloc B1 (repère blk1) juste avant la portion droite sous le lift, frein final (brk) sur la voie parallèle à la gare. Position d'après le propriétaire, emplacement exact ESTIMÉ.
    // Repères lus dans OSM (2026-11-16) : lift 541092982, B1 = zone « waiting » 1580112200, frein final = zone « waiting » 1580112203 (voie parallèle à la gare, propriétaire).
    // holdBack 34 : le train s'arrête au bout du frein final OSM (qui finit 31 m avant la gare), 0,6 m avant le tronçon mobile de l'aiguillage (ESTIMÉ à ± 1 m).
    stopBack:.5,holdBack:34,dropAfter:35,loadSide:1,   // le train roule vers le sud : loadSide 1 = embarquement à l'OUEST (portillons à l'ouest, propriétaire ; entrée OSM à l'ouest)
    phys:{roll:.02,drag:.0004,vmin:3},
    // Garage : une seule voie (la voie de maintenance OSM), 2 trains au plus. Durée de rotation (4 s) et vitesse de manœuvre ESTIMÉES.
    yard:{at:'station',device:'switch',back:true,rotary:true,s:true,a:45.4,b:51.6,slide:1,side:-1,len:5.6,devName:'Aiguillage',devLabel:'l\'aiguillage',lanes:[{name:'Garage',pts:lanePts,cap:2}],move:{v:2.4,t:4}},
    stationPoly:OSM.polys.station,stationAt:[.4,0,12],stationRoofCol:'#9b8f7d',
    fade:[[.4,0,12]],   // toits qui s'effacent : gare
    // Quais ESTIMÉS (le bâtiment OSM, 6,8 m de large, ne couvre que la voie et ses abords) : embarquement à l'ouest (portillons), débarquement à l'est. Quai ouest ramené à 6,2 m
    // (propriétaire, 2026-11-16, lot 4 : l'escalier de la file 1580112204 est EN APPLIQUE à l'ouest de la gare, collé au mur, hors du quai ; le moteur le décale contre le mur et
    // dessine un palier rectangulaire à son sommet) : juste assez pour les 4 places d'attente par portillon.
    // Deux portillons par wagon, un par rangée de 2 places (propriétaire, 2026-11-16, lot 6) : 14 portillons, deux visiteurs par portillon, les opérateurs vérifient chaque rangée.
    plat:{load:6.2,exit:3.5,back:.6,front:1.6,gatesPer:'row'},
    // Poste de contrôle au SUD-EST de la gare, dans son emprise, vitre tournée vers la voie (propriétaire, lot 6) ; pupitre réduit (échelle .55 : 2,1 x 0,9 m, ESTIMÉ).
    booth:[2.25,8.6,Math.PI/2,.55],boothLabel:[7,12],beacon:[2.55,7.75],
    // Entrée (propriétaire, issue #9 : « ça dépasse trop ») : la barrière OSM est déjà dans la zone piétonne, aucun prolongement (mouthMax 0 : raccord retiré).
    queue:{entry0:ENTRY0,link:[],mouthMax:0,ways:[Q,QLOOP,QIN],   // barrière d'entrée au début du chemin de file OSM 1580112206 ; tronçons et fourche déduits des chemins de file OSM (lot 5, engine/queue.js deduceParts) ; parts = repli
      parts:[{pts:[ENTRY0].concat(Q.slice(Math.hypot(Q[0][0]-ENTRY0[0],Q[0][1]-ENTRY0[1])<1.5?1:0,F0+1))},
        // boucle 1580112207 : une barrière pivotante par pointe, déduite de la fourche (engine/queue.js forkGates, issue #34 ; nœuds OSM barrier=* plus lus)
        {name:'boucle nord',short:Q.slice(F0,F1+1),loop:QLOOP},
        {pts:Q.slice(F1).concat(QIN.slice(1,2))}]},
    // Arrivée : depuis le pont de bois et l'allée est (OSM 161214279, 161214274), ou depuis l'entrée sud, par le chemin 1102233771.
    approach:[{w:.5,pts:BRIDGE.slice().reverse().concat([[34,7.5],[29.9,7.7],[18,4.2]],EAST.slice(0,3))},{w:.5,pts:EAST.slice(2).reverse()}],
    paths:[PROM,PROM2,QL,EAST,XO],
    // Entrée du quai ouest (OSM entrance=main, mur ouest de la gare) ; couloir d'attente à 2,8 m de la voie, entre les deux places de chaque portillon (ESTIMÉ ; lot 6 : portillons rapprochés du bord du quai)
    board:{via:[[-3.8,-0.4]],walk:2.8},
    // Sortie (OSM 2026-11-16) : porte entrance=exit (3,5 ; 5,5) du mur est, chemin 1580112210, escalier 1580112211, chemin 1580112209 ; raccord ESTIMÉ vers l'allée est et le pont de bois.
    exit:{door:XO[0],path:XO,
      tails:[[XO[XO.length-1],[16.5,11.6],[18,4.2],[29.9,7.7],[34,7.5]].concat(BRIDGE),[XO[XO.length-1],[16.5,11.6]].concat(EAST.slice(1))]},
    catwalks:{side:{Lift:1}},  // passerelle-escalier du lift À DROITE du sens de marche : information du propriétaire (2026-11-16), pas une estimation ; freins : côté choisi par le moteur
    jobsites:{liftFix:[8,70],chainRev:[8,70],trackRev:[42,60],brakeFix:[-10,30],brakeRev:[-10,30],trainRev:[-10,12],rearm:[5,-3]},
    view:{x:25,z:52,w:200,h:190,bounds:[-90,120,-60,170]},
    // Figures (affiche du plan des figures, docs/sources/goudurix-plan-figures-affiche.png, recalée sur le tracé OSM par la forme ; positions ESTIMÉES) : après la grande descente,
    // Butterfly (2 inversions, S de (29..48 ; 62..78), s ≈ 206–272), Batwing (2, ∞ au bord du lac, s ≈ 312–382), Loop (1, ligne droite à l'est après le Batwing, entre les repères 9 et 10 du plan, s ≈ 400–450 : placement du propriétaire), Double Corkscrew (2, S de l'extrémité sud-ouest, s ≈ 540–590).
    // Inversions dessinées (propriétaire, 2026-11-15 ; tools/specs/goudurix.json « inversions », générique) : Loop agrandi ×4 le long de la voie (boucle ESTIMÉE insérée entre s 388 et 455 au sol :
    // 200 m de voie au lieu de 52 m, hauteur 21 m, vue de dessus une ellipse de ≈ 67 x 7,5 m, x 48–56, z 28–95 ; le linéaire ajouté n'est pas dans OSM) ; Double Corkscrew = deux vrilles de 360°
    // (dévers 0 → 720°, déport hélicoïdal 3 m ESTIMÉ, s 538–592 au sol). Train tête en bas dessiné par le moteur (dessous de caisse, voie par-dessus).
    cams:{gare:{label:'Gare',x:3,z:0,s:17},file:{label:'File',x:0,z:40,s:7},lift:{label:'Lift',x:6,z:78,s:6.5},descente:{label:'Grande descente',x:29,z:96,s:8},
      butterfly:{label:'Butterfly',x:38,z:70,s:11},loop:{label:'Loop',x:54,z:62,s:6.5},batwing:{label:'Batwing',x:55,z:28,s:11},corkscrew:{label:'Double Corkscrew',x:19,z:92,s:9},
      frein:{label:'Frein final',x:-6,z:30,s:8},garage:{label:'Garage',x:-14,z:10,s:11}},
    labels:()=>[['Gare',6,-4],['Lift — 36 m',12,78],['Grande descente',38,100],['Virage à 180°',14,128],['Butterfly',27,70],['Loop',66,62],['Batwing',60,22],['Double Corkscrew',3,92],
      ['Poste aiguillage',-12.5,-7.4],['Frein final',-32,35],['Garage',-32,12],['Entrée',27,22],["File d'attente",-14,36],['Sortie',9,15]],
    strike:{area:[-60,100,-40,150]},
    // Le premier frein du parcours (B1) RALENTIT nettement le train (propriétaire) : vitesse ramenée à 8 m/s (≈ 29 km/h, ESTIMÉ) en passage normal ; arrêt seulement si le canton suivant est occupé.
    zones:{B1:{trim:{v:8}}},
    text:{storm:'Orage sur Goudurix : aucun train ne doit partir.',great:'Excellente exploitation sur Goudurix !'},
    helpGarage:'<b>Garage</b> : une voie de maintenance, en amont de la gare (≈ 45 m avant l\'arrêt du train). L\'aiguillage est un rail rotatif : il tourne sur lui-même autour du tube de rail, pour présenter le circuit (P) ou la voie (1). '
      +'Pour garer un train : train vide à quai, portillons fermés, aiguillage sur 1 (attendre la fin de la rotation), puis Dispatch de la voie : le train recule de la gare jusqu\'au fond de la voie (il s\'arrête avant le butoir). Remettez l\'aiguillage sur P. '
      +'Pour le sortir : gare libre (au besoin, frein final en MANU et serré pour retenir l\'autre train), aiguillage sur 1, puis Dispatch : il avance jusqu\'en gare ; aiguillage sur P. '
      +'L\'aiguillage ne tourne pas si un train est dessus ou tout près, et un train avec passagers ne quitte jamais le circuit. Dispatch choisit seul le sens : entrée si un train vide attend à quai et que la voie a de la place, sinon sortie du train de tête.',
    draw:(()=>{
      // POSTE DE L'AIGUILLAGE (photo du propriétaire, docs/sources/goudurix-aiguillage-rotation.png) : plate-forme métallique rouille avec garde-corps, escalier galvanisé,
      // passerelle grillagée grise inclinée le long du tronçon mobile, opérateur debout avec un boîtier de commande. Position ESTIMÉE (la photo n'est pas géoréférencée) :
      // du côté EST du retour (opposé à la voie de garage, à l'ouest, comme sur la photo), entre le nœud railway=switch (-14,9 ; 1,6) et la courbe nord, dans le coin libre entre le retour,
      // le quai et le raccord de la file (z > 1 : file). Dimensions (3,6 x 5 m, hauteur ≈ 2,4 m, passerelle 0,8 m de large, escalier 1,2 m) ESTIMÉES. L'escalier descend vers
      // l'extrémité du raccord de la file (-13,5 ; 5,2), seul chemin voisin (le chemin de service n'est pas cartographié).
      const D={x0:-13.6,x1:-11.5,z0:-5.6,z1:-.6,h:2.4},ST={x0:-12.9,x1:-11.9,z1:2.6},PG={x0:-14.25,x1:-13.6,z0:-4.4,z1:1.3},OP=[-12.6,-3.4],BOX=[-12,-4.6]; // resserré (2026-11-16) : la file OSM passe à x ≈ -10,5
      const rot=()=>typeof G!=='undefined'&&G.dev&&G.dev.pos!==G.dev.to; // aiguillage en rotation
      const rail=(ctx,lw,pts,col)=>{ctx.strokeStyle=col;lw(.07,.8);ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();};
      return {
        floor(ctx,s,{lw}){ // pieds de la plate-forme et escalier galvanisé (au sol)
          ctx.fillStyle='#4a3329';for(const [x,z] of [[D.x0+.15,D.z0+.15],[D.x1-.15,D.z0+.15],[D.x1-.15,D.z1-.15],[D.x0+.15,D.z1-.15]])ctx.fillRect(x-.15,z-.15,.3,.3);
          const w=ST.x1-ST.x0;ctx.fillStyle='#9ca1a5';ctx.fillRect(ST.x0,D.z1,w,ST.z1-D.z1);
          if(s>4){ctx.strokeStyle='rgba(50,54,58,.7)';lw(.05,.5);ctx.beginPath();for(let z=D.z1+.3;z<ST.z1;z+=.3){ctx.moveTo(ST.x0+.08,z);ctx.lineTo(ST.x1-.08,z);}ctx.stroke();}
          ctx.fillStyle='#7d8286';ctx.fillRect(ST.x0-.06,D.z1,.1,ST.z1-D.z1);ctx.fillRect(ST.x1-.04,D.z1,.1,ST.z1-D.z1);
        },
        shadows(ctx,dry){ // ombres dans la direction SHX/SHZ (hauteur de la plate-forme ≈ 2,4 m)
          const dx=D.h*SHX,dz=D.h*SHZ;ctx.fillStyle=`rgba(12,28,14,${.26*dry})`;ctx.fillRect(D.x0+dx,D.z0+dz,D.x1-D.x0,D.z1-D.z0);
          ctx.fillRect(PG.x0+dx*.7,PG.z0+dz*.7,PG.x1-PG.x0,PG.z1-PG.z0);
          ctx.fillRect(ST.x0+dx*.4,D.z1+dz*.4,ST.x1-ST.x0,ST.z1-D.z1);
          ctx.strokeStyle=`rgba(12,28,14,${.2*dry})`;ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(D.x0+dx,D.z1+dz);ctx.lineTo(D.x1+dx,D.z1+dz);ctx.lineTo(D.x1+dx,D.z0+dz);ctx.stroke();
          ctx.fillStyle=`rgba(12,28,14,${.3*dry})`;ctx.beginPath();ctx.ellipse(OP[0]+1.1,OP[1]+.9,.3,.2,.6,0,7);ctx.fill(); // ombre de l'opérateur (debout)
        },
        landmarks(ctx,s,{lw,person}){
          // plate-forme : tôle rouille, liseré plus sombre
          ctx.fillStyle='#7a4d3b';ctx.fillRect(D.x0,D.z0,D.x1-D.x0,D.z1-D.z0);
          ctx.strokeStyle='#573629';lw(.12,.8);ctx.strokeRect(D.x0,D.z0,D.x1-D.x0,D.z1-D.z0);
          if(s>5){ctx.strokeStyle='rgba(40,24,18,.35)';lw(.04,.4);ctx.beginPath();for(let x=D.x0+.6;x<D.x1;x+=.6){ctx.moveTo(x,D.z0);ctx.lineTo(x,D.z1);}ctx.stroke();}
          // passerelle grillagée grise inclinée (haute au nord, attachée à la plate-forme ; basse au sud) : plus étroite côté bas
          const g=ctx.createLinearGradient(0,PG.z0,0,PG.z1);g.addColorStop(0,'#8c9094');g.addColorStop(1,'#6d7176');ctx.fillStyle=g;
          ctx.beginPath();ctx.moveTo(PG.x0,PG.z0);ctx.lineTo(PG.x1,PG.z0);ctx.lineTo(PG.x1,PG.z1);ctx.lineTo(PG.x0+.12,PG.z1);ctx.closePath();ctx.fill();
          if(s>5){ctx.strokeStyle='rgba(40,44,48,.35)';lw(.03,.4);ctx.beginPath();for(let z=PG.z0+.25;z<PG.z1;z+=.25){ctx.moveTo(PG.x0+.05,z);ctx.lineTo(PG.x1,z);}ctx.stroke();}
          rail(ctx,lw,[[PG.x0,PG.z0],[PG.x0+.1,PG.z1]],'#5b5f64'); // main courante côté rail
          // garde-corps de la plate-forme (ouvert à l'escalier et à la passerelle)
          const R='#5e3b2e';
          rail(ctx,lw,[[D.x0,D.z0],[D.x1,D.z0],[D.x1,D.z1],[ST.x1,D.z1]],R);
          rail(ctx,lw,[[ST.x0,D.z1],[D.x0,D.z1],[D.x0,PG.z1<D.z1?D.z1:PG.z1]],R);
          rail(ctx,lw,[[D.x0,D.z0],[D.x0,PG.z0]],R);
          // garde-corps galvanisé de l'escalier
          rail(ctx,lw,[[ST.x0,D.z1],[ST.x0,ST.z1]],'#aab0b4');rail(ctx,lw,[[ST.x1,D.z1],[ST.x1,ST.z1]],'#aab0b4');
          // boîtier de commande (armoire grise sur le garde-corps nord-est)
          ctx.fillStyle='#6b7075';ctx.fillRect(BOX[0]-.35,BOX[1]-.25,.7,.5);ctx.fillStyle='#34383c';ctx.fillRect(BOX[0]-.3,BOX[1]+.05,.6,.15);
          if(s>6){ctx.fillStyle=rot()?'#c89a3a':'#4f8a62';ctx.beginPath();ctx.arc(BOX[0]+.18,BOX[1]-.12,.06,0,7);ctx.fill();}
          // opérateur : face à l'aiguillage (ouest) quand il pivote, sinon tourné vers le sud (quai)
          person(OP[0],OP[1],11,rot()?Math.PI:Math.PI/2+.3,false,'#8a8a8a');
        }
      };
    })()
  };
})();
