# OzIris — notes

Coaster inversé Bolliger & Mabillard, Parc Astérix (zone Égypte), ouvert le 7 avril 2012. Configuration : `lieux/parc/asterix/oziris.js` ; spec : `tools/specs/oziris.json` ; données : `lieux/parc/asterix/oziris.data.js`.

## Caractéristiques (sources)

| Donnée | Valeur | Source |
|---|---|---|
| Longueur | 1 000 m (3 280 ft) | Wikipédia (infobox d'après RCDB), coaster.cloud, annonce du parc 2012 (newsparcs) |
| Hauteur | 40 m | Wikipédia, annonce du parc |
| Chute | 35 m | Wikipédia |
| Vitesse | 90 km/h | Wikipédia, annonce du parc |
| Inversions | 5 | Wikipédia, annonce du parc, thrillzing |
| Durée | ≈ 2 min 15 | Wikipédia, coaster.cloud |
| Trains | **3** trains de 8 wagons, 4 places côte à côte (32 par train), **tous bleus** | Wikipédia (d'après RCDB) ; confirmé par le propriétaire (2026-11-15) |
| Capacité | 1 600 pers./h | coaster.cloud |
| Taille minimale | 1,30 m | OSM (nœud 1732704742) |
| Éléments | grande boucle plongeante (« dive loop », 30 m) après la chute (Wikipédia) ; looping vertical, Immelmann, vrille (thrillzing) ; roulis zéro-G cité ailleurs, non confirmé | Wikipédia, thrillzing |

Contradictions : CoasterBuzz donne **2** trains (Wikipédia/RCDB : 3) ; la liste des éléments diffère selon les sources (dive loop / Immelmann, zéro-G non confirmé). On a retenu 3 trains (confirmé par le propriétaire, 2026-11-15 ; l'article annonçant un 4e train est dépassé).
Accès : rcdb.com, wikipedia.org (WebFetch) et Coasterpedia n'étaient pas joignables depuis la session (réseau) ; chiffres pris des extraits de recherche web (RCDB 9675 cité par Wikipédia). À revérifier sur rcdb.com/9675.htm.

Sources : https://en.wikipedia.org/wiki/OzIris · https://coasterbuzz.com/RollerCoasters/oziris · https://coaster.cloud/en/attractions/b9362601-oziris · https://thrillzing.com/roller-coasters/oziris-parc-asterix/ · https://www.newsparcs.com/en/article/00005665-oziris_la_nouvelle_creation_a_sensations_fortes_du_parc_asterix

## Repères OSM (extrait du parc, origine [49.1343, 2.5665])

- Circuit (858 m au sol, 904 m en 3D estimés) : gare 937048122 → lift 541161843 → 937048120 → 541161845 → 541161844 → tunnel 421460641 (layer −1) → 541161850 → 1102773847 → 541161849 → 1101623925 → 541161848 → frein 541161847 (brake_run) → 937048121 → attente 1330192627 (waiting) → gare.
- Gare : bâtiment 420016980 (building=retail, 2 niveaux : gare surélevée et boutique), auvent 420016979, entrée `entrance=main` (−7,4 ; 4,3).
- Pont transbordeur : `railway=traverser` 1330192631 sur la fin du frein final (s ≈ 798…812) ; voies de maintenance 1330192628/29/30, 13,3 m, parallèles au frein final, **en amont** du pont, à ≈ 3 / 7 / 11 m de l'axe, côté nord-ouest ; bâtiment 420016988 (garage), halle 420016978.
- File : chemin 1073325805 (oneway), qui repasse par le nœud (−17 ; 57,3) : boucle ouest facultative = fourche ; liaison 1220633163 ; allée 421508668.

## Ce qui est estimé

- Profil en hauteur : lift 40 m et chute 35 m (sources), hauteurs des inversions ESTIMÉES (voir « Inversions »), colline s ≈ 610 (16 m, non sourcée) ; vitesse calculée max 25,7 m/s (92 km/h) ; croisements ≥ 3,4 m (s 667 × 729).
- Frein de bloc B1 (s ≈ 520, haut de la grande courbe nord) : supposé (3 trains imposent au moins 4 cantons).
- Quais : embarquement à l'est (côté file), débarquement à l'ouest, sortie par un escalier et un passage sous la gare surélevée vers la boutique. Profondeurs de quai, poste de conduite.
- Pont : longueur du rail (un train + 2 × 0,6 m), jeu rail / voies (0,8 m), vitesse du chariot (0,5 m/s) et des manœuvres (1,5 m/s) ; entrée dans les voies en marche arrière (déduit de la position des voies).
- Longueur (1,55 m) et largeur (2,6 m) d'un wagon ; teinte exacte du bleu des trains (`#2c4f8c`, lapbars gris clair) et de la voie (non vérifiées ; les trains sont bleus, confirmé).

## Tunnel (propriétaire : « sous l'eau », 2026-11-15)

OSM way 421460641 (`tunnel=yes`, `layer=-1`, `covered=yes`, 13 m au sol, de (15,7 ; 8,4) à (21,1 ; −3,2)) : section du circuit qui passe **sous le bassin** (le propriétaire confirme : sous l'eau). Exporté en `OSM.tunnels=[[491,503.8]]` (s du moteur) par `tools/make_site.py` ; `SITE.tunnels:[{under:'water'}]`. Rendu : dalle d'eau (TEX.water) sur la voie et les trains, deux portails en béton aux deux bouts, toits retirés = vue translucide du tunnel. **Profondeur ESTIMÉE** : fond à ≈ −3 m (rails sous le niveau de l'eau) ; pentes d'accès ≈ 20 %, vitesse maxi inchangée (92 km/h), croisements ≥ 3,4 m conservés. Le `man_made=tunnel` 1353118256 est à (505 ; 427), c'est-à-dire hors OzIris : ignoré.

## Inversions — affiche du propriétaire (2026-11-15)

Source : `docs/sources/oziris-plan-figures-affiche.png` (affiche stylisée du plan : Dive Loop, Vertical Loop, Immelmann, Zero-G Roll ×2 ; hauteur 131,2 ft = 40 m, chute 114,8 ft = 35 m, vitesse 56 mph = 90 km/h, 5 inversions). C'est un dessin d'artiste : formes lissées, tournées d'environ 180° par rapport à la carte (nord en bas), recadrées à gauche (le bout de l'Immelmann sort de l'image). Rapprochée du tracé OSM **par la forme** : lift en diagonale le long de la gare, bec pointu du dive loop, zigzag du looping, longue pointe de l'Immelmann, boucle du haut, goutte près de la gare, rectangles = zone garage / pont. Confiance : bonne pour l'ordre et les cinq zones, moyenne pour les emplacements exacts (± 10 m) ; les flèches de légende des deux roulis zéro-G sont imprécises (placés sur les deux boucles croisées du tracé).

Ordre de marche (s = abscisse de la spec, 3 × l'indice du point de contrôle) :

| Ordre | Élément | s (m) | Repère OSM / forme | Hauteur ESTIMÉE |
|---|---|---|---|---|
| 0 | Lift, sommet puis chute 35 m | 30–96, chute 118–162 | épingle en haut du lift (s 105–114), droite vers l'est | 40 m puis 5 m |
| 1 | Dive loop | 165–205 | bec pointu s 180 (−9 ; 80) | 30 m au bec |
| 2 | Looping vertical | 240–290 | zigzag s 255–279 (22 ; 38) | 29 m vers s 267 |
| 3 | Immelmann | 295–345 | longue pointe s 315–324 (64 ; 45) | 28 m vers s 318 |
| 4 | Roulis zéro-G 1 | 475–510 | boucle du nord, croisement s 493 × 558 (25 ; −60) | 20 m |
| 5 | Roulis zéro-G 2 | 680–740 | goutte près du lift, bec s 684–708, croisement s 667 × 729 | 15 m vers s 706 |

Reste ESTIMÉ : hauteurs des sommets (rien d'autre que 40 m, 35 m, ≈ 30 m pour le dive loop n'est sourcé), emplacements exacts, forme des raccords. Ambiguïté : le tracé OSM ne distingue pas la chute et le dive loop ; on a mis la chute de la crête (s 118) au bas (s 162), le dive loop au bec qui suit. Les inversions ne portent pas de dévers dans les données (le moteur lit `cps[3]` mais en vue de dessus un dévers de 180° n'apporte rien) ; frein de bloc B1 (s 520) conservé, supposé.

## Garage — réponse du propriétaire (2026-11-15)

« C'est la voie du parcours qui vient chercher les trains au garage. » Le pont porte **un seul rail**, le tronçon du circuit (fin du frein final) : `yard.single` ([[`docs/manoeuvres.md`](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md), « Pont à rail unique »). P = en ligne ; 1…3 = face à la voie k, circuit interrompu (trains retenus avant le pont). Garer : le train vide s'arrête sur le rail (zone « Rail du pont » `RB` en MANU, freins serrés), le rail l'emporte devant la voie, Rail du pont AR le pousse dans la voie, le rail revient vide en P. Sortir : rail vide devant la voie, Voie k AV (sur le rail), rail en P, le train repart vers la gare. Captures : `docs/plans/oziris-garage.jpg`. Question 21 de `docs/plans/QUESTIONS.md` répondue (un rail) ; reste le sens de translation, déduit de la carte.

## Questions ouvertes

Voir `docs/plans/QUESTIONS.md` (section OzIris) et [[`docs/JOURNAL.md`](https://github.com/qhess34/osmrides/blob/main/docs/JOURNAL.md)](https://github.com/qhess34/osmrides/blob/main/docs/JOURNAL.md).

## Documents fournis par le propriétaire (2026-11-15)

- Page de recherche d'images enregistrée : seules des **miniatures** (≈ 590 × 330 px) y figurent.
- (miniature supprimée au nettoyage du 2026-11-17, doublon de l'affiche) panneau « OzIris » avec le **plan des figures** (tracé vu de dessus, noms des inversions en légende). À cette taille, les noms des figures sont **illisibles** ; seule la forme générale est exploitable. Remplacée par l'affiche en grand, voir « Inversions ».
- Une miniature d'article titre « Un quatrième train fera son arrivée sur le parcours d'OzIris » : dépassée, le propriétaire confirme **3 trains bleus**.
- Photos : voie et poutre **bleues**, supports **crème / sable**, sièges suspendus ; décor égyptien (gare à colonnes, bassins).

## Mise à jour OpenStreetMap du propriétaire (2026-11-16)

- **Repères lus dans OSM** (`tools/specs/oziris.json`, `osm_brakes`) : gare 937048122 (`station`, 21,2 m : le train s'arrête 3 m plus loin qu'avant), lift 541161843 (s 30 → 100 m), zones `waiting` : **frein final** 1580105919 (s 768–791), **rail du pont transbordeur** 541161847 (s 798–812, repères `tr0`/`tr1`), **zone d'attente avant gare** 1330192627 (s 842–858) → nouvelle zone de freinage `Pre` (« Attente avant gare »). **Aucun frein de bloc en parcours** : l'ancien B1 (estimé) est retiré (question prioritaire 3). Rail unique du pont (propriétaire) : cohérent avec OSM (un seul tronçon `waiting` sur le pont).
- **Deuxième tunnel** : 1580105918 (`tunnel=yes`, `layer=2`, s moteur 337–350, sortie du looping vertical) : dessiné en **galerie couverte** (toit de béton, portails) puisque `layer` > 0 (question prioritaire 2). Le tunnel sous l'eau (421460641) est inchangé.
- **Embarquement à l'ouest** (réponse à la question 24 par OSM) : `entrance=main` (-12,6 ; -9,0) à l'ouest de la voie, `entrance=exit` (-7,5 ; -9,5) à l'est. `loadSide` passe à 1 ; poste de conduite déplacé côté ouest (ESTIMÉ).
- **File** : fin de 1073325805 refaite (zigzag ouest), chemin 1580105930, **passage sous la gare** (1580105922, `tunnel=yes`, `layer=-1`), escaliers et passerelles 1580105924…1580105934 jusqu'à l'entrée ; dessinés quand le toit s'efface.
- **Sortie** : passerelle 1580105927 (`layer=2`), escalier 1580105929, allée 1580105928 vers l'est (remplace l'escalier et le passage sous la gare estimés).
- **Réponses du 2026-11-16** : la galerie 1580105918 (`tunnel=yes`, `layer=2`) est bien au-dessus du sol (toit de béton) ; aucun frein de bloc en parcours ; **pas de barrière dans la file** : file unique (fourche et barrière ESTIMÉES supprimées de `lieux/parc/asterix/oziris.js`). Escaliers OSM dessinés en marches, passerelles OSM en tablier.
- **File, 2e correction du propriétaire (2026-11-16, changesets 192031122 / 192031244)** : OzIris **a** des barrières. 1580173577 de l'entrée à la fourche (-15,5 ; 57,4) ; boucle ouest 1580173578 + 1580173579 qui revient à la fourche, deux barrières liées (entrée et sortie de la boucle) ; 1073325805 vers la gare, lacets sud évités par le raccourci 1580173580 (une barrière sur le raccourci). Emplacements exacts des barrières ESTIMÉS (1,6 m et 0,6 m des fourches).
- **Pupitre** (propriétaire : « au sud-est, il dépasse de la gare ») : poste de conduite déplacé côté est, en tête de quai, juste derrière le quai de débarquement, dans le bâtiment OSM ; emplacement exact ESTIMÉ.


### Lot 3 (propriétaire, 2026-11-16, soir)

- Règle générale des barrières (entrée ET sortie de chaque chemin de file fermable, liées) : le raccourci des lacets sud 1580173580 (1,4 m) reçoit une barrière de sortie, posée par le moteur ; sur un chemin aussi court, les deux barrières sont à 20 % de sa longueur de chaque bout. Barrières à tester par le propriétaire.
- Escaliers d'entrée 1580105924 / 1580105926 : parallèles et collés, ramenés à 0,9 m chacun (pas de chevauchement) ; escalier de sortie 1580105929 : 1,6 m.

### Lot 4 (propriétaire, 2026-11-16, fin de journée)

- **Raccourci des lacets sud** 1580173580 (1,4 m) : UNE barrière de fourche pivotante (`{on:'fork', pair:false}`), poteau dans la pointe de la fourche (ESTIMÉ), qui ferme soit le raccourci (lacets en service), soit les lacets ; plus de barrière de sortie.
- **Escaliers** : largeur du chemin dessiné qu'ils prolongent (escaliers d'entrée : largeur de la file, sans chevauchement ; escalier de sortie 1580105929 : allée, 3,2 m).

- **Lot 5 (2026-11-16)** : barrière pivotante des lacets sud : poteau au **sommet de l'angle** entre raccourci et lacets ; file 1 m (ESTIMÉ) **délimitée de barrières** des deux côtés dans la zone piétonne de l'entrée et le long des quais ; couloirs sous la gare visibles seulement avec « Masquer la gare » ; escalier de sortie 1580105929 : 2 m ; promeneurs exclus des chemins de la file.

### Issue #19 (propriétaire, 2026-11-18, changeset 192117430)

- « Au final pas de barrière B2 » : raccourci 1580173580 et nœuds B2 supprimés dans OSM ; lacets sud obligatoires ; partie « lacets sud » retirée de `lieux/parc/asterix/oziris.js`, entrées `fork:lacets sud:*` retirées de `lieux/parc/asterix/oziris.game.js`.
- File souterraine revue : 1580105922 (niveau -2, plus de zigzag sous la gare), 1580105931 et escalier 1580105924 (-2), couloir 1580105925 (-1), escalier 1580105926 (`layer=-1`, `incline=up`) qui remonte au niveau 0 ; 1580105932 supprimé ; allées 1580105937 / 1580105923 / 1580105936 / 1580105935 (niveau 0) jusqu'à l'entrée du quai `entrance=main` (-15,9 ; -11,7).
- Gare affichée : niveaux -1 et -2 cachés (ni tracé, ni visiteurs), fin d'escalier au débouché de 1580105926 ; allée 1580105923 rétrécie à 0,6 m (à 3,6 m de la voie, portillons à 2,2 m) : dégagement de 1,15 m au lieu de 1,2 m, l'axe OSM traverse encore les travées d'attente (question au propriétaire). Montage : `docs/plans/lot-oziris-gare.jpg`.
- 2e demande (2026-11-18, changeset 192118796) : allées 1580105937 / 1580105923 / 1580105936 / 1580105935, haut de l'escalier 1580105926 et entrée `entrance=main` (-16,7 ; -12,0) déplacés d'environ 1 m vers l'ouest ; quai d'embarquement porté à 7,3 m (ESTIMÉ) pour atteindre l'entrée ; travées d'attente de 1,4 m (2 rangs de 2, ESTIMÉ) ; plus aucune allée visible dans la zone des portillons (1,16 m de marge). Montage : `docs/plans/lot-oziris-gare2.jpg`.

### Issue #29 (propriétaire, 2026-11-19)

Aucun visiteur visible sur l'allée 1580105935 (niveau 0, de (-13,9 ; -18,1) à la porte entrance=main) : la file y passait bien (≈ 15 visiteurs en exploitation chargée), mais ils étaient cachés comme s'ils étaient dans les couloirs souterrains qui passent dessous en plan (1580105925 niveau -1, presque parallèle). Corrigé dans le moteur (`engine/render.js` `inCovQ`) : seuls les visiteurs d'un tronçon de file qui fait partie du couloir sont cachés.

## Réimport du 2026-11-20 (issue #33)

- Changements OSM du propriétaire : tags seulement (frein final 1580105919 en `brake_run`, rail du pont 541161847 en `moving`, bouts de gare 1580412872 / 1580412873 sans `moving`, tunnel 421460641 `covered=yes` + `layer=-1`). Voie, repères et file inchangés.
- Aucune salle de contrôle dans OSM (repli `SITE.booth`), aucun `ele` : profil ESTIMÉ.
