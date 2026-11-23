# Goudurix — notes

Montagnes russes en acier Vekoma (modèle MK-1200, rails tubulaires), Parc Astérix, ouvertes en 1989. Configuration : `lieux/parc/asterix/goudurix.js` ; spec : `tools/specs/goudurix.json` ; données : `lieux/parc/asterix/goudurix.data.js` (généré). Photo aérienne du propriétaire : `docs/sources/goudurix-vue-aerienne.jpg` (voie tubulaire jaune, supports rouges, tracé au-dessus d'un plan d'eau).

## Caractéristiques (sources)

| Donnée | Valeur | Source |
|---|---|---|
| Longueur | ≈ 950 m (3 117 ft) | Wikipédia, RCDB, coaster.cloud, thrillzing |
| Hauteur / chute | 36 m / 32,9 m | Wikipédia |
| Vitesse | 90 km/h (56 mph) | Wikipédia, RCDB |
| Inversions | 7 : looping vertical (1), batwing (2), papillon / butterfly (2), double vrille (2) | Wikipédia, RCDB |
| Durée | 1 min 20 | Wikipédia |
| Trains | **2** trains **rouges** de 7 wagons, 28 places (4 par wagon, 2 rangées de 2) | RCDB, Wikipédia ; rouges et 2 trains : propriétaire (2026-11-15) |
| Angle de chute / force G | 64° / 4,5 g | affiche du plan des figures (propriétaire) |
| Coût | 35 000 000 F | affiche |
| Rénovations | nouveaux trains (caisses et retenues, châssis conservés) pour la saison 2025 ; re-tracking complet | recherche web |

Contradictions : une base (GPTKB) donne 1 150 m de long, écartée (toutes les autres : 950 m). La vitesse de 75 km/h parfois citée n'apparaît dans aucun résultat (90 km/h partout). Le tracé OSM fait 797 m **au sol** ; avec le profil estimé on obtient 809 m en 3D, contre 950 m annoncés : OSM simplifie les inversions (le tracé 2D d'un looping est quasi une ligne), l'écart est normal.
Accès : rcdb.com, wikipedia.org et Coasterpedia n'ont pas été lus directement (WebFetch non disponible dans cette session) ; les chiffres viennent des extraits de recherche web (RCDB 753 cité par Wikipédia). À revérifier sur rcdb.com/753.htm.

Sources : https://en.wikipedia.org/wiki/Goudurix · https://rcdb.com/753.htm · https://coaster.cloud/en/attractions/b9bff96f-goudurix · https://thrillzing.com/roller-coasters/goudurix-parc-asterix/ · https://www.pa-community.com/parques/parc-asterix/atracciones/goudurix

## Repères OSM (extrait du parc, origine [49,13204 ; 2,57090] = centre de la gare)

- **Sens de marche (corrigé par le propriétaire, 2026-11-15 : « le lift est la montée après la gare »)** : la gare est parcourue vers le sud, dans le sens de son tracé OSM ; le lift est la ligne droite nord-sud qui suit (OSM `brake_run` 937067646 + début de 541092982, s ≈ 44 → 136 m) ; le retour se fait par la diagonale ouest (OSM `lift_hill` 541092979, ici zone de freinage) et la courbe nord (OSM `launch_straight` 541092977) : **les étiquettes OSM `lift_hill` / `launch_straight` / `brake_run` sont donc inversées par rapport au sens de marche**. Première version (sens inverse) abandonnée.
- Circuit (797 m au sol), dans le sens de marche : gare 937067647 (19 m, vers le sud) → 937067646 → 541092982 (lift) → 541092983 → 541092984 → 1181620309 → 1181620310 → 541092985 → 1181620311 → 541092986 → 1181620312 → 541092987 → 541092988 → 541092989 → 541092991 → 541092990 → 541092992 → 541092993 → 541092979 (diagonale ouest, frein final) → 541092977 (courbe nord) ; ancien ordre, à lire à l'envers : 541092993 → 541092992 → 541092990 → 541092991 → 541092989 → 541092988 → 541092987 → 1181620312 → 541092986 → 1181620311 → 541092985 → 1181620310 → 1181620309 → 541092984 → 541092983 → 541092982 → frein final 937067646 (42 m, entre dans la gare par le sud). Tous `layer` 1 ou 2.
- Gare : bâtiment 148159470 (6,8 m × 19 m, ne couvre que la voie).
- Garage : voie de maintenance 1221386549 (`roller_coaster:track=maintenance`, 45 m, butoir au sud en (−16,7 ; 39,8), nœud `railway=switch` en (−15,2 ; −4,5)) : elle se raccorde au **retour**, à ≈ 30 m avant la gare (fin de la diagonale ouest, début de la courbe nord).
- File : OSM ne cartographie aucune file. On prend le chemin 1102233771 (« Gouduriiiix Promenade », 80 m, de l'entrée sud (23,8 ; 87,7) au côté est de la gare) ; arrivée par les chemins 132709980 / 132709988 depuis le nord-ouest ; liaison 161214274.
- Plan d'eau : multipolygone 7273043 (le lac sous le tracé ; la place piétonne en a un trou, d'où la gestion des anneaux intérieurs dans `tools/make_site.py`).

## Ce qui est estimé

- **Profil en hauteur** : lift 36 m (s 44 → 136), chute 32,9 m, bosses d'inversion à s ≈ 236, 310, 360, 500, 545 ; vitesse maxi calculée 23,8 m/s (85 km/h) ; croisements ≥ 3,6 m. L'ordre et la place des sept inversions ne sont PAS connus : la photo montre deux figures en « ∞ » dans le lac (supposées batwing et papillon) et des enchaînements au sud (looping, double vrille) dont on ne sait pas l'ordre.
- **Deux zones de freinage** (propriétaire, 2026-11-15) : (1) un frein de bloc juste AVANT la portion droite qui passe SOUS le lift (retour : diagonale ouest, qui croise le lift vers s ≈ 683) : `blk1` à s ≈ 675 m ; (2) le frein final sur la voie PARALLÈLE à la gare (retour rectiligne nord-sud à x ≈ −15, dernière zone avant l'entrée en gare) : `brk` à s ≈ 735 m, la tête du train s'arrêtant 5 m avant la gare. Positions d'après le propriétaire, **emplacement exact estimé** (identifiées d'après la géométrie OSM). Avec la règle commune (un seul train sur le lift, retenu en haut tant que la zone suivante est occupée), la zone qui suit le lift est le premier frein de bloc.
- Frein final : voie parallèle à la gare (s ≈ 735 → 797), qui contient l'aiguillage du garage (s ≈ 773) ; tête du train à 5 m de la gare (`holdBack`).
- Quais (7 m à l'est, 3,5 m à l'ouest), poste de conduite, porte et chemin de sortie, file (chemin choisi), barrière d'entrée.
- Garage : aiguillage branché au frein final (`yard.at:'brake'`), à l'emplacement du nœud OSM `railway=switch`. La voie repart vers le sud à contre-sens du retour : le train y entre par un virage serré (sens d'entrée inconnu). Course de l'aiguillage, vitesses de manœuvre.
- Longueur (2,55 m) et largeur (1,5 m) d'un wagon ; couleurs des trains (rouge sourd et or, non vérifiées) ; couleurs de la voie (jaune) et des supports (rouge rouille) d'après la photo, assourdies.
- Moteurs par zone : défauts du moteur (gare, frein final, voie = freins + pneus ; bloc = freins seuls), à confirmer.

## Réponses du propriétaire (2026-11-15)

- **Sens de marche** : le lift est la montée juste après la gare (voir plus haut).
- **Cuvette** : « une petite cuvette juste avant le lift » : le profil descend de 3 m (gare) à ≈ 0,9 m entre s ≈ 22 et 43 m, le lift remonte de là (hauteur de la cuvette estimée).
- **Trains** : 2 trains rouges (teinte et liseré gris sombre estimés).
- **Garage** : « les trains vont au garage en marche arrière de la gare si l'aiguillage est orienté vers la voie ; l'aiguillage est un rail qui tourne sur lui-même avec pour axe le tube de rail ». Fait : `yard.back` (le train recule de la gare, remonte le circuit sur 44 m puis entre dans la voie de maintenance OSM, nœud `railway=switch` comme pointe) et `yard.rotary` (aiguillage rotatif : vu du dessus, le tronçon se resserre en largeur ∝ cos θ puis s'ouvre sur l'autre branche ; carter du tambour dessiné autour). Estimés : longueur de l'appareil (5,6 m), durée de rotation (4 s).
- **Portillons à l'ouest de la gare** : embarquement à l'ouest, débarquement à l'est. La file (promenade OSM de l'entrée sud jusqu'à (−28 ; −2) puis raccord estimé vers le quai ouest, 150 m environ) passe sous le retour (diagonale ouest) ; sortie par l'est (allée 161214274 et pont de bois 161214279) ; arrivée des visiteurs par le pont de bois et le chemin 1102233771.
- **Un seul train sur le parcours** (après-lift → frein final) : le lift retient le train au sommet si la zone suivante est occupée. Devenu la règle par défaut du moteur pour toutes les attractions (décision du propriétaire) : un seul train sur le lift, le suivant attend au pied ; train retenu en haut tant que la zone suivante est occupée.
- **Sortie du garage** (propriétaire) : le train repart en marche avant de la voie vers la gare (Garage AV, aiguillage sur la voie puis sur P) ; déjà le comportement de `yard.back`.

## Précisions du propriétaire (2026-11-15, 2e série)

- **« L'aiguillage du Goudurix est un S »** : réconcilié avec le rail rotatif par une **hypothèse** (à confirmer) : le tronçon mobile est un tambour qui tourne autour de l'axe du tube de rail et porte deux faces, une face droite (circuit) et une face en S (voie de garage). Générique : `yard.s` (courbe de Bézier du bord de l'appareil côté gare, tangente le long du circuit, jusqu'au premier point de la voie de maintenance, tangente le long de la voie). Vue du dessus : le tronçon se resserre en largeur ∝ cos θ pendant la rotation puis s'ouvre sur l'autre face ; le S est mirroré de l'autre côté de l'axe tant que l'aiguillage est sur P (invisible). Carter élargi du côté du garage. Le S part du nœud OSM `railway=switch` (a = 44,4 m en amont de l'arrêt de la tête du train), longueur ≈ 6 m, décalage latéral ≈ 3,4 m (voie de maintenance OSM), durée de rotation 4 s : estimés. Captures : `docs/plans/goudurix-aiguillage.jpg`.
- **Profil** : au bout de la ligne droite du lift (fin de la ligne droite à s ≈ 123 m, sommet 36 m), une première petite descente (36 → 31 m, s 123–140), puis le virage à 180° (s ≈ 126–156 m dans le tracé OSM, hauteur ≈ 31 → 30 m), puis la grande descente (30 → 5,5 m, s 158–192) sur la ligne droite nord qui suit ; lift raccourci : s 44 → 123 m. Hauteurs estimées ; vitesse maxi calculée 81–84 km/h (sources : 75–90 km/h) ; croisements ≥ 3,6 m.
- **B1 ralentit nettement le train** : frein de ralentissement générique (`SITE.zones.B1.trim:{v:8}`, m/s) : en passage normal (zone en AUTO, canton suivant libre) le train y est ramené à 8 m/s (≈ 29 km/h, estimé) puis continue (essai : 59 → 29 km/h) ; il s'arrête seulement si le canton suivant est occupé ou si les freins sont serrés au pupitre ; synoptique : « B1 ralentit ».

## Affiche du plan des figures (propriétaire, 2026-11-15)

Source : `docs/sources/goudurix-plan-figures-affiche.png` (dessin stylisé, Vekoma, ouverture 30/04/1989, 950 m, 36 m, 90 km/h, 7 inversions, chute 64°, 4,5 g, 1 min 20, 7 wagons de 2 rangées de 2 = 28 places, 35 000 000 F). Les données de l'affiche **confirment** celles de RCDB / Wikipédia (aucune contradiction : 950 m, 36 m, 90 km/h, 7 inversions, 28 places, 1 min 20). Seule nuance : l'affiche donne l'angle de chute (64°), absent de nos autres sources.

Figures, dans l'ordre du tracé, recalées **par la forme** sur le tracé OSM (l'affiche est tournée d'environ 180° par rapport au nord ; station en haut à gauche une fois tournée, comme dans OSM) : Chain Lift Hill (ligne droite le long de la gare, s 44 → 123) → First drop (ligne droite nord qui suit le virage à 180°, s 158 → 200) → **Butterfly** (2 inversions, le S de (29..48 ; 62..78), s ≈ 206–272) → **Batwing** (2, le ∞ au bord du lac, s ≈ 312–382) → **Loop** (1, ligne droite à l'est après le Batwing, entre les repères 9 et 10 du plan, s ≈ 400–450) → **Double Corkscrew** (2, le S de l'extrémité sud-ouest, s ≈ 540–590) = 7 inversions. Positions et hauteurs **estimées** (l'affiche n'a pas d'échelle) ; croisements ≥ 3,3 m ; plan : `docs/plans/goudurix-figures.jpg` (affiche tournée + tracé recalé, orange = figures).

Profil ajusté : sommet 36 m (s 123) → petite descente 34 m → virage à 180° → grande descente de 34 à 2,7 m sur ≈ 26 m (pente max ≈ 61°, affiche 64°) ; Butterfly (crêtes ≈ 22 et 20 m), Batwing (≈ 18 et 19 m), Loop (sommet 26 m, s 425), Double Corkscrew (≈ 14 et 16 m). Frottements réduits (`roll` 0,02, `drag` 0,0004, estimés) pour que la vitesse calculée atteigne **90 km/h** (25,2 m/s) comme annoncé, au lieu de 81–84 km/h ; longueur 3D calculée 859 m (annoncé : 950 m ; OSM simplifie les inversions).
Étiquettes sur la carte (Butterfly, Loop, Batwing, Double Corkscrew, Grande descente, Virage à 180°) et une caméra par figure (boutons du jeu).

**Correction du propriétaire (2026-11-15)** : « Le loop est après le batwing, à l'est, entre 9 et 10. » (repères du plan `docs/plans/goudurix-figures.jpg`). Notre recalage par la forme le mettait à tort avant le Batwing (s 280–304). Corrigé : Loop à s ≈ 400–450 (sommet 26 m estimé, s 425, ligne droite est x ≈ 54 m, z 46 → 81 m) ; l'ancienne portion 280–304 redevient une ligne basse (4–4,5 m) entre Butterfly et Batwing. Nouvel ordre : Butterfly 206–272, Batwing 312–382, Loop 400–450, Double Corkscrew 540–590. Vitesse maxi calculée 90 km/h, croisements ≥ 3,3 m, longueur 3D 854 m. Étiquette et caméra « Loop » déplacées. Reste estimé : hauteur et emplacement exact (± 10 m).


## Photo de l'aiguillage en rotation (propriétaire, 2026-11-15)

`docs/sources/goudurix-aiguillage-rotation.png` : l'aiguillage pendant son retournement. Confirme l'hypothèse : tambour rotatif autour de l'axe longitudinal (grande poutre jaune), une face porte la voie droite du circuit, l'autre la voie courbe (S) vers le garage ; passerelle grillagée et plate-forme de l'opérateur avec escalier à côté. Couleurs vues de près : poutre et traverses **jaunes**, rails tubulaires **orange-rouge**, supports **rouille** — reportées dans `SITE.track`.

### Passerelle et poste de l'aiguillage (dessin, 2026-11-15)

Demande du propriétaire, d'après la photo ci-dessus : plate-forme métallique rouille avec garde-corps, escalier galvanisé, passerelle grillagée grise inclinée le long du tronçon mobile, opérateur debout avec un boîtier de commande. Dessinés vus du dessus dans `SITE.draw` (`floor`, `shadows`, `landmarks` de `lieux/parc/asterix/goudurix.js`), sans toucher au moteur ; étiquette « Poste aiguillage » (zoom proche). Capture : `docs/plans/goudurix-poste-aiguillage.jpg` (aiguillage sur P, en rotation, sur la voie 1).
- **ESTIMÉ** : position (côté est du retour, opposé à la voie de garage comme sur la photo ; plate-forme x -13,1 → -9,5, z -5,6 → -0,6 ; passerelle de 0,8 m le long du nœud railway=switch ; escalier vers le bout du raccord de la file en (-13,5 ; 5,2), le chemin de service n'étant pas dans OSM), dimensions, hauteur (≈ 2,4 m pour l'ombre) et couleurs. La photo n'est pas géoréférencée.
- L'opérateur est dessiné avec `person()` ; il se tourne vers l'aiguillage pendant la rotation, le voyant du boîtier passe à l'ambre. Pur décor : il ne fait pas partie des opérateurs de lapbars et n'a aucun effet sur le jeu. Non testé : rendu sur mobile.

## Inversions dessinées et Loop agrandi (propriétaire, 2026-11-15)

- « Les corkscrew sont des vrilles (deux inversions) » : le Double Corkscrew (s 538–592 au sol) est fait de deux vrilles successives : la voie tourne deux fois de 360° autour de son axe (dévers 0 → 720° dans `OSM.cps`), avec un déport hélicoïdal de 3 m (la voie tourne autour de la ligne de cœur ; **ESTIMÉ**). Vue du dessus : tracé légèrement en hélice, rails qui se resserrent et changent de côté, poutre centrale qui passe au-dessus, train tête en bas au milieu de chaque vrille. Profil de base abaissé (6 → 10 m), la vrille ajoutant jusqu'à 6 m.
- « Le looping est trop petit, tu peux l'agrandir ×4 en longueur » : OSM ne dessine pas la boucle (une ligne droite avec un petit crochet à z ≈ 62). Entre s 388 et 455 au sol (corde de 52 m sur la ligne droite est), la voie est remplacée par une boucle **ESTIMÉE** de 200 m le long de la voie (×4 par rapport aux 50 m de l'ancien tronçon 400–450), haute de 21 m (sommet ≈ 26 m), vue de dessus une ellipse allongée de ≈ 67 × 7,5 m (x 48–56, z 28–95) dont la voie se superpose (sortie sous la montée, écart 3,7 m) ; train inversé au sommet. Le linéaire ajouté (≈ 148 m) n'existe pas dans OSM : il est généré par `tools/make_site.py` (`inversions` de `tools/specs/goudurix.json`).
- Résultat de la génération : longueur 3D 989 m (annoncé 950 m : l'écart restant tient aux autres figures, simplifiées), vitesse maxi 90 km/h, croisements ≥ 3,3 m. Étiquette et caméra « Loop » recentrées (52 ; 62), étiquette « Butterfly » déplacée sur le S (27 ; 70).
- Règle de départ (commune) : l'aiguillage étant en amont de la gare et le frein de bloc B1 avant lui, un train peut partir aiguillage sur la voie de garage ; il est retenu à B1 jusqu'au retour de l'aiguillage sur P.

## Mise à jour OpenStreetMap du propriétaire (2026-11-16)

- **Étiquettes du circuit corrigées** dans OSM (dans le sens de marche) : gare 937067647 (`station`), lift 541092982 (`lift_hill`, s 31 → 114 m au sol), parcours `moving`, **B1** = `waiting` 1580112200 (s 665–691, finit au croisement sous le lift : position du propriétaire), **frein final** = `waiting` 1580112203 (s 745–777, voie parallèle à la gare : position du propriétaire). Repères lus dans OSM (`osm_brakes`). Le frein final OSM finit 31 m avant la gare : le train s'y arrête (`holdBack` 34, tête 0,6 m avant le tronçon mobile de l'aiguillage, question prioritaire 6).
- **Cuvette** (propriétaire) conservée mais raccourcie : le lift OSM commence à 31 m, la cuvette va de s 20 à 31 (question 47).
- **Loop** : le propriétaire l'a dessiné dans OSM (541092988 : aller, retour de 10,5 m au sommet, aller). `inversions` de la spec : `{type:'loop', osm:true}` — le tracé au sol est celui d'OSM, seule la hauteur est ESTIMÉE (21 m, sommet ≈ 26 m), dévers par transport parallèle (tête en bas au sommet). Remplace la boucle insérée ×4 (200 m de voie ajoutés) : circuit 891 m en 3D (annoncé 950), 91 km/h, croisements ≥ 3,3 m. Double Corkscrew (deux vrilles) inchangé : OSM ne le contredit pas.
- **Aiguillage en S** : cartographié (1580112201, du nœud `railway=switch`, 27 m avant la gare, à la voie de maintenance 1221386549 raccourcie à 34 m) : confirme le S du propriétaire. Le tronçon mobile du moteur va du nœud switch au 3e point du S (≈ 6 m, `a` 45,4, `b` 51,6) ; la voie suit ensuite le S puis la voie de maintenance OSM.
- **File** : 1580112206 depuis la promenade (22,3 ; 25,0), fourche en (5,3 ; 50,5) avec la boucle 1580112207 (barrière ESTIMÉE), le long du retour jusqu'à l'escalier 1580112204 et l'entrée `entrance=main` (-3,0 ; -0,4) du mur ouest : embarquement à l'ouest, confirmé. Le poste de l'aiguillage (dessin estimé) est resserré pour ne pas chevaucher la file.
- **Sortie** : `entrance=exit` (3,5 ; 5,5) du mur est, 1580112210, escalier 1580112211, 1580112209, puis raccord ESTIMÉ vers l'allée est et le pont de bois.
- **Réponses du 2026-11-16** : le train attend au bout du frein final ≈ 34 m avant la gare, juste avant l'aiguillage (confirmé) ; **loop de 26 m** (spec `inversions` h 26) : base abaissée à 1,5 m (ESTIMÉE) pour garder une vitesse plausible au sommet (≈ 27,5 m) ; vitesse maxi 91 km/h, croisements ≥ 3,3 m. Barrière de file sur la boucle 1580112207 gardée (non précisé : question).
- **Gare (bug du propriétaire, 2026-11-16 : portillons hors du quai)** : le sol des quais s'arrêtait au milieu du dernier wagon (corrigé dans le moteur) ; le train (7 wagons, 17,9 m) s'arrête maintenant au bout de la gare OSM (s 18,0) ; le bâtiment OSM 148159470 (6,8 m de large) ne couvrait que la voie : la gare est agrandie à ses quais (ESTIMÉ).


### Lot 3 (propriétaire, 2026-11-16, soir)

- **Loop** : 26 m = hauteur du **sommet** au-dessus du sol. Spec : base remise à 4 m (ESTIMÉE, comme les points voisins s 382 et 480) et boucle de 22 m : sommet 26,0 m (vérifié dans `OSM.cps`) ; circuit 893 m en 3D, 91 km/h au plus, croisements ≥ 3,3 m.
- **Barrières** : la boucle 1580112207 a deux barrières liées, à son entrée et à sa sortie (1,6 m des bouts, ESTIMÉ ; règle générale du propriétaire, jumelle posée par le moteur).
- **Escaliers** : le chemin de sortie (`exit.path`, dessiné à 3,2 m) recouvrait l'escalier 1580112211 : les allées sont maintenant coupées là où elles se confondent avec un escalier ; l'escalier de la file 1580112204, dans l'emprise de la gare agrandie à ses quais (ESTIMÉE), était caché par le plancher : il est dessiné par-dessus. Largeurs : 2 m (file) et 1,6 m (sortie), pas de width dans OSM.

### Lot 4 (propriétaire, 2026-11-16, fin de journée)

- **Loop** : base 4 m, boucle 22 m : confirmé.
- **Escalier de la file** 1580112204 : en applique à l'OUEST de la gare, collé au mur, hors du quai (propriétaire). Quai ouest ramené de 7,0 à 6,2 m (ESTIMÉ ; assez pour les 4 places d'attente par portillon) ; le moteur décale l'escalier hors de la gare agrandie, contre son mur (2,3 m à l'ouest de sa position OSM, ESTIMÉ), avec la file qui y monte ; **palier carré** de sa largeur à son sommet, au plancher de la gare, qui rejoint le quai. Largeur : celle de la file (≈ 1,8 m).
- **Escalier de sortie** 1580112211 : largeur de l'allée de sortie (3,2 m).

- **Lot 5 (2026-11-16)** : chemin d'entrée refait : les points OSM qui menaient au pied de l'escalier à sa position d'origine sont retirés, demi-tour régulier (deux allées à 2,5 m, main courante entre elles) puis montée droite dans l'escalier en applique ; escalier de sortie 1580112211 : 2 m.
- **Lot 6 (2026-11-16)** : 14 portillons, un par rangée (`plat.gatesPer:'row'`), deux visiteurs par portillon, les opérateurs vérifient chaque rangée ; poste de contrôle au sud-est de la gare, sur le quai est devant le premier wagon, vitre vers la voie (`booth:[2.25, 8.6, π/2, .55]`, pupitre réduit ≈ 2,1 × 0,9 m, ESTIMÉ) ; escalier de sortie 1580112211 : palier au HAUT (côté porte de sortie, sens déduit : pas d'`incline` dans OSM), l'ancienne tache de chemin entre la porte et l'escalier retirée ; bord de quai à 0,95 m de l'axe (gabarit 1,5 m + roues), portillons à 1,75 m, couloir d'attente `board.walk` 2,8 m ; entrée de file prolongée de ≈ 4 m dans la zone piétonne, barrières des deux côtés.

## Réimport du 2026-11-20 (issue #33)

- Voie retouchée par le propriétaire le 20/11 (écart de 3 m au plus avec l'import précédent) ; croisement le plus serré 3,5 m (s 594 × 678 au sol) ; looping OSM retrouvé (s moteur 453–506).
- `roller_coaster:element` lu : `OSM.elements` (butterfly, batwing, loop, corkscrew, abscisses du moteur) pour le futur réglage du tangage et du roulis dans l'éditeur.
- **Questions** : B1 1580112200 est en `brake_run` et le frein final 1580112203 en `waiting` : la règle « brake_run = frein final » doit-elle s'appliquer ici ? Le jeu garde B1 = frein de bloc (ralenti à 8 m/s) et le frein final avant la gare (`osm_brakes`). Le tronçon 541092986 (milieu du batwing) est en `moving` : erreur probable, ignoré (`roles` de la spec).
- Lift 541092982 : `layer=*` toujours invalide dans OSM.
