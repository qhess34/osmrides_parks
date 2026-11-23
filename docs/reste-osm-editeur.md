# Reste à traiter côté OSM / éditeur (audit du 2026-11-23)

Audit en lecture seule de `lieux/parc/asterix/{zeus,hourra,oziris,goudurix}.js`, `*.game.js`, `tools/specs/*.json`, `tools/make_site.py`, et de l'éditeur (`osmrides/editor/schema.js`, `docs/ref/editeur.md`).
Catégories : A déjà lu dans OSM ; B déjà réglable dans l'éditeur ; C écrit à la main, équivalent OSM possible ; D écrit à la main, propre au jeu ; E estimé (en plus de C/D).
Clés distinctes de `SITE` : 47 (A 6, B 6, C 14, D 21 ; E signalé sur 12 d'entre elles). Les 4 `*.game.js` n'ont **aucun** `GAME.site` : les clés B sont encore toutes dans `SITE` (réglables, mais pas encore saisies dans l'éditeur).

## État actuel (rappel)
- A : `stationPoly` (`OSM.polys.station`), `queue.ways` / `paths` / `exit.path` (chemins OSM), tunnels (`OSM.tunnels`, sauf Zeus), barrières, escaliers, portes, largeurs, salle de contrôle (`OSM.ctl`, Zeus seulement), repères lift / freins / gare (`roller_coaster:track`), garage Hourra (6 voies + rails lus dans OSM), garage Zeus et Goudurix (voies OSM), bâtiments (`height` ou `building:levels`), `surface` des files (Zeus, Hourra, Oziris ; Goudurix : aucun tag).
- B (éditeur, liste blanche `GAME.site`) : `kind`, `car` {len, n, seats, abreast, restraint}, `trains` (nom, couleurs, usure, voie), `track` {spine, rail, support}, `trough`, `phys` {roll, drag, vmin} ; GAME natif : `barriers`, `controlRooms`, `boardAreas`, `board.depth`, `queueEntry`, `look` (sol, matériau, toit). Renvoyables vers OSM : `surface`, `colour`, `material`, `roof:colour` seulement.
- Dans OSM mais **vides** : `roof:colour` (4 bâtiments de gare), `colour` des tronçons de voie (4 attractions), `surface` des 3 chemins de file de Goudurix. `ele` : aucun nœud (profils 100 % estimés).

## Table C : écrit à la main, équivalent OSM possible
| Clé | Attractions | Valeur actuelle | Tag OSM proposé | Estimé |
|---|---|---|---|---|
| `stationRoofCol` | zeus, oziris, goudurix | `#a24e38`, `#b9a27a`, `#9b8f7d` | `roof:colour` sur le bâtiment de la gare (lu déjà par `OSM.attrs` rôle `roof`, tag absent) | oui (teintes) |
| `track` (spine, rail, support) | oziris, goudurix | bleu / jaune-rouille | `colour` sur les tronçons `roller_coaster=track` (rôle `track` lu, tag absent) ; supports : `colour` sur `man_made=support`? à vérifier | oui |
| `trough` (couleurs) | hourra | rouge sourd | `colour` des tronçons de voie | oui |
| `title` | 4 | nom | `name` de l'attraction / de la gare | non |
| `booth` + `boothLabel`, `beacon` | hourra, oziris, goudurix | poste à la main | bâtiment nommé « Salle de contrôle » (`OSM.ctl`, déjà lu : seul Zeus l'a) | oui (position) |
| `plat` {load, exit, back, front} | 4 | 5,9 à 7,9 m | polygone `area:highway=footway` + `covered=yes` du quai (création prévue D12), sinon `width` | oui (profondeurs d'après bâtiment) |
| `stationAt`, `fade` | 4 | centres de toit | calculables depuis `polys.station` (centroïde) | non (calculable) |
| `approach`, `exit.tails`, `exit.path` partiel | 4 | coordonnées copiées | `highway=footway` déjà dans OSM : les déclarer dans `paths` de la spec (Zeus : `PROM_W`, `PROM_N` en dur, 20 points) | non |
| `tunnels` | zeus | s 847-897 | `tunnel=yes` ou `covered=yes` + `layer` (tunnel 2 absent d'OSM) ; hors OSM : `tunnels_extra` | oui |
| `yard` géométrie | zeus (a, b, slide, len) ; goudurix (a 45,4 ; b 51,6 ; slide ; len) ; oziris (`d` = 3, 7, 11, `len` 13,3) | cotes à la main | voies de maintenance dessinées (`roller_coaster:track=maintenance`/entretien) comme Hourra | oui |
| pont de bois `BRIDGE` | goudurix | 3 points en dur dans `goudurix.js` | way OSM 161214279 (`bridge=yes`, `layer=1`) : à lire via `paths` | non |
| `labels` | 4 | libellés + coordonnées, « Lift — 40 m » en dur | `name` des nœuds / ways (`OSM.pois` déjà exporté), `height` du lift | non (« 30 m », « 40 m » en dur) |
| `draw` (garde-corps quais Zeus, statue) | zeus (floor, landmarks, shadows) ; goudurix, oziris (floor) | coordonnées canvas | `barrier=handrail`/`fence` (déjà lus pour les files), `tourism=artwork` pour la statue | oui |
| `view.bounds` | 4 | copie de `bbox` | calculable depuis la spec | non |
| profil des hauteurs (spec `profile`, `level`, `flat`) | 4 (180, 22, 31, 38 points) | hauteurs inventées | `ele` / `height` sur les nœuds de voie (lu par `make_site.py` : `ele_ground`, `ele_keep`) ; issue #5 | **oui** |

## Table D : écrit à la main, propre au jeu (à mettre dans l'éditeur)
| Clé | Attractions | Valeur actuelle | Onglet éditeur proposé | Estimé |
|---|---|---|---|---|
| `goal`, `lap` | 4 | 400 / 900 / 500 ; 110-150 | « Exploitation » | oui |
| `stopBack`, `holdBack`, `dropAfter`, `loadSide` | 4 (`holdBack` : zeus 4, goudurix 34) | réglages d'arrêt | « Exploitation » | oui (goudurix ±1 m) |
| `maxRun`, `trains[].lane` (départ garage) | hourra 5 ; hourra, oziris | | « Trains » (nombre déjà borné par `TRAIN_MAX`) | non |
| `yard.move` (v, vc, t), `devName`, `devLabel`, `retract`, `laneGap`, `post`, `rev`, `single`, `rotary`, `s` | 4 | 1,5-2,4 m/s ; 3-4 s ; course 3,2 m | « Garage » | oui |
| `preBrake`, `zones` (goudurix B1 trim 8 m/s) | hourra, oziris ; goudurix | 29 km/h | « Freins et zones » | oui |
| `catwalks.side`, `catwalks:false` | zeus, hourra, oziris, goudurix | Lift à droite | « Décor » | non (propriétaire) |
| `jobsites` (7 postes de chantier) | 4 | coordonnées | « Postes de maintenance » (clic carte) | oui |
| `cams`, `view` | 4 | caméras nommées | « Caméras » (cadrage courant) | non |
| `text` (orage, bravo), `helpGarage`, `strike` | 4 (`strike.spot` zeus) | textes, zones | « Textes et météo » | non |
| `noStroll`, `hideNames`, `stairsOut`, `board.walk`, `board.via` | zeus ; zeus ; oziris ; 4 | | « File et quai » (`board.walk` : issue lot 6 ESTIMÉ) | oui (`walk`) |
| `car.len`, `car.w` (hors liste éditeur : `w`, `inline`, `pitch`) | 4 | 1,5 à 2,55 m | « Attraction » : ajouter `w`, `inline`, `pitch` à la liste blanche | oui |
| spec `phys`, `keep`, `png_scale` | 4 | frottements | hors éditeur (outil) ; `phys` déjà B | non |

## Cas particuliers codés à la main (présents dans une seule attraction)
- Zeus : tunnel à effets absent d'OSM (s 847-897, largeur 2,3 m ESTIMÉE) ; `st1` forcé à 24 m (spec `tags`, gare OSM 18 m < train) ; `PROM_W` / `PROM_N` ; statue, ombre, toit à deux pans (`draw`) ; aiguillage en S coulissant ; `GAME.queueEntry` et `gateAtMouth` (ajustement jeu).
- Hourra : pont transbordeur droit + rail mobile (course 3,2 m ESTIMÉE) ; `trough` ; `maxRun` ; hauteur du rocher 9,8 m ESTIMÉE par le moteur ; spec : tags de voies de garage cassés dans OSM (à corriger en maintenance).
- Oziris : pont transbordeur à rail unique (`single`, `rev`) ; tunnel sous l'eau (profondeur -3 m ESTIMÉE) ; `stairsOut:false` ; inversions : seulement des libellés (emplacements ± 10 m, hauteurs ESTIMÉES) ; spec `roles` (gares coupées) à retirer si OSM corrigé.
- Goudurix : aiguillage rotatif en S (`rotary`, `s`, HYPOTHÈSE : une face droite, une face en S) ; `inversions` en spec (loop 22 m, corkscrew double : `h`, `r`, `n` ESTIMÉS) ; `holdBack` 34 ; `zones.B1.trim` ; passerelle grillée dessinée (3,6 x 5 m ESTIMÉE) ; quais ESTIMÉS (bâtiment OSM trop étroit) ; QUESTION ouverte du propriétaire (frein final / B1, spec `osm_brakes`).
- Valeurs en dur dans les specs : hauteurs de `profile` ; zeus `flat` 26-1050 ; `level` ; `tunnels_extra` ; coordonnées `jobsites`.

## Lots proposés (ordre conseillé)
1. **Parcs, OSM (saisie par le propriétaire, sans code)** : poser `roof:colour` (gares), `colour` (voies, trough), `surface` (Goudurix), `name` / `height` du lift ; corriger les tags cassés (hourra 1582324002…006) ; `ele` sur quelques nœuds de lift et sommets. Valeur : les réglages B/E deviennent lus dans OSM. Dépend de rien.
2. **Parcs, spec** : déclarer `PROM_W/N`, `BRIDGE`, voies de maintenance Oziris / Goudurix en `paths` ; calculer `stationAt`, `fade`, `view.bounds` ; retirer `stationRoofCol`, `track.*` de `SITE` une fois lus (priorité GAME > OSM > SITE déjà en place pour toit et voie). Après le lot 1.
3. **Moteur / éditeur [→ issue inter-equipe osmrides]** : élargir la liste blanche `GAME.site` (`goal`, `lap`, `stopBack`, `holdBack`, `dropAfter`, `loadSide`, `maxRun`, `text`, `plat`, `car.w/inline/pitch`, `zones`) avec bornes, onglet « Exploitation » ; sans équivalent OSM, donc sans bouton OSM.
4. **Moteur / éditeur [→ issue inter-equipe osmrides]** : onglets « Garage » (vitesses, durées, course du rail), « Postes de maintenance » (`jobsites`, clic carte) et « Caméras » ; lecture de `roller_coaster:*` et `OSM.stations` déjà prévue côté `make_site.py`.
5. **Parcs, saisie dans l'éditeur** : une fois le lot 3 livré, déplacer les valeurs D de `SITE` vers `GAME.site` (4 attractions), garder `SITE` pour le décor et `draw`.
6. **Parcs, estimés** : confirmer avec le propriétaire les E à fort impact (profils et hauteurs, quais Goudurix, tunnel 2 Zeus, vitesses de garage) ; remplacer `draw` Zeus par `barrier=handrail` et `tourism=artwork` si dessinés dans OSM (dernier lot, faible valeur).
