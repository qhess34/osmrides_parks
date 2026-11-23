# Ce qu'OSM peut porter, et ce qui reste au jeu (issue #30)

Décision du propriétaire : **OSM reste la référence**. Avant les lots 4 (corrections locales d'objets OSM) et 5 (files dans l'éditeur), ce document recense tout ce qui est aujourd'hui écrit à la main ou estimé **hors d'OSM** (`lieux/parc/asterix/<el>.js`, `tools/specs/<el>.json`, `lieux/parc/asterix/<el>.game.js`) et dit où cela devrait vivre.

Analyse seule, aucun changement de code. Relevé du 19/11/2026.

**Ce qui est vérifié et ce qui est supposé**

- **Vérifié sur OSM** (extrait complet du parc téléchargé le 19/11/2026 sur `api.openstreetmap.org`, versions en cours) : les tags des objets cités avec un id (`w…` = chemin ou tronçon, `n…` = nœud, `r…` = relation).
- **Vérifié par recherche web** (le wiki OSM et taginfo sont bloqués dans cette session ; seuls les extraits de recherche ont été lus) : documentation de `roller_coaster=*`, `roller_coaster:track=*` (lift_hill, brake_run, station, launch_straight, moving, waiting ; `maintenance` seulement dans la traduction chinoise), `roller_coaster=station`, `roller_coaster=support`, `roller_coaster:type=*` (wooden_coaster, inverted_coaster, hybrid_coaster, alpine_coaster… liste « non exhaustive »).
- **Supposé, d'après la pratique OSM générale** (pages wiki non relues ici) : `height`, `width`, `colour`, `roof:colour`, `railway=switch`, `railway=buffer_stop`, `railway=traverser`, `railway=platform`, `indoor=*`, `incline`.
- **Supposé puis testé (20/11, issue #34)** : la file (tronçons, boucles, raccourcis) se déduit des chemins de file OSM et de leur sens pour H, O, G ; pas pour Z (raccourci ouest absent d'OSM).

## Mise à jour du 20/11/2026 (réponses du propriétaire, issue #33)

Appliqué dans `tools/make_site.py` et le moteur ; les 4 attractions sont réimportées depuis l'extrait du 20/11.

| Point | Décision | Effet |
|---|---|---|
| Freins | `waiting`, `brake_run` et `moving` = zones de freinage où un train peut attendre ; frein final = dernière zone avant la gare (ou avant le rail mobile `moving`), précédentes = freins de bloc (propriétaire 20/11 : `brake_run` n'est pas forcément le frein final) ; un train arrêté repart à sa vitesse d'entrée | importeur (rôle par position, `osm_brakes` retiré des 4 specs) ; moteur : relance d'un frein de bloc à la vitesse d'entrée (`blkRelaunch`, `engine/sim.js`). Ligne « Freins de bloc, frein final » ci-dessous : **réglée**. |
| Quais | déduits de `roller_coaster:track=station`, un de chaque côté ; deux gares : `roller_coaster:station=load|unload` (non officiel, cat. 3 assumée par le propriétaire) ; plus de `railway=platform` | ligne « Quais » : **réglée** (profondeurs encore ESTIMÉES dans `SITE.plat`). Deux gares lues (`OSM.stations`) mais pas encore exploitées par le moteur (aucune attraction n'en a). |
| Salle de contrôle | bâtiment nommé « Salle de contrôle » / « control room » = position par défaut, l'éditeur l'emporte | `OSM.ctl`, `engine/render.js` `defRoom()`. Zeus `w148159968` (nom corrigé le 20/11) ; H, O, G : aucune dans OSM. |
| Hauteurs | `ele` sur les nœuds de la voie, sinon profil ESTIMÉ | lu (`OSM.ele`) ; **aucun nœud de voie n'a `ele`** le 20/11 : les 4 profils restent ESTIMÉS. |
| `roller_coaster:element` | gardé et lu, pour un réglage du tangage / roulis dans l'éditeur | `OSM.elements` (Goudurix : butterfly, batwing, loop, corkscrew). |
| Zeus | réimport complet | fin du mode `base` : voie, gare, garage, file relus dans OSM (tracé identique à 0,3 m près ; profil ESTIMÉ recopié de l'ancien import). |
| Garage H | ajouté dans OSM | 6 voies, rail du chariot : distances, écart et longueurs lus dans OSM (`lieux/parc/asterix/hourra.js`). |

**Corrections OSM encore à faire (relevées à l'import du 20/11)**

- Trace du Hourra : voies `1582324002…1582324007` corrigées par le propriétaire (20/11) ; 5 portent `entretien`, `1582324007` `maintenance` : sans effet sur le jeu (voies lues par identifiant), `maintenance` partout serait plus homogène.
- Goudurix : `541092986` corrigé dans OSM (plus de `moving`, réimport du 20/11). B1 `1580112200` (`brake_run`) puis frein final `1580112203` (`waiting`) : réglé par la règle par position.
- Goudurix : lift `541092982` `layer=*` toujours invalide.
- Zeus : tronçon isolé `1353118255` = tracé décoratif (propriétaire, 20/11) : dessiné comme voie immobile (`OSM.deco`).

## Les quatre catégories

1. **Déjà dans OSM**, ou devrait l'être : une correction à faire dans OSM.
2. **Exprimable avec un tag OSM existant et documenté.**
3. **Seulement par une convention non standard** : risque de se faire corriger ou supprimer par la communauté.
4. **Hors du champ d'OSM** : donnée de jeu, sans vérité terrain vérifiable. Reste dans `GAME` (éditeur) ou `SITE`.

## Tableau

Abréviations : Z = Tonnerre 2 Zeus, H = Trace du Hourra, O = OzIris, G = Goudurix. Wiki = `https://wiki.openstreetmap.org/wiki/…`.

### Voie et garage

| Élément | Où aujourd'hui | Cat. | Tag OSM proposé ou raison | Effet lot 4 / 5 |
|---|---|---|---|---|
| Rôle des tronçons (gare, lift) | OSM `roller_coaster:track` | 1 | Déjà lu. **Erreur à corriger** : lift G `w541092982` a `layer=*`, valeur invalide (il faut un entier). | aucun |
| Freins de bloc, frein final | OSM `waiting` + liste `osm_brakes` de la spec | 1 + 2 | Tous les freins des 4 attractions sont tagués `waiting` (vérifié). Le wiki réserve `waiting` à une section **sans** vrai freinage et prévoit [`roller_coaster:track=brake_run`](https://wiki.openstreetmap.org/wiki/Key:roller_coaster:track) pour les freins. Proposé : `brake_run` sur les freins de bloc et le frein final, `waiting` seulement pour l'attente avant gare. La spec garde le nom des zones (B1, Fin) tant qu'OSM ne distingue pas bloc / final. | lot 7 : relire les tags |
| Valeurs `block_brake`, `storage`, `transfer` lues par `make_site.py` | importeur | 3 | Absentes du wiki (vérifié par recherche). Ne pas les ajouter dans OSM ; garder la liste `osm_brakes` de la spec. | aucun |
| Profil en hauteur, dévers | spec `profile`, `keep`, `flat` (ESTIMÉS) | 4 (2 pour une hauteur mesurée) | Aucune mesure terrain : ne pas mettre d'estimation dans OSM. Seule une hauteur connue va dans OSM : [`height=*`](https://wiki.openstreetmap.org/wiki/Key:height) sur l'attraction (hauteur maximale, source publique) ou sur un support. | lot 8 (éditeur de profil) |
| Inversions (type, position) | spec `inversions` | 1 + 3 + 4 | G porte déjà `roller_coaster:element=loop / corkscrew / butterfly / batwing` (vérifié, 9 tronçons) ; ce tag **n'apparaît pas** dans la documentation trouvée (cat. 3, en usage local). La géométrie de la figure (rayon, hauteur, boucle insérée) reste dans la spec (cat. 4). Pour Z / H / O, un `name=*` sur le tronçon de la figure suffit à la nommer. | aucun |
| Tunnel 1 de Z (bas de la première descente) | polygone `man_made=tunnel` `w1353118256` + import ancien (mode `base`) | 1 | Le tronçon de voie dessous n'a **pas** `tunnel=yes` (vérifié). Correction OSM : couper la voie au droit du tunnel, [`tunnel=yes`](https://wiki.openstreetmap.org/wiki/Key:tunnel) + `layer=-1`. | aucun |
| Tunnel 2 de Z (galerie à effets, s 850–900) | `SITE.tunnels:[{s:[850,900]}]` (ESTIMÉ) | 1 | Absent d'OSM. Couper le tronçon et ajouter `covered=yes` (galerie au niveau du sol) ou `tunnel=yes` + `layer`. Bornes à relever sur une image aérienne. | supprime une estimation |
| Tunnels sous l'eau / galerie (O) | `SITE.tunnels:[{under:…}]` | 1 | Déjà déduit d'OSM (eau au-dessus, `layer>0`). Le champ SITE ne fait que confirmer. | aucun |
| `tunnels_extra`, `tunnels_ignore` | spec | — | Plus utilisés par aucune attraction (vérifié). | aucun |
| Sous-type (`kind` : bois, bob, inversé, acier) | `SITE.kind` | 2 | [`roller_coaster:type=*`](https://wiki.openstreetmap.org/wiki/Key:roller_coaster:type) sur le nœud `attraction=roller_coaster` : Z `wooden_coaster` (`n1088029243`), O `inverted_coaster` (`n1732704742`). Pour H (bob) et G (acier assis), aucune valeur documentée trouvée : ne rien inventer (cat. 4). | lot 9 : préremplir |
| Garage Z : aiguillage | `SITE.yard` (`device:'switch'`, `a`, `b`, `slide`) | 1 + 4 | Voie de maintenance `w938337765` et deux tronçons mobiles `w1353118266` / `w1353118267` sont dans OSM (vérifié). Manque : nœud [`railway=switch`](https://wiki.openstreetmap.org/wiki/Tag:railway=switch) à la pointe, [`railway=buffer_stop`](https://wiki.openstreetmap.org/wiki/Tag:railway=buffer_stop) au bout. Course, vitesse et durée de manœuvre : cat. 4. Z est importé en mode `base` : la voie n'est pas relue. | lot 7 |
| Garage H : 6 voies, pont droit, rail escamotable | `SITE.yard` (voies à 8 / 11,2 / … m, ESTIMÉES) | 1 (si visibles) / 4 | **Aucune voie de garage ni pont dans OSM** (vérifié ; seul le bâtiment `w148160581`). Si les voies sont visibles sur l'image aérienne ou connues : `roller_coaster=track` + `roller_coaster:track=maintenance` (valeur en usage, 5 tronçons dans le parc, documentée seulement en chinois : cat. 2 faible) et `railway=traverser` pour le chariot. Elles sont dans un bâtiment : sans source, laisser au jeu. Rail escamotable, capacités : cat. 4. | supprime l'estimation la plus lourde du jeu |
| Garage O : pont et 3 voies | OSM `railway=traverser` `w1330192631`, `maintenance` `w1330192628…30` | 1 | Déjà dans OSM (vérifié). Butoirs absents : `railway=buffer_stop` en bout de voie. Rail unique, sens d'entrée, vitesses : cat. 4. | aucun |
| Garage G : aiguillage rotatif en S | OSM `railway=switch` `n11327867339`, `railway=buffer_stop` `n11327867335`, `maintenance` `w1221386549`, S `w1580112201` (`moving`) | 1 + 4 | Déjà dans OSM (vérifié). Rotation autour du tube, face droite / face en S, durée : cat. 4 (pas de tag pour la mécanique d'un aiguillage de coaster ; `railway:switch=*` vise le chemin de fer). | aucun |
| Frein avant gare (`preBrake`) | OSM `waiting` H `w1580086183`, O `w1330192627` + nom dans SITE | 1 + 4 | Position déjà dans OSM. Le nom affiché au pupitre : jeu. | aucun |
| Moteurs par zone, AUTO / MANU, `trim` (G : B1 ralentit à 8 m/s) | `SITE.zones`, défauts du moteur | 4 | Exploitation, pas de vérité terrain observable. | lot 3 |
| `holdBack`, `stopBack`, `dropAfter`, physique | `SITE` | 4 | Réglages de simulation. | lot 3 |
| Couleurs de voie et supports (`track`, `trough`) | `SITE` (photos du propriétaire) | 2 | [`colour=*`](https://wiki.openstreetmap.org/wiki/Key:colour) sur les tronçons (couleur de la voie) ; supports dessinés comme [`roller_coaster=support`](https://wiki.openstreetmap.org/wiki/Tag:roller_coaster=support) avec leur `colour`. Valeur vraie seulement (pas une teinte « assourdie » du jeu). Les teintes du rendu restent au jeu. | lot 3 |
| Trains : nombre, wagons, places, couleurs, usure | `SITE.car`, `SITE.trains` | 4 | Les trains ne sont pas des objets cartographiés. Caractéristiques publiques : Wikidata / RCDB, pas OSM. | lot 3 |
| Passerelles de service du lift (`catwalks`) | `SITE.catwalks` (côté donné par le propriétaire, largeur ESTIMÉE) | 2 (faible) / 4 | Possible : `highway=steps` / `highway=footway` + `access=private` le long du lift. Peu visible d'avion, rarement cartographié ; le dessin automatique suffit. | aucun |

### Gare, quais, poste

| Élément | Où aujourd'hui | Cat. | Tag OSM proposé ou raison | Effet lot 4 / 5 |
|---|---|---|---|---|
| Bâtiment de gare (`stationPoly`) | OSM (`polys.station`) | 1 | Déjà lu. Tag douteux : H `w148160006` et O `w420016980` sont `building=retail` (cadastre). Proposé : ajouter [`roller_coaster=station`](https://wiki.openstreetmap.org/wiki/Tag:roller_coaster=station) sur le bâtiment (O a un nœud `roller_coaster=station` `n12307360383` à côté, vérifié). | aucun |
| Gare agrandie au quai (`STATION_GROW`), G : bâtiment de 6,8 m | moteur | 1 | Si le toit réel couvre les quais, corriger le contour du bâtiment dans OSM ; sinon le quai est à découvert et c'est juste. | aucun |
| Hauteur des bâtiments (7 m ESTIMÉ par défaut) | moteur | 2 | [`height=*`](https://wiki.openstreetmap.org/wiki/Key:height) ou `building:levels`, déjà lus. Gares sans hauteur (vérifié). | aucun |
| Couleur du toit (`stationRoofCol`) | `SITE` | 2 | [`roof:colour=*`](https://wiki.openstreetmap.org/wiki/Key:roof:colour) (Simple 3D Buildings), à brancher dans l'importeur. | lot 3 |
| Quais : profondeur embarquement / débarquement (`plat.load`, `exit`, `back`, `front`) | `SITE.plat` (ESTIMÉS) | 2 (à discuter) | Polygone du quai : [`railway=platform`](https://wiki.openstreetmap.org/wiki/Tag:railway=platform) (prévu pour le train, usage étendu au coaster discutable) ou zone intérieure [`indoor=area`](https://wiki.openstreetmap.org/wiki/Key:indoor) + `level`. Visible seulement d'après plans ou photos du sol. | lot 4 : le quai pourrait venir d'OSM |
| Portillons (un par wagon ou par rangée) | `SITE.plat.gatesPer` | 4 | Équipement du quai, lié au train ; pas d'usage OSM. | lot 3 |
| Entrée et sortie du quai, `board.via` | OSM `entrance=main` / `exit` + `board.via` (copie du point) | 1 | Déjà dans OSM pour les 4 (vérifié) ; `board.via` peut être lu sur le nœud `entrance=main`. Seule Z garde des points écrits à la main. | lot 5 : à déduire |
| Couloir d'attente (`board.walk`), zone d'attente (`GAME.boardAreas`), profondeur des travées (`GAME.board.depth`) | `SITE`, `GAME` | 4 | Organisation des visiteurs sur le quai, non cartographiable. | restent dans l'éditeur |
| Poste de conduite / salle de contrôle | `GAME.controlRooms`, repli `SITE.booth` | 1 (Z) / 3 / 4 | **Z : bâtiment OSM `w148159968` « Salle de contôle » (faute de frappe à corriger : « contrôle »), `height=5`**, vérifié, à 1,5 m de la salle de l'éditeur. Pour H, O, G : rien trouvé par nom. Un local dans la gare n'a pas de tag standard (`indoor=room` + `name` est générique, cat. 3). Pupitre (taille, orientation) : cat. 4. Décision du 17/11 : la salle relève du jeu. | reste dans l'éditeur |
| Poste de l'aiguillage de G (plate-forme, escalier) | `SITE.draw` (ESTIMÉ, d'après photo) | 2 / 4 | Si visible : `man_made=*` n'a pas de valeur adaptée ; l'escalier en `highway=steps` + `access=private`. Dessin : jeu. | aucun |
| Statue de Zeus | `SITE.draw.landmarks` | 1 + 4 | Position : un nœud `tourism=artwork` + `artwork_type=statue` (à vérifier sur place s'il existe). Dessin : jeu. | aucun |

### File, sortie, abords

| Élément | Où aujourd'hui | Cat. | Tag OSM proposé ou raison | Effet lot 4 / 5 |
|---|---|---|---|---|
| Tracé des chemins de file, escaliers, passerelles, couloirs couverts | OSM | 1 | Déjà lu (vérifié pour les 4). | aucun |
| Quels chemins forment la file (`paths` de la spec) | spec + `SITE.queue.ways` | 1 (déductible) / 3 | Pas de tag standard « file d'attente » : la spec nomme toujours les chemins (liste d'ids, sans coordonnées). L'ordre des tronçons, les boucles et les raccourcis en sont **déduits** (issue #34). Trouver ces chemins sans la spec (depuis la barrière d'entrée jusqu'à `entrance=main`) : pas encore fait (importeur). | lot 5 : ids encore listés dans la spec |
| Découpage en tronçons, boucles, raccourcis (`queue.parts`, fourches, indices `at(x,z)`) | **déduit** (`SITE.queue.ways`, `engine/queue.js` `deduceParts`) pour H, O, G ; `SITE.queue.parts` à la main pour Z (repli gardé partout) | 1 (déductible) | Graphe des nœuds communs, sens `oneway` = sens de dessin : file de base = plus court trajet du début du premier chemin au nœud le plus proche de `entrance=main` ; tout autre chemin qui la quitte et la rejoint plus loin = fourche (plus long = boucle). Vérifié le 20/11 : H, O identiques au découpage écrit à la main ; G identique sauf la fin, prolongée de 1,6 m jusqu'au nœud `entrance=main`. Z : le raccourci ouest (2,4 m entre deux allées) n'est pas un chemin OSM. | **fait (issue #34)** ; Z : dessiner le raccourci ouest dans OSM |
| Largeur des allées de file | OSM `width` (H seul) sinon ESTIMÉE | 2 | [`width=*`](https://wiki.openstreetmap.org/wiki/Key:width), déjà lu. **Manque sur les files de Z, O, G** (vérifié). | supprime des estimations |
| Barrières : position | **déduite par le jeu** (issue #34) | 4 | Décision du propriétaire (20/11) : plus de barrières côté OSM. Entrée = début de la file ; fourche = une barrière par pointe. Nœuds `barrier=*` importés mais ignorés. | **fait** |
| Barrières : pivot, angles, longueurs (`GAME.barriers`) | éditeur | 4 | Corriger, ajouter, supprimer ; clés stables inchangées (aucune clé orpheline dans les 4 `game.js` au 20/11, ligne `queue=… gameOrphans=` de `tools/check.js`). | reste dans l'éditeur |
| Barrière ajoutée Z `add:raccourci est:1` | `GAME.barriers` | 4 | Choix de jeu, gardé dans l'éditeur (plus de nœud OSM à ajouter). | — |
| Côté du poteau | jeu (à droite du sens de la file) ; éditeur | 4 | `swing_gate:hinge` n'est plus lu (issue #34). | — |
| Bouche de file (`mouth`, `mouthMax`), barrière déplacée au bout (`gateAtMouth`, Z) | `SITE.queue` | 4 | Ajustement du jeu, contraire à la position OSM (Z : nœud « Entrée T2Z » sous la statue). Si la barrière réelle est devant la statue : **déplacer le nœud dans OSM**, puis retirer `gateAtMouth`. | lot 5 : réglage de jeu |
| `entry0`, `link` (point d'arrivée, raccord vers la file) | `SITE.queue` (coordonnées écrites) | 1 | Raccord = chemin OSM entre la zone piétonne et la barrière d'entrée ; à dessiner dans OSM s'il manque (G : `w1580408092`, cité dans `lieux/parc/asterix/goudurix.js`). | lot 5 |
| Accès promeneurs (`approach`, Z `PROM_W` / `PROM_N` en coordonnées) | `SITE` | 1 | Ce sont des allées réelles du parc : leurs chemins OSM peuvent être nommés dans la spec au lieu de coordonnées. Largeur de foule (`w`) : cat. 4. | lot 5 |
| Sortie (`exit.path`) | OSM (chemins de sortie) | 1 | Déjà OSM pour H, O, G ; Z : chemin écrit à la main par la boutique (coordonnées). À dessiner dans OSM si absent. | lot 5 |
| Fins de sortie (`exit.tails`), raccords ESTIMÉS de G vers l'allée est et le pont de bois | `SITE` | 1 | S'il existe un vrai chemin, le dessiner dans OSM ; sinon le raccord est un artifice de jeu (cat. 4). | lot 5 |
| `noStroll`, `paths` de décor | `SITE` | 4 | Règles de déplacement des visiteurs. | lot 5 |

### Divers

| Élément | Où aujourd'hui | Cat. | Raison | Effet |
|---|---|---|---|---|
| Hauteur des rochers (H : voie haute + 2,2 m) | moteur (ESTIMÉ) | 2 | `height=*` sur `natural=bare_rock` (H `r22083041`). | aucun |
| Toits effaçables (`fade`), caméras, étiquettes, vue, chantiers (`jobsites`), textes, aide du garage | `SITE` | 4 | Interface du jeu. Étiquettes de figures : peuvent venir du `name` OSM du tronçon. | lot 3 |
| `goal`, `lap`, `maxRun`, économie, météo | `SITE`, moteur | 4 | Jeu. | lot 3 |

## Conclusions

### a) Ce que le propriétaire peut corriger ou ajouter lui-même dans OSM

Seulement ce qui est vrai sur le terrain ; ne jamais y mettre une estimation du jeu.

**Toutes les attractions**
- Freins de bloc et frein final : `roller_coaster:track=brake_run` au lieu de `waiting` (garder `waiting` pour l'attente avant gare). À faire en même temps qu'une adaptation de l'importeur (voir c).
- Hauteur des bâtiments de gare et du garage (`height=*` ou `building:levels`) si connue.
- `width=*` sur chaque chemin de file (H l'a déjà).
- `height=*` (hauteur maximale publiée) et `roller_coaster:type` sur le nœud de l'attraction quand une valeur documentée existe.

**Tonnerre 2 Zeus**
- Bâtiment `w148159968` : corriger le nom « Salle de contôle » en « Salle de contrôle ».
- Tunnel 1 : couper la voie sous le polygone `w1353118256` et ajouter `tunnel=yes` + `layer=-1` sur ce tronçon.
- Tunnel 2 (galerie à effets) : couper la voie entre les repères 18 et 19 du plan et ajouter `covered=yes` (ou `tunnel=yes` + `layer`).
- Aiguillage du garage : nœud `railway=switch` à la pointe ; `railway=buffer_stop` au bout de `w938337765`.
- Si la barrière d'entrée réelle est devant la statue : déplacer le nœud « Entrée T2Z » `n14385763506`.
- Sortie par la boutique : dessiner le chemin s'il manque.
- Nœud `n1088029243` : `roller_coaster:type=wooden_coaster`.

**La Trace du Hourra**
- Garage : les 6 voies et le pont transbordeur sont absents d'OSM. À ajouter seulement s'ils sont connus (`roller_coaster:track=maintenance`, `railway=traverser`).
- Bâtiment de gare `w148160006` (`building=retail`) : ajouter `roller_coaster=station`.
- Rocher `r22083041` : `height=*` si connu.

**OzIris**
- Butoirs `railway=buffer_stop` au bout des voies `w1330192628…30`.
- Bâtiment de gare `w420016980` : `roller_coaster=station` (un nœud du même tag existe déjà à côté, `n12307360383`).
- Nœud `n1732704742` : `roller_coaster:type=inverted_coaster`.
- `width=*` sur la file `w1580173577`, `w1073325805`.

**Goudurix**
- Lift `w541092982` : `layer=*` est invalide, mettre un nombre.
- Contour du bâtiment de gare `w148159470` si le toit couvre aussi les quais.
- Raccords de sortie vers l'allée est et le pont de bois : à dessiner s'ils existent.
- `width=*` sur la file `w1580112206`, `w1580112207`.

### b) Ce qui reste à éditer hors d'OSM : lots 4 et 5 plus petits

- **Lot 4 (corrections locales d'OSM)** : la plupart des écarts actuels relèvent d'une **correction directe dans OSM** par le propriétaire (liste ci-dessus), pas d'un fichier `osmfix.json`. Il reste peu de vraies corrections locales : une correction en attente de validation OSM, et les **écarts volontaires** du jeu (barrière d'entrée de Zeus au bout de la bouche, raccords de chemins inventés). Proposition : faire du lot 4 un **petit lot** (« écart local en attente d'OSM », signalé et listé), sans éditeur complet d'objets OSM.
- **Lot 5 (files)** : **fait en partie (issue #34, 20/11)** : tronçons, boucles et raccourcis déduits des chemins de file OSM et de leur sens (H, O, G) ; barrières déduites (4 attractions). Restent écrits à la main : la liste des ids des chemins de file (spec), le raccord d'entrée (`entry0`, `link`), la bouche (`mouth`, `gateAtMouth`), la file de Z (`queue.parts`). L'éditeur pourra **montrer** la file déduite (pas encore fait).
- **Restent dans l'éditeur ou `SITE`, définitivement** : barrières (géométrie), salle de contrôle (pupitre), zone d'attente et profondeur des travées, trains et wagons, couleurs du rendu, profil en hauteur et géométrie des figures, mécanique et vitesses du garage, zones (moteurs, AUTO / MANU, ralentissement), physique, caméras, étiquettes, économie.

### c) Points à discuter avec le propriétaire

1. **Freins `waiting` → `brake_run`** : d'accord pour corriger OSM ? Il faudra en même temps adapter l'importeur pour qu'il distingue toujours le frein de bloc du frein final.
2. **Garage du Hourra** : les 6 voies sont-elles visibles ou connues (photo, plan) ? Sinon elles restent estimées dans le jeu.
3. **Barrières** : réglé le 20/11 (issue #34) : plus dans OSM, déduites par le jeu, corrigées dans l'éditeur (la barrière ajoutée de Zeus reste dans `GAME.barriers`).
4. **Barrière d'entrée de Zeus** : déduite au début du chemin de file OSM (sous la statue), puis déplacée devant par `gateAtMouth` (ajustement du jeu) ; l'éditeur la corrige.
5. **Quais** : faut-il les dessiner dans OSM (`railway=platform`, usage discutable pour un coaster), ou les laisser au jeu ?
6. **Salles de contrôle** : Zeus en a une dans OSM. Le jeu doit-il la lire comme position de départ (comme pour les barrières) ?
7. **`roller_coaster:element`** sur Goudurix : tag en usage mais non documenté. On le garde, ou on se limite à `name=*` ?
8. **Lot 4 réduit** comme proposé en b) : d'accord avant de commencer ?
9. **Zeus importé en mode `base`** (voie, file et gare figées au 14/11) : faut-il le réimporter entièrement pour profiter des corrections de voie (tunnels, aiguillage) ?
