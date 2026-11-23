'use strict';
/* OzIris — configuration de l'attraction pour le moteur (engine/*.js).
   Coaster inversé Bolliger & Mabillard (Parc Astérix, 2012). Tracé, gare, file, garage (pont transbordeur et 3 voies de
   maintenance) : lieux/parc/asterix/oziris.data.js (OpenStreetMap). Ce qui est estimé est signalé « ESTIMÉ » ; caractéristiques et sources : docs/oziris-notes.md. */
const SITE=(()=>{
  const Q=OSM.paths.queue,PROM=OSM.paths.prom,QL=OSM.paths.qlink,QIN=OSM.paths.qin,XO=OSM.paths.xout;
  // File (OSM 1580173577 + 1073325805, mise à jour du 2026-11-18, changeset 192117430) : boucle ouest de (-14,1 ; 57,4) = Q[F1] à (-14,1 ; 56,1) = Q[F1B] (nœuds des barrières OSM B1) ;
  // lacets sud de 1073325805 OBLIGATOIRES : raccourci 1580173580 et barrières B2 supprimés par le propriétaire (« au final pas de barrière B2 »). Indices retrouvés par les coordonnées.
  const at=(x,z)=>{let b=0,bd=1e9;Q.forEach((p,i)=>{const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;b=i;}});return b;};
  const ENTRY0=[35.4,31.0],F1=at(-14.1,57.4),F1B=at(-14.1,56.1);
  // Garage (OSM) : pont transbordeur (railway=traverser 1330192631) sur la fin du frein final, 3 voies de maintenance (1330192628…30)
  // parallèles au frein final, en AMONT du pont, côté nord-ouest, à 3,0 / 7,0 / 11,0 m de l'axe du circuit (relevé OSM, ±0,5 m), longues de 13,3 m.
  // Le train entre donc dans sa voie en marche arrière (yard.rev). Pont à RAIL UNIQUE (propriétaire, 2026-11-15 : « c'est la voie du parcours
  // qui vient chercher les trains au garage ») : le chariot porte un seul rail, qui EST le tronçon du circuit (fin du frein final) ; P = en ligne,
  // 1…3 = face à la voie k (circuit interrompu, trains retenus avant le pont). Pas de rail de garage distinct, pas de position G.
  const lane=(n,d)=>({name:'Voie '+n,d,len:13.3,cap:1});
  return {
    id:'oziris',title:'OzIris',kind:'inverted',trackName:'Poutre caisson',goal:900,lap:140,
    // 3 trains de 8 wagons, 4 places côte à côte par wagon (Wikipedia, d'après RCDB) ; longueur (1,55 m) et largeur (2,6 m) d'un wagon ESTIMÉES.
    car:{len:1.55,n:8,seats:4,abreast:4,w:2.6},
    // 3 trains, tous BLEUS (propriétaire, 2026-11-15 ; l'article sur un 4e train est dépassé). Bleu sourd d'après les photos (voie et poutre bleues) ;
    // col2 = gris clair (lapbars, bandes, nez) pour ressortir sur la poutre bleue : teintes exactes SUPPOSÉES.
    trains:[{name:'Train 1',col:'#2c4f8c',col2:'#cfd3da',wear:26},{name:'Train 2',col:'#2c4f8c',col2:'#cfd3da',wear:42,lane:1},
      {name:'Train 3',col:'#2c4f8c',col2:'#cfd3da',wear:34,lane:2}],
    track:{spine:'#3e5a74',rail:'#262d36',support:'#a89a7c'},
    // Repères lus dans OSM (tools/specs/oziris.json, mise à jour du propriétaire 2026-11-16) : frein final 1580105919, rail du pont 541161847 (tr0/tr1 : le train s'arrête au bout
    // du rail, pas de holdBack), zone d'attente avant gare 1330192627 (pre). OSM n'a AUCUN frein de bloc en parcours : l'ancien B1 (estimé) est retiré.
    // Embarquement à l'OUEST : entrée OSM entrance=main (-12,6 ; -9,0) à l'ouest de la voie, sortie entrance=exit (-7,5 ; -9,5) à l'est (réponse à la question 24 par OSM).
    stopBack:.5,dropAfter:50,loadSide:1,
    phys:{roll:.06,drag:.0011,vmin:3},
    // Pont transbordeur à rail unique (single) : zone RB « Rail du pont » = zone de freinage du circuit (AUTO) en P, zone porteuse face à une voie.
    // ESTIMÉS : longueur du rail (un train + 0,6 m de chaque côté, pre/post ; OSM : pont ≈ 14 m), jeu rail/voies (laneGap 0,8 m),
    // vitesse du chariot (0,5 m/s, 4 s au moins), vitesse de manœuvre des trains (1,5 m/s), sens d'entrée (marche arrière, d'après la position des voies).
    yard:{at:'brake',device:'traverser',single:true,railName:'Rail du pont',rev:true,side:-1,post:.6,laneGap:.8,move:{v:1.5,vc:.5,t:4},
      devName:'Pont transbordeur',devLabel:'le pont transbordeur',lanes:[lane(1,3.0),lane(2,7.0),lane(3,11.0)]},
    // Zone d'attente avant gare (OSM « waiting » 1330192627, 15,7 m) : zone de freinage de stockage Pre, AUTO par défaut ; pneus ESTIMÉS.
    preBrake:{name:'Attente avant gare'},
    // Tunnels OSM, dans l'ordre du circuit : 1580105918 (tunnel=yes, layer=2 : galerie couverte au-dessus du sol, ajoutée par le propriétaire le 2026-11-16) ;
    // 421460641 (tunnel=yes layer=-1) : le propriétaire dit qu'il passe SOUS L'EAU (bassin) ; profondeur ESTIMÉE (≈ -3 m, profil de la spec).
    tunnels:[{under:'roof'},{under:'water'}],
    stationPoly:OSM.polys.station,stationAt:[-7,-8,9],stationRoofCol:'#b9a27a',
    fade:[[-7,-8,9],[-24,-24,12],[-35,-25,8]],   // toits qui s'effacent : gare, halle du frein final et du pont, garage
    // Quais : embarquement côté ouest (entrée OSM), débarquement côté est (sortie OSM) ; profondeurs ESTIMÉES d'après le bâtiment OSM 420016980.
    stairsOut:false,   // escaliers de la file dans la gare, tels qu'OSM (issue #13) : pas d'escalier « en applique »
    plat:{load:7.3,exit:3.5,back:.6,front:1.6},   // quai d'embarquement jusqu'à l'entrée OSM (entrance=main, à 7,0 m de la voie depuis le changeset 192118796) : profondeur ESTIMÉE
    // Poste de conduite (propriétaire, 2026-11-16 : « au sud-est ») : côté est (débarquement), en tête de quai, juste derrière le quai de sortie, entièrement dans
    // le bâtiment de gare OSM 420016980, vitre tournée vers la voie ; emplacement exact ESTIMÉ.
    booth:[-9.7,0.29,2.007],boothLabel:[-5.6,1.6],beacon:[-8.6,-1.6],
    queue:{entry0:ENTRY0,link:[[37.4,27.8]],ways:[Q,OSM.paths.qloopW,QIN],   // chemins de file OSM : tronçons et fourche déduits par le moteur (lot 5, engine/queue.js deduceParts) ; parts = repli
     
      parts:[
        // File OSM (propriétaire, 2026-11-16, 2e correction) : 1580173577 de l'entrée à la fourche (-15,5 ; 57,4) = Q[F1] ; boucle ouest 1580173578 + 1580173579 qui revient
        // à la fourche ; 1073325805 vers la gare, lacets sud compris (plus de raccourci ni de barrière B2 depuis le 2026-11-18).
        {pts:[ENTRY0].concat(Q.slice(0,F1+1))},
        // barrières : une barrière pivotante par pointe, déduite de la fourche (engine/queue.js forkGates, issue #34 ; nœuds OSM barrier=* plus lus)
        {name:'boucle ouest',loop:OSM.paths.qloopW,short:Q.slice(F1,F1B+1)},
        // fin de la file (OSM 2026-11-18, changeset 192117430) : chemin 1580105930, file souterraine sous la gare (1580105922 / 1580105931 / escalier 1580105924 au niveau -2,
        // couloir 1580105925 au niveau -1 ; visibles seulement avec « Masquer la gare »), escalier 1580105926 qui remonte au niveau 0 (fin d'escalier visible gare affichée),
        // allées 1580105937 / 1580105923 / 1580105936 / 1580105935 jusqu'à l'entrée du quai ouest (entrance=main)
        {pts:Q.slice(F1B).concat(QIN.slice(1))}]},   // jusqu'au nœud de la porte (dernier point de 1580105935) : allée dessinée et clôturée jusqu'au bout
    approach:[{w:.5,pts:[[57.4,-2.3],[50.4,21.4],[38.1,26.5]]},{w:.5,pts:[[-5.3,19.5],[34.4,27.3],[38.1,26.5]]}],
    paths:[PROM,QL,XO],
    // Entrée de la gare (OSM entrance=main, (-7.4, 4.3)) puis couloir d'attente côté est
    board:{via:[QIN[QIN.length-1]],walk:4.45},   // entrée OSM de la gare (entrance=main, (-16,7 ; -12,0), changeset 192118796 du 2026-11-18), au bout de la file ; couloir d'attente à 4,45 m de la voie (ESTIMÉ ; lot 6 : portillons rapprochés du bord)
    // Sortie (OSM 2026-11-16) : porte entrance=exit (-7,5 ; -9,5) du quai est, passerelle 1580105927 (layer 2), escalier 1580105929 qui descend, allée 1580105928 vers l'est.
    exit:{door:XO[0],path:XO,
      tails:[[[10.4,-.7],[10.6,-4.3],[11.1,-12.1],[14.8,-27.4],[39.5,-8.3],[50.7,-1.1]],[[10.4,-.7],[-1.3,9.0],[-5.3,19.5]]]},
    catwalks:{side:{Lift:1}},  // coaster inversé : plancher galvanisé pleine largeur sous la voie (issue #20, moteur) ; side = côté des tours d'escalier (lift à droite : information du propriétaire, 2026-11-16)
    jobsites:{liftFix:[-45,40],chainRev:[-45,40],trackRev:[20,40],brakeFix:[-30,-8],brakeRev:[-30,-8],trainRev:[-36,-26],rearm:[-4,-8]},
    view:{x:-12,z:5,w:230,h:200,bounds:[-120,120,-110,110]},
    cams:{gare:{label:'Gare',x:-8,z:-9,s:17},file:{label:'File',x:-15,z:45,s:7},lift:{label:'Lift',x:-42,z:30,s:7},
      dive:{label:'Dive loop',x:-14,z:68,s:8},looping:{label:'Looping',x:24,z:38,s:9},imm:{label:'Immelmann',x:46,z:45,s:8},
      galerie:{label:'Galerie',x:34,z:43,s:12},tunnel:{label:'Tunnel',x:18.5,z:2.5,s:15},zg1:{label:'Zéro-G 1',x:30,z:-66,s:8},zg2:{label:'Zéro-G 2',x:-20,z:34,s:8},frein:{label:'Frein final',x:-26,z:-20,s:11},garage:{label:'Garage',x:-27,z:-27,s:13}},
    labels:()=>[['Gare',-22,-18],['Lift — 40 m',-58,40],['Frein final',-44,-12],['Garage',-45,-30],['Pont transbordeur',-20,-46],
      ["File d'attente",-30,57],['Entrée',38,36],['Tunnel sous l\'eau',28,3],['Galerie couverte',36,49],['Boutique',6,-12],
      // Inversions : plan des figures fourni par le propriétaire (affiche, stylisée) rapproché du tracé OSM par la forme ; emplacements ± 10 m, hauteurs ESTIMÉES.
      ['Dive loop',-8,92],['Looping vertical',36,22],['Immelmann',66,57],['Roulis zéro-G',2,-70],['Roulis zéro-G',8,63]],
    strike:{area:[-90,90,-90,90]},
    text:{storm:'Orage sur l\'attraction : aucun train ne doit partir.',great:'Excellente exploitation sur OzIris !'},
    // Commande par zones : frein final, rail du pont, attente avant gare, voies = freins + moteurs (défauts du moteur, ESTIMÉ, à confirmer).
    helpGarage:'<b>Garage</b> : trois voies de maintenance parallèles au frein final, en amont du pont transbordeur, un train par voie. '
      +'Le pont porte un seul rail, le rail du pont : c\'est la fin du frein final, qui vient chercher les trains au garage. En P il est en ligne avec le circuit ; '
      +'face à une voie (1 à 3), le circuit est interrompu et les trains attendent avant le pont. Les voies étant en arrière du pont, le train y entre en marche arrière et en ressort en marche avant. '
      +'Pour garer un train : envoyez-le vide (Gare AV), Rail du pont en MANU et freins serrés (il s\'y arrête), pont sur une voie libre (il emporte le train), '
      +'relâchez les freins puis Dispatch de cette voie : il recule dans la voie ; pont sur P, TOUT AUTO. '
      +'Pour sortir un train : pont face à sa voie, Dispatch de la voie (il avance sur le rail du pont), pont sur P avec le dernier canton libre : il repart vers la gare. '
      +'Le pont ne bouge pas si un train y roule, n\'y est qu\'à moitié, ou avec des passagers. Dispatch choisit seul le sens : entrée si un train est sur le pont face à une voie libre, sinon sortie.',
    draw:{
      floor(ctx,s,{lw}){ // escalier de sortie OSM 1580105929 (vers l'allée est)
        if(s>5){ctx.save();ctx.translate(1.6,-5.2);ctx.rotate(Math.atan2(2.7,5.3));ctx.fillStyle='#a8a296';ctx.fillRect(-3,-.7,6,1.4);
          ctx.strokeStyle='rgba(60,56,50,.6)';lw(.06,.5);ctx.beginPath();for(let x=-2.9;x<3;x+=.35){ctx.moveTo(x,-.65);ctx.lineTo(x,.65);}ctx.stroke();ctx.restore();}
      }}
  };
})();
