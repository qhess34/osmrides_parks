'use strict';
/* La Trace du Hourra — configuration de l'attraction pour le moteur (engine/*.js).
   Tracé, gare, file, sortie et bâtiment du garage : lieux/parc/asterix/hourra.data.js (OpenStreetMap). Ce qui est estimé est signalé « estimé ». */
const SITE=(()=>{
  const Q=OSM.paths.queue,LOOP=OSM.paths.queueLoop,PROM=OSM.paths.prom,ENTRY0=[59.2,16.15];
  // Rocher 1580139648 (propriétaire, 2026-11-16, lot 4) : les DEUX niveaux de voie passent DANS le rocher, en tunnel (OSM : 1580139650 voie haute, 1580221724 voie basse ;
  // le moteur prolonge chaque tunnel jusqu'aux bords du rocher) ; hauteur du rocher ESTIMÉE par le moteur (voie haute + 2,2 m ≈ 9,8 m).
  // File (OSM, mises à jour du propriétaire 2026-11-16) : 1580139651, passage SOUS le rocher 1580139648 (1580139652, tunnel=yes), 1580137178, escalier 1580224119 (montée),
  // 1580224120, passerelle 1580137179 (bridge=yes layer=2, AU-DESSUS du circuit), 1580224121, escalier 1580224122 (descente) : escaliers OSM (lot 4), plus d'escaliers ajoutés
  // par le moteur ; mise à jour du 2026-11-17 : 1580413568, passage SOUS le second rocher (1580413569, tunnel), 1580413566, passage couvert 1580413567 ;
  // 1032354546 jusqu'au bord est de la gare (4,8 ; -1,7), passage SOUS la gare (1580086194, tunnel=yes layer=-1 :
  // dessiné sous le toit, qui s'efface au zoom), chemin 1580149150 vers le nord, fourche en (0,6 ; -10,9) : raccourci ou boucle 1032685208 (barrières OSM B1 aux
  // deux pointes de la boucle), escalier 1032685209 qui monte jusqu'à l'entrée du quai (OSM entrance=main (2,9 ; -3,3), 2026-11-17).
  const TUN=OSM.paths.qtun,B=OSM.paths.queueB,XD=OSM.paths.xdown;
  // Garage (OSM, propriétaire 2026-11-20, issue #33) : 6 voies droites dessinées dans OSM (1582324002…1582324007, gar1…gar6), dans le bâtiment 148160581,
  // au-delà du pont, à l'ouest du rail mobile du parcours (1580086185, garA) ; rail du chariot 1582324008 (garB). Lus ici dans OSM : d = distance moyenne
  // (m) de l'axe du rail A à l'axe de la voie (côté droit du sens de marche = ouest), longueur de chaque voie, écart A/B (gap), jeu entre le bout du rail A
  // et le début des voies (laneGap). Voies tracées à la main dans OSM, pas tout à fait parallèles (± 0,3 m) : moyenne des deux bouts.
  const GA=OSM.paths.garA,A0=GA[0],A1=GA[GA.length-1],AL=Math.hypot(A1[0]-A0[0],A1[1]-A0[1]),TX=(A1[0]-A0[0])/AL,TZ=(A1[1]-A0[1])/AL;
  const dOf=P=>(P.reduce((a,p)=>a+(p[0]-A0[0])*-TZ+(p[1]-A0[1])*TX,0)/P.length),tOf=p=>(p[0]-A0[0])*TX+(p[1]-A0[1])*TZ;
  const LN=[1,2,3,4,5,6].map(k=>OSM.paths['gar'+k]),r1=v=>Math.round(v*10)/10;
  const lane=(n,P)=>({name:'Voie '+n,d:r1(dOf([P[0],P[P.length-1]])),len:r1(Math.hypot(P[P.length-1][0]-P[0][0],P[P.length-1][1]-P[0][1])),cap:1});
  const GAP=r1(dOf([OSM.paths.garB[0],OSM.paths.garB[OSM.paths.garB.length-1]])),LGAP=Math.max(.3,r1(Math.min(...LN.map(P=>Math.min(tOf(P[0]),tOf(P[P.length-1]))))-AL));
  return {
    id:'hourra',title:'La Trace du Hourra',kind:'bob',trackName:'Gouttière',goal:900,lap:110,
    // 7 bobs de 2 places l'une derrière l'autre (propriétaire) ; longueur et largeur d'un bob estimées. pitch : 0,56 m d'axe à axe, passagers l'un contre l'autre (propriétaire, 2026-11-17 : pas d'espace entre eux)
    // (propriétaire : « collés l'un contre l'autre ») ; tient dans 1,55 m avec la lapbar devant le passager avant, sans allonger le bob.
    car:{len:1.55,n:7,seats:2,inline:true,w:.95,pitch:.56},
    // 6 trains (propriétaire), 5 au plus sur le parcours : les 5 autres démarrent chacun sur sa voie de garage. Teintes sourdes supposées (couleurs réelles non vérifiées).
    // Gouttière rouge foncé à nervures extérieures, bord rouge vif (photo du propriétaire, 2026-11-14)
    trough:{lo:[112,38,36],hi:[140,52,46],edge:'#5a1f1c',deck:'#6e2622',rim:'#b8322c',shine:'rgba(255,220,210,.12)'},
    // Tous les trains : bobs jaunes, intérieur noir (propriétaire, 2026-11-14)
    trains:[{name:'Train 1',col:'#d8a92a',col2:'#2a2a2c',wear:28},{name:'Train 2',col:'#d8a92a',col2:'#2a2a2c',wear:44,lane:1},
      {name:'Train 3',col:'#d8a92a',col2:'#2a2a2c',wear:36,lane:2},{name:'Train 4',col:'#d8a92a',col2:'#2a2a2c',wear:52,lane:3},
      {name:'Train 5',col:'#d8a92a',col2:'#2a2a2c',wear:20,lane:4},{name:'Train 6',col:'#d8a92a',col2:'#2a2a2c',wear:60,lane:5}],
    maxRun:5,   // au plus 5 trains sur le parcours (propriétaire) : la sortie d'un 6e est refusée
    // Repères lus dans OSM (tools/specs/hourra.json) : lift, freins de bloc B1 (zone « waiting » de 11,7 m en haut du lift : frein de bloc après le lift, propriétaire
    // 2026-11-16 ; le lift retient le train tant que B1 est occupé), B2 et B3, frein final, rail de transfert du pont (arrêt au bout du rail : pas de holdBack), frein avant gare.
    stopBack:.5,dropAfter:12,loadSide:-1,
    phys:{roll:.13,drag:.0016,vmin:3},
    // Garage sur le frein final : pont transbordeur DROIT (propriétaire) — deux éléments mobiles indépendants, droits, d'un train de long :
    // rail mobile du parcours (rail A) = rail du circuit (zone de freinage), deux positions seulement : sur le circuit ou retiré vers l'est (retract) ;
    // chariot et rail du chariot (rail B ; garage, freins et pneus, porte le train) : en ligne avec le circuit (G, seulement rail A retiré) ou face à la voie k (ouest).
    // Le train y entre en marche avant et en ressort en arrière.
    // Emplacement du rail mobile : tronçon OSM « moving » 1580086185 (« waiting » avant le 20/11) (15,4 m, entre la courbe qui suit le frein final et le frein avant gare). ESTIMÉS : course du rail A (3,2 m), vitesse du chariot et du rail A
    // (0,6 m/s, 4 s au moins par déplacement), vitesse de manœuvre des trains (1,8 m/s), sens d'entrée dans les voies, chariot au repos face à la voie 1.
    yard:{at:'brake',device:'traverser',side:1,gap:GAP,post:.6,laneGap:LGAP,move:{v:1.8,vc:.6,t:4},
      devName:'Chariot',devLabel:'le chariot',retract:{d:3.2,name:'Rail mobile du parcours',short:'Rail parcours',rest:1},
      lanes:LN.map((P,k)=>lane(k+1,P))},
    // Frein avant gare (propriétaire, 2026-11-15) : zone de freinage de stockage entre le rail mobile du parcours et l'entrée de la gare, un train de long,
    // avec pneus ; AUTO par défaut (retient le train tant que la gare est occupée), MANU au choix. Position : tronçon OSM « waiting » 1580086183 (repères pre0/pre1).
    preBrake:{name:'Frein avant gare'},
    stationPoly:OSM.polys.station,stationAt:[1.5,1,9],
    fade:[[1.5,1,9],[-34,-7,12]],   // toits qui s'effacent : gare, garage
    plat:{load:5.9,exit:2.3,back:.6,front:1.2},
    // Poste de conduite : extrémité sud-est de la gare (propriétaire), côté sud-ouest de la voie, vitre tournée vers la voie, à 2,8 m de l'axe ;
    // emplacement exact ESTIMÉ (dans le décrochement sud du bâtiment OSM 148160006, là où la voie sort de la gare)
    booth:[2.8,8.0,-2.427],boothLabel:[0.4,11.6],beacon:[3.95,7.85],
    queue:{entry0:ENTRY0,link:[[61.1,16.8]],ways:[Q,TUN,B,LOOP],   // chemins de file OSM : tronçons et fourche déduits par le moteur (lot 5, engine/queue.js deduceParts) ; parts = repli
     
      parts:[
        {pts:[ENTRY0].concat(Q,TUN.slice(1),B.slice(1,6))},
        // fourche (0,6 ; -10,9) : raccourci (chemin 1580149150) ou boucle nord 1032685208. Barrières : une barrière pivotante par pointe, déduite de la fourche
        // (engine/queue.js forkGates, issue #34 ; nœuds OSM barrier=* plus lus).
        {name:'boucle nord',short:B.slice(5,8),loop:LOOP},
        {pts:B.slice(7)}]},
    approach:[{w:.5,pts:PROM.slice(0,4)},{w:.5,pts:PROM.slice(3).reverse()}],
    // allée d'accès PROM : dans la zone piétonne OSM (dessinée comme une surface, praticable partout), plus dessinée comme chemin
    paths:[OSM.paths.exit,XD],
    board:{via:[[1.4,-.9]],walk:2.9},   // entrée OSM entrance=main (1,0 ; -1,3) en haut de l'escalier ; couloir d'attente à 2,9 m de la voie (ESTIMÉ ; lot 6 : portillons rapprochés du bord)
    // Sortie OSM (2026-11-17) : entrance=exit (-1,5 ; 5,0) au bord du quai sud-ouest, chemin 1580416041, escalier 1580086196 qui descend, puis le chemin de sortie 1032354545
    exit:{door:XD[0],path:XD.concat(OSM.paths.exit.slice(1)),
      tails:[[[25.8,38.3],[27.7,40.2],[42.8,43.4],[50.5,45.3],[52.9,52.8]],[[25.8,38.3],[24,40.4],[13.8,41.6],[5,46],[-1.4,49.1]]]},   // vers la zone piétonne OSM
    catwalks:{side:{Lift:1}},  // passerelle-escalier du lift À DROITE du sens de marche : information du propriétaire (2026-11-16), pas une estimation ; freins : côté choisi par le moteur
    jobsites:{liftFix:[24,-6],chainRev:[24,-6],trackRev:[40,22],brakeFix:[-31,-38],brakeRev:[-31,-38],trainRev:[-30,-9],rearm:[1.5,-1.5]},
    view:{x:40,z:-28,w:190,h:150,bounds:[-130,200,-150,110]},
    cams:{gare:{label:'Gare',x:1.5,z:1,s:19},file:{label:'File',x:38,z:14,s:8},lift:{label:'Lift',x:38,z:-40,s:7},
      frein:{label:'Frein final',x:-26,z:-30,s:12},garage:{label:'Garage',x:-31,z:-18,s:11},
      rocher:{label:'Rocher',x:42,z:25,s:10},passerelle:{label:'Passerelle',x:35.5,z:-4.4,s:12}},
    labels:()=>[['Gare',-6,-8],['Lift — 31 m',44,-50],['Frein final',-36,-42],['Garage',-31,-4],['Pont transbordeur',-38,-33],["File d'attente",40,8],['Rocher',45,35],['Entrée',67,23]],
    text:{storm:'Orage sur l\'attraction : aucun train ne doit partir.',great:'Excellente exploitation sur la Trace du Hourra !'},
    // Commande par zones : freins de bloc B1…B3 = freins + roues de propulsion en marche avant seule (drive:'fwd', bouton AV sans AR, propriétaire 2026-11-17) ;
    // frein final, rail mobile du parcours, rail du chariot, voies = freins + moteurs (défauts du moteur, disposition ESTIMÉE). Exemple pour changer : zones:{B:{drive:false}, RA:{drive:false}}.
    helpGarage:'<b>Garage</b> : six voies droites, un train par voie, desservies par un pont transbordeur droit sur le frein final, commandées par zones. Deux éléments mobiles : '
      +'le rail mobile du parcours (rail du circuit, zone de freinage), sur le circuit (C) ou retiré vers l\'est (E), et le chariot, qui porte le rail du chariot (rail de garage) et emporte le train : en ligne avec le circuit (G) ou face à une voie (1 à 6). '
      +'Pour garer un train : envoyez-le vide (Gare AV), frein final en MANU et serré (il s\'arrête avant le pont), rail parcours sur E, chariot sur G, relâchez le frein final puis Frein final AV : il roule sur le rail du chariot et s\'y arrête ; '
      +'chariot sur une voie libre (il emporte le train), Dispatch de cette voie : le train y entre (chaque voie n\'a qu\'un bouton, Dispatch, qui choisit le sens) ; chariot ramené sur la voie 1, rail parcours sur C, TOUT AUTO. '
      +'Pour sortir un train : chariot sur la voie du train, Dispatch de la voie (il recule sur le rail du chariot), rail parcours sur E, chariot sur G avec le dernier canton libre, Rail du chariot AV : il va au frein avant gare puis entre en gare ; chariot sur une voie, puis rail parcours sur C. '
      +'Le chariot ne vient en ligne que si le rail mobile du parcours est retiré ; il ne revient que si le chariot n\'est pas en ligne. Ni l\'un ni l\'autre ne bouge si un train y roule ou n\'y est qu\'à moitié, ni avec des passagers. '
      +'Aucun rail du circuit en ligne : les trains attendent avant le pont. Gare occupée : un train attend sur le frein avant gare, un sur le rail mobile du parcours, un au frein final. Au plus cinq trains sur le parcours.'
  };
})();
