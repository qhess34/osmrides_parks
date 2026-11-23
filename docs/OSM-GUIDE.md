# Guide OpenStreetMap pour OSMrides

À quoi sert ce guide : préparer OpenStreetMap (OSM) **avant** d'importer une attraction, pour que le jeu lise les données au lieu de les estimer.
Il dit quels objets et quels tags le jeu lit déjà, et lesquels il pourrait lire si on les ajoutait.

- **Lu** : déjà utilisé par `tools/make_site.py`, `tools/make_park.py` ou le moteur.
- **Prévu** : pas encore lu, mais le jeu le lira dès qu'il apparaît (à brancher au besoin).
- **Utile** : pas lu aujourd'hui, mais il remplacerait une estimation.

Règle générale : n'ajoute dans OSM que ce qui est vrai sur le terrain. N'invente pas de tag propre au jeu ; les tags de ce guide sont tous des tags OSM existants.
Ce qui ne peut pas aller dans OSM, et la liste des corrections OSM proposées par attraction : `docs/OSM-LIMITES.md` (issue #30).
Après une session d'édition, il suffit de dire « OSM mis à jour » : le jeu retrouve tes changements du jour par l'historique des changesets (`docs/NOUVELLE-ATTRACTION.md` §4).

## 1. Voie du circuit

| Objet | Tags | Statut | Ce que le jeu en fait |
|---|---|---|---|
| Tronçons de voie | `roller_coaster=track` | Lu | Tracé du circuit, assemblé en boucle fermée. |
| Type de tronçon | `roller_coaster:track=station` | Lu | Gare (repères début et fin de quai). |
| | `roller_coaster:track=lift_hill` | Lu | Lift (début et fin de la chaîne). |
| | `roller_coaster:track=waiting` / `brake_run` / `moving` | Lu | **Zones de freinage où un train peut attendre** (règle du propriétaire, 20/11, issue #33) : toutes freinent, et un train arrêté **repart à la vitesse qu'il avait en entrant** dans la zone. **rôle déduit de la position** (propriétaire, 20/11, Goudurix : le train s'arrête au `brake_run` PUIS va en zone `waiting` avant la gare) : le **frein final** est la dernière zone avant la gare, ou avant le premier tronçon `moving` (rail mobile du pont) s'il y en a un ; les zones précédentes sont des **freins de bloc** ; après lui, vers la gare, `moving` = rail mobile du pont transbordeur, autre = frein avant gare (noms automatiques, la spec `osm_brakes` peut les forcer). Le type (`waiting` ou `brake_run`) ne décide pas du rôle. « Frein final » n'est qu'un **nom** : celui de la dernière zone avant la gare (propriétaire, 20/11) ; la gare est une zone d'attente comme les autres et le tronçon entre la zone précédente et la gare un canton ordinaire (généralisation du garage à n'importe quelle zone : issue à part). Un `moving` avant le lift (tronçon mobile d'un aiguillage) n'est pas une zone de freinage. |
| | `block_brake` / `storage` / `transfer` | Lu (ancien) | Valeurs non documentées dans le wiki, encore lues comme zones de freinage ; ne pas en ajouter. |
| Gares | `roller_coaster:station=load` / `unload` sur les tronçons `station` | Lu (non officiel) | Seulement s'il y a **deux gares** (embarquement / débarquement) : `OSM.stations`. Le moteur n'exploite encore que la gare de départ (celle du tronçon de départ de la spec). |
| Figures | `roller_coaster:element=*` (`loop`, `corkscrew`, `butterfly`, `batwing`…) | Lu | Gardé dans les données (`OSM.elements`, abscisses du moteur) pour un futur réglage du tangage et du roulis dans l'éditeur ; la forme de la figure reste dans la spec (`inversions`). Tag en usage, non documenté dans le wiki. |
| Tunnel | `tunnel=yes` (ou `covered=yes` + `layer` négatif) | Lu | Voie cachée sous une couverture : eau si un plan d'eau la recouvre, sinon remblai. |
| Galerie au-dessus du sol | `tunnel=yes` + `layer` positif | Lu | Voie sous un toit de béton. |
| Emprise d'un tunnel | `man_made=tunnel` (polygone) | Lu | Situe seulement le tunnel : voie la plus basse dans le polygone couverte le long de son tracé (galerie, eau ou rocher détectés), jamais le polygone rempli (issue #42). |
| Niveau | `layer=*` | Lu | Ordre des croisements (quelle voie passe dessus). |
| Looping, vrilles | voie dessinée dans OSM | Lu en partie | Un looping dessiné dans OSM est lu tel quel ; ses hauteurs et le type de figure viennent de la spec. |
| Pont transbordeur | `railway=traverser`, ou rail du chariot `roller_coaster=track` + `moving` | Lu via la spec | Position du chariot et des voies (identifiants repris dans `tools/specs/<site>.json` ; Trace du Hourra : voies, écart et longueurs mesurés sur OSM depuis le 20/11). |
| Aiguillage | nœud `railway=switch` | Lu via la spec | Pointe de l'aiguillage. |
| Voie décorative | `roller_coaster=track` sans `roller_coaster:track`, non relié au circuit (ni à un autre circuit), près du circuit | Lu | Voie immobile dessinée comme celle de l'attraction, sans train ni zone (`OSM.deco`, propriétaire 20/11, Zeus `1353118255`) ; hauteur = celle de la gare (ESTIMÉ). |
| Voies de maintenance ou de garage | `roller_coaster=track` + `roller_coaster:track=maintenance` (hors circuit) | Lu via la spec | Voies du garage ; un `name` ou `service=*` aiderait à les reconnaître automatiquement. |
| Hauteur de la voie | `ele=*` (altitude en m) sur les **nœuds** de la voie | Lu | Chaque nœud à `ele` devient un point **relevé** du profil (hauteur = `ele` − altitude du sol : spec `ele_ground`, sinon `ele` des nœuds de la gare − hauteur de la gare) ; les points estimés de la spec à moins de 10 m sont retirés (`ele_keep`). Sans `ele`, le profil reste **ESTIMÉ**. Mettre `ele` aussi sur un nœud de la gare, ou donner `ele_ground`. Aucune attraction n'en a encore (20/11). |
| Hauteur | `height=*` sur un tronçon ou un pylône | Utile | Pas lu pour la voie (préférer `ele` sur les nœuds). |
| Nom des figures | `name=*` sur un tronçon (ex. « Dive loop ») | Utile | Étiquette et caméra de la figure sans estimation de position. |

## 2. Gare, quais et postes

| Objet | Tags | Statut | Ce que le jeu en fait |
|---|---|---|---|
| Bâtiment de gare | `building=*` qui recouvre la voie de gare | Lu | Toit de la gare. Il doit couvrir **tout** le quai, sinon le jeu l'agrandit (estimé). |
| Quais | déduits de `roller_coaster:track=station` | Lu | **Un quai de chaque côté du rail** de la gare (embarquement côté `loadSide`, débarquement en face ; profondeurs dans `SITE.plat`, ESTIMÉES). `railway=platform` n'est **pas** utilisé (décision du propriétaire, 20/11). Deux gares : `roller_coaster:station=load|unload` (§1). |
| Entrées et sorties | nœud `entrance=*` sur le bâtiment ou le chemin | Lu | Portes d'entrée de la file et de sortie. |
| Salle de contrôle | `building=*` (contour fermé) + `name=Salle de contrôle` (ou `control room`, casse libre) | Lu | **Position par défaut du pupitre** (`OSM.ctl` : rectangle du bâtiment, vitre tournée vers la voie la plus proche). L'éditeur (`GAME.controlRooms`) l'emporte ; sans salle OSM, repli `SITE.booth`. Zeus : `w148159968`. |

## 3. File d'attente et chemins

| Objet | Tags | Statut | Ce que le jeu en fait |
|---|---|---|---|
| Chemins de file | `highway=footway` (+ `footway=*` ou un `name`) | Lu | Tracé de la file. La spec dit quels tronçons forment la file. |
| Largeur | `width=*` en mètres | Lu | Largeur exacte du chemin dessiné. Sans ce tag : 1 m pour la file, 2 m pour un escalier de sortie. |
| Escaliers | `highway=steps` (+ `incline=up/down`, `width=*`) | Lu | Marches, garde-corps, visiteurs ralentis ; largeur du chemin qu'ils prolongent. **`incline` (avec le sens du way) place le palier en HAUT de l'escalier** ; sans lui, le haut est deviné (côté gare / porte, puis passerelle), sinon pas de palier. |
| Passerelle | `bridge=yes` + `layer=*` | Lu | Chemin dessiné par-dessus la voie, visiteurs dessus. |
| Chemin couvert, souterrain | `tunnel=yes`, `covered=yes`, `indoor=yes` ou `layer` négatif | Lu | Couloir caché, visible avec « Masquer la gare ». |
| Niveau souterrain | `layer=-1`, `-2`… (ou `level` négatif) sur le chemin ou l'escalier | Lu | Sous la gare : rien n'est montré (ni tracé, ni visiteurs) tant que la gare est affichée. L'escalier couvert dont le **haut** (`incline=up` dans le sens du way) débouche sur un chemin non couvert (niveau 0) garde sa **fin d'escalier** visible. Mettre `incline` sur l'escalier qui remonte au niveau 0. |
| Barrière | nœud `barrier=swing_gate` (ou `gate`, `lift_gate`…) (+ `swing_gate:hinge=left/right`, `ref=*`) | Importé, **ignoré par le moteur** (issue #34, 20/11) | Les barrières de file sont déduites des bifurcations et du sens de la file (§5) ; l'éditeur les corrige (`GAME.barriers`). Le nœud reste une documentation du terrain. |
| Garde-corps | `barrier=fence` ou `barrier=handrail` | Lu comme décor | Dessinés comme décor ; pas encore utilisés pour délimiter la file (le jeu pose ses propres barrières). |

## 4. Décor

| Objet | Tags | Statut | Ce que le jeu en fait |
|---|---|---|---|
| Zone piétonne | `highway=pedestrian` + `area=yes`, `area:highway=*`, `place=square` | Lu | Surface praticable partout ; elle prime sur les chemins qu'elle contient. |
| Eau | `natural=water`, `water=*`, `waterway=*` | Lu | Bassins, lacs, tunnel sous l'eau. |
| Forêt, pelouse | `landuse=forest`, `natural=wood`, `landuse=grass`, `leisure=park` | Lu | Textures du sol. |
| Arbres | nœud `natural=tree` | Lu | Arbres isolés. |
| Rochers | `natural=rock` / `stone` / `bare_rock` (way fermé ou relation multipolygone, trous compris) | Lu | Massif en relief (`bare_rock` compris depuis le 19/11 : `make_site.py` l'écrit `natural=rock`), tunnels de voie et de file dessous. Un rocher en relation est assemblé à partir de ses tronçons. |
| Bâtiments | `building=*` | Lu | Toits, avec `name` affiché. |
| Hauteur des bâtiments | `height=*`, sinon `building:levels=*` (× 3 m) | Lu | Longueur de l'ombre ; un bâtiment que la voie survole plus haut que lui est dessiné sous la voie (sans hauteur : 7 m estimé). |

## 5. Barrières de file : posées à la main dans l'éditeur

**Décision du propriétaire (20/11, issue #37, remplace les règles des issues #12, #17 et #34)** : le jeu ne pose **aucune** barrière ; ni OSM (`barrier=*` reste importé dans `OSM.barriers`, ignoré par le moteur), ni calcul. Le propriétaire les pose dans l'éditeur (`GAME.barriers`, clé `b<n>` : pivot, angle, longueur, ouverte ou fermée au début de la partie).

| Règle | Jeu |
|---|---|
| Commande | Chaque barrière s'ouvre et se ferme **seule** au clic sur la carte ; plus de barrières liées ni de bascule de fourche. |
| Blocage | Une barrière fermée arrête tout visiteur qui essaie de la franchir (file, arrivants, évacués). Barrière fermée au début de la file : plus personne n'entre. |
| Itinéraire | À chaque embranchement du réseau des chemins de file (déduit d'OSM, ci-dessous) : plus court trajet vers la gare par des barrières ouvertes ; aucun : plus court trajet, arrêt devant la première barrière fermée. |
| Évacuation | Les évacués s'arrêtent aussi devant une barrière fermée (le joueur l'ouvre) ; tant qu'un évacué est dans la file, personne n'entre ni n'avance vers la gare. |
| Anciennes données | Surcharges `entry`, `fork:…`, ajouts `add:…` : converties à la lecture en barrières indépendantes à la même position ; barrières calculées non surchargées : disparues. |

Ce que le propriétaire met dans OSM pour que la file soit bien déduite (lot 5) :

| Cas | Dans OSM |
|---|---|
| Chemins de la file | `highway=footway` + `oneway=yes`, **dessinés dans le sens de marche** (de l'entrée vers la gare), reliés par des **nœuds communs**. |
| Boucle / raccourci | Deux chemins à sens unique qui partent du **même nœud** et se rejoignent sur un **même nœud** : le plus long = boucle, le plus court = raccourci. Un raccourci qui n'est qu'un passage entre deux allées voisines (Zeus, raccourci ouest, 2,4 m) doit être **dessiné comme un chemin** pour être trouvé. |
| Fin de la file | Nœud `entrance=main` de la gare (le jeu prend le nœud de la file le plus proche). |
| Largeur | `width=*` sur chaque chemin de file. |
| Barrières `barrier=*` | Facultatives (documentation du terrain) ; **ignorées par le jeu**. |

## 6. Avant d'importer une nouvelle attraction

1. Tous les tronçons de voie sont dessinés et forment une boucle fermée ; chaque tronçon a son `roller_coaster:track`.
2. Gare, lift, zones de freinage, tunnels et galeries sont tagués.
3. Le bâtiment de gare couvre tout le quai ; les entrées et sorties sont des nœuds `entrance=*`.
4. La file est dessinée en entier, de l'entrée à la gare, avec ses escaliers, passerelles, couloirs couverts et largeurs (`width=*`).
5. Les chemins de file sont à sens unique (`oneway=yes`), dessinés dans le sens de marche, boucles et raccourcis reliés par des nœuds communs (§5) ; les barrières n'ont pas à être dessinées.
6. Le décor autour (eau, forêt, zones piétonnes, rochers) est à jour.
7. Si tu connais des hauteurs de voie, mets `ele=*` sur les nœuds de la voie (et sur un nœud de la gare) ; pour un rocher ou une passerelle, `height=*`.
8. Freins : `waiting`, `brake_run`, `moving` (rail mobile) ; la dernière zone avant la gare (ou avant le rail mobile) est le frein final ; salle de contrôle : bâtiment nommé « Salle de contrôle ». Pas de `railway=platform`.

Ce qui reste estimé après import est signalé dans `docs/<attraction>-notes.md` et dans `docs/plans/QUESTIONS.md`.

## 7. Traçabilité à l'import et catégories lues (lot 2)

Chaque objet importé garde son origine : **id OSM** préfixé (`w123` tronçon, `n456` nœud, `r789` relation) et **version** dans l'extrait (entier). C'est la base du réimport sélectif (lot 7) et des corrections locales (lot 4). Le moteur ignore ces champs (aucun conflit : vérifié par grep dans `engine/` et `editor/`).

| Donnée de `OSM.*` | Où est l'origine |
|---|---|
| `feats[]`, `stairs[]` (objets) | champs `id` et `v` ; un multipolygone assemblé (rocher, zone piétonne) porte l'id de la **relation** (`r…`), son anneau n'est pas rattaché à un tronçon |
| `doors[]`, `barriers[]`, `pois[]`, `widths[]` (tableaux positionnels) | **fin de tableau**, indices existants inchangés : `doors` `[x,z,type,nom, id, v]`, `barriers` `[x,z,ref,hinge,tx,tz,bout, id, v]`, `pois` `[[x,z],nom, id, v]`, `widths` `[w,pts, id, v]` |
| `others[]`, `trees[]`, `paths{}`, `polys{}`, voie `cps` (listes de points ou dictionnaires parcourus par le moteur) | **`OSM.src`** : `track` = tronçons du circuit dans l'ordre de marche `[[id, v]…]` ; `others` et `trees` = même ordre que `OSM.others` / `OSM.trees` ; `paths` = `{nom: [[id, v]…]}` (tronçons mis bout à bout) ; `polys` = `{nom: [[id, v]]}` |

Une version `null` (ou un objet sans `id`) veut dire « origine connue, version d'import inconnue » : donnée reprise d'un import plus ancien dont l'objet OSM a été modifié depuis. Un réimport complet les remplace.

### Catégories lues par `tools/make_site.py` (tirées du code)

| Catégorie | Objets OSM | Tags lus | Sortie |
|---|---|---|---|
| Voie et tronçons | tronçons listés dans la spec (`track_ways`) | `roller_coaster:track` = `station`, `lift_hill`, `brake_run`, `waiting`, `moving`, `block_brake`, `storage`, `transfer` (autre = parcours) ; `roller_coaster:station` (`load` / `unload`) ; `roller_coaster:element` ; `tunnel` (`yes`, `true`, `1`, `building_passage`, `culvert`), `covered=yes` avec `layer<0`, `layer>0` (galerie couverte `'roof'`) ; nœuds : `ele` (hauteur relevée) ; sans `ele`, le profil et les dévers sont ESTIMÉS (spec) | `cps`, `tunnels`, `inversions`, `stations`, `elements` (`{type, s0, s1, id}`), `ele` (`[s, h]` relevés), `src.track` |
| Salle de contrôle | ways fermés `building=*` | `name` ~ « Salle de contrôle » / « control room » | `ctl` (`[{x, z, angle, w, d, name, id, v}]`) |
| Autres voies voisines | tronçons `roller_coaster=*` hors circuit, hors `drop_ways`/`paths` | `roller_coaster` | `others`, `src.others` |
| Voies décoratives | tronçon `roller_coaster=track` sans rôle, composante sans boucle non reliée à un circuit, plus proche de ce circuit que des autres et à moins de 25 m (ESTIMÉ) | `roller_coaster`, `roller_coaster:track` | `deco` (`{p, id, v}`) |
| Gare, file, sortie, garage | tronçons et polygones nommés par la spec (`paths`, `polys`) | géométrie seule (+ `highway`, `layer`, `covered`, `bridge` si le chemin reste aussi dans le décor) | `paths`, `polys`, `src.paths`, `src.polys` |
| Bâtiments et abris | ways / multipolygones fermés | `building` (dont `roof`), `height`, `building:levels` (×3 m), `name` | `feats` (`k=building=…`, `bh`) |
| Chemins | `highway=*` non fermés | `highway`, `name`, `layer`, `level` (souterrain `lv`), `tunnel`, `covered`, `indoor` (couvert `cv`), `bridge` + `layer` (passerelle `br`), `width` | `feats` (`cv`, `lv`, `br`, `w`, `in` : fondu dans une zone piétonne), `widths` |
| Zones piétonnes | `highway=pedestrian`+`area=yes`, `area:highway=*`, `place=square`, multipolygones `highway=pedestrian` (anneaux `inner` en trous) | idem | `feats` (`k=highway=pedestrian`, fermé, `h`) |
| Escaliers | `highway=steps` | `incline` (up / down / pente), `width` (sinon chemin raccordé), `layer`, `level`, `covered`, `tunnel`, `indoor` | `stairs` |
| Entrées / sorties | nœuds | `entrance=*`, `name` | `doors` |
| Barrières de file | nœuds posés sur un chemin | `barrier` = `swing_gate`, `gate`, `lift_gate` ; `ref`, `swing_gate:hinge` ; direction du chemin au nœud | `barriers` (plus lu par le moteur depuis l'issue #34) |
| Eau | ways / multipolygones | `natural=water`, `water`, `waterway` | `feats` |
| Végétation | ways / multipolygones ; nœuds | `landuse` (forêt, herbe…), `natural` (bois…), `leisure` ; nœuds `natural=tree` | `feats`, `trees`, `src.trees` |
| Rochers | ways / multipolygones (anneaux assemblés) | `natural=rock`, `natural=stone` ; `natural=bare_rock` EST un rocher (décision du propriétaire 19/11 ; `make_site.py` l'écrit `natural=rock`) | `feats` |
| Autres éléments de décor | ways / multipolygones | première clé présente parmi `building highway natural landuse leisure water waterway barrier amenity tourism man_made railway` (`landuse=commercial` ignoré) | `feats` |
| Lieux nommés | nœuds | `name` | `pois` |
| Attributs d'apparence (issue #46, D12) | chemins de file (spec `queue_paths`) ; polygone `area:highway=footway` + `covered=yes` dans la gare ; `barrier=fence\|handrail\|wall` à moins de 2 m (ESTIMÉ) d'une allée de file ; bâtiment de la gare (`polys.station`) ; tronçons de voie | `surface`, `colour` ; `material` (`wall` : pierre) ; `roof:colour` ; `colour` | `attrs` (`[{role: queue\|plat\|rail\|roof\|track, id, v, l, t, h}]`, seulement si un tag est présent ; valeur par défaut des réglages de l'éditeur, renvoyée vers OSM à la demande) |

Hors de ces listes, un tag n'est pas lu. Toute évolution de `make_site.py` qui lit un nouveau tag met à jour ce tableau.

### Réimport et dérive

`make_site.py` régénère tout le fichier `lieux/parc/asterix/<el>.data.js` ; il n'y a pas encore de réimport sélectif (lot 7). Avant d'accepter un réimport : comparer à l'ancien fichier (ids et versions), signaler au propriétaire tout objet dont la géométrie ou le tag a changé (exemple 19/11/2026 : rocher d'Hourra retagué `natural=bare_rock`, voie de Goudurix retouchée de 0,5 m au plus le 18/11).
