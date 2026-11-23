# La Trace du Hourra — notes de conception (travail en cours)

## Fait (T4, 2026-11-14)

- `lieux/parc/asterix/hourra.js` écrit : l'attraction est jouable (`jeu.html?type=parc&lieu=asterix&el=hourra`), `node tools/check.js hourra` passe (journée complète, manœuvres au pupitre, 0 erreur).
- Circuit fermé de 772 m (3D), 8 tronçons OSM, profil estimé, croisements ≥ 3,3 m, pointe ≈ 53 km/h avec `phys {roll: .13, drag: .0016}`.
- Cantonnement : gare, lift, puis 4 cantons de parcours séparés par 3 freins de bloc `blk1` (s ≈ 288), `blk2` (≈ 474), `blk3` (≈ 633), frein final `brk` (≈ 713). Positions des freins de bloc **estimées** (choisies sur des passages peu pentus, non relevées). Six cantons pour cinq trains : vérifié sans blocage avec 5 trains en piste.
- Chaque frein de bloc se ferme au pupitre (`#bBk1…3`), le frein final avec `#bHold`.
- 6 trains, 5 au plus en piste (`maxRun: 5`, la sortie d'un 6e est refusée) ; 7 bobs de 2 places l'une derrière l'autre ; un bob peut partir avec un seul passager.
- Garage (T8) : voir « Pont transbordeur droit — fait (T8) » ci-dessous ; l'ancien chariot à tronçons en S (T4) est retiré.
- File : way 1032354546 depuis l'allée (barrière d'entrée cliquable), fourche en (11.5,-9) : raccourci vers l'entrée principale (4.8,-1.7) ou boucle nord par les ways 1032685208/1032685209 jusqu'à la seconde entrée (2.9,-3.3). Sortie : way 1032354545 puis allées vers le sud et l'est.

## Frein avant gare et voies sans Avancer (propriétaire, 2026-11-15)

- **Frein avant gare** (zone `Pre`, « Frein avant gare ») entre le rail mobile du parcours et l'entrée de la gare : zone de freinage de stockage, un train de long, pneus (estimés), AUTO par défaut (retient le train tant que la gare est occupée), MANU au choix. Réglage générique `SITE.preBrake:{back:1, name}` (pas de repère de voie : données non régénérées). Position exacte **estimée** : avant du train arrêté à 1 m du début de la gare (s ≈ 770,5 sur 771,5), zone de s ≈ 759 à 770,5, soit ≈ 11 m après le bout du rail mobile du parcours (s ≈ 748).
- Gare occupée : un train attend sur le frein avant gare, un sur le rail mobile du parcours, un au frein final ; ils entrent en gare à tour de rôle. Synoptique : trois zones colorées (« Frein final », « Rail parcours », « Avant gare »).
- Voies de garage : plus de bouton Avancer. Rail du chariot AV pousse le train du chariot dans la voie en face ; Voie k AR le ramène sur le rail du chariot (freins et Arrêt de voie conservés).
- Captures : `/home/user/t7shots/pupitre-hourra-v3.png`, `hourra-pregare.png` (non versionnées).

## Toujours estimé (à faire valider par le propriétaire)

- Pont droit (T8) : côté des voies (ouest), écartement 3,2 m, première voie à 8 m de l'axe du circuit, longueur des voies (un train + 1,4 m), emplacement du chariot (s ≈ 736…748), vitesse du chariot (0,6 m/s, 4 s au moins), vitesse de manœuvre (1,8 m/s), entrée en marche avant / sortie en arrière.
- Longueur (1,55 m) et largeur des bobs, couleurs des trains (teintes sourdes supposées), emplacement exact du poste de conduite (sud-est de la gare), freins de bloc, profil en hauteur.
- Raccords de la boucle de file vers la seconde entrée (quelques points ajoutés entre (0.7,-7.6) et (2.9,-3.3)) et tronçon (11.5,-9) → (5.6,-9.4), absents d'OSM.

## Pont transbordeur — précision du propriétaire (2026-11-14, prioritaire sur ce qui suit)

- Le pont est **droit** : deux rails **droits et parallèles** sur le chariot, pas de courbe en S.
- **Rail mobile du parcours = zone de freinage de stockage (propriétaire, 2026-11-15)** : en AUTO, un train du frein final avance sur le rail mobile (sur le circuit et libre), s'y arrête entièrement et attend là que la gare soit libre ; le train suivant est retenu au frein final derrière lui (un train par zone). Synoptique : les deux zones sont colorées selon l'occupation.
- Rail mobile du parcours (« rail A » dans les premières notes) = rail du parcours, qui est **une zone de freinage** ; quand le chariot se déplace, il se **décale vers l'est**.
- Rail du chariot (« rail B ») = rail de garage : il **prend la place du rail mobile du parcours sur le parcours** pour aller chercher chaque train qui s'y est arrêté, puis le chariot le translate devant la voie de garage voulue (le train est porté par le chariot).
- **Confirmé** : le rail mobile du garage est droit et se déplace **avec le train dessus**.
- Voies de garage droites et parallèles. À confirmer sur plan : sens de sortie des trains, côté des voies, position exacte du chariot.
- La version T4 (tronçons de transfert en S, train jamais porté) est remplacée (T8, ci-dessous).

## Rail mobile du parcours escamotable et poste de conduite — correction du propriétaire (2026-11-14, prioritaire)

- Le rail mobile du parcours (rail du circuit, zone de freinage) n'a que **deux positions** : sur le circuit ou retiré vers l'est. Il **n'est pas** porté avec le rail du chariot vers les voies.
- Modèle : `yard.retract:{d:3.2, name:'Rail mobile du parcours', short:'Rail parcours', rest:1}` (moteur générique, [[`docs/manoeuvres.md`](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)). Rail mobile du parcours : `#yA0` (C, circuit) / `#yA1` (E, retiré à 3,2 m à l'est — course estimée). Chariot du rail du chariot : `#yG` (en ligne) et `#y1…#y6` ; au repos face à la voie 1 (estimé) ; `#yP` supprimé.
- Séquence : G du train → rail mobile du parcours sur E → chariot sur G (le train s'arrête sur le rail du chariot) → chariot sur la voie k (il emporte le train) → AV → chariot ramené sur la voie 1 → rail mobile du parcours sur C. Refus testés : chariot sur G avec le rail mobile du parcours sur le circuit, rail mobile du parcours sur C avec le rail du chariot en ligne ou le chariot en mouvement.
- Poste de conduite : à l'extrémité **sud-est** de la gare (propriétaire), côté sud-ouest de la voie, là où elle sort du bâtiment OSM 148160006, vitre vers la voie, à 2,8 m de l'axe : `booth:[2.8, 8.0, -2.427]` — emplacement exact **estimé**.
- Captures : `docs/plans/hourra-garage-pont-droit.jpg` (repos, rail mobile du parcours retiré, chariot en ligne avec le train, chariot face à la voie, rail mobile du parcours revenu, poste de conduite).

## Pont transbordeur droit — fait (T8, 2026-11-14 ; positions P/G remplacées par la correction ci-dessus)

- `yard: {device: 'traverser', side: 1, gap: 3.2, …}` (moteur générique, [[`docs/manoeuvres.md`](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)). Chariot sur la dernière ligne droite du frein final : rails A et B droits, parallèles, de 12 m (un train de 10,85 m + 0,6 m de chaque côté), s ≈ 736…748 ; `holdBack: 24` pour que le train arrêté y tienne entier. Ligne droite vérifiée : écart au rail droit < 1 cm.
- Positions : `P` (rail mobile du parcours en ligne), `G` (chariot décalé de 3,2 m vers l'est-nord-est, perpendiculaire au circuit qui file au sud-sud-est : rail du chariot en ligne), `1…6` (rail du chariot face à la voie k, chariot vers l'ouest).
- Voies 1…6 droites, parallèles aux rails, côte à côte à l'ouest du circuit (axes à 8 ; 11,2 ; … ; 24 m), dans le bâtiment OSM 148160581 dont le grand côté est parallèle au frein final ; elles commencent 0,8 m après le bout du rail du chariot. Aucun autre tronçon du circuit dans la course du chariot (le circuit passe à l'est).
- Séquence : bouton G du train → il s'arrête à vide avant le pont ; pont sur G → il roule sur le rail du chariot et s'y arrête ; pont sur la voie k → le chariot l'emporte ; AV → il entre en marche avant dans la voie. Sortie : pont sur la voie, AR → il recule sur le rail du chariot ; pont sur G (dernier canton libre, au plus 5 trains en piste) → il redevient un train du circuit et entre en gare ; pont sur P.
- Captures : `docs/plans/hourra-garage-pont-droit.jpg`.

## Garage — réponse du propriétaire (2026-11-14)

- **6 trains**, au plus **5 sur le parcours** : il y a toujours au moins un train au garage.
- **6 voies de garage**, un train par voie.
- Pont transbordeur : la portion du circuit adjacente au garage se dégage en glissant dans la direction opposée au garage ; une voie spéciale, portée par le même chariot, prend sa place et raccorde le parcours, puis translate jusqu'à chacune des 6 voies de garage.
- Interprétation retenue pour le moteur (à faire valider à l'écran) : chariot à 7 positions (`P` = circuit, `1…6` = voies) portant deux tronçons, celui du circuit et la voie de transfert, comme le tronçon en S de Zeus mais avec N voies. Modèle commun : [[`docs/manoeuvres.md`](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md) (`device: 'table'`).
- Toujours supposé : emplacement exact du chariot sur le circuit (gare ou frein final) et orientation des voies dans le bâtiment OSM 148160581.

## Demande initiale du propriétaire (historique)

- **Le garage a plusieurs voies (6, voir ci-dessus).** Le moteur ne gère qu'une voie de garage (trains rangés en file). Il faut un pont transbordeur desservant 5 voies parallèles, une par train, avec choix de la voie au pupitre.
  Le bâtiment candidat dans OSM est le way 148160581, à l'ouest du frein final : sommets (-47.1,-13.1) (-40.2,6.9) (-32.6,4.2) (-34,0.1) (-22,-4) (-27.5,-20.1) (-39.5,-15.9). Demander au propriétaire où se trouve le pont et dans quel sens sont les voies avant d'inventer.

## Caractéristiques relevées

- Photo du propriétaire (2026-11-14) : gouttière **rouge foncé** à nervures extérieures, bord rouge vif ; bobs **jaunes** à intérieur noir, **tous les trains** (propriétaire).

- Propriétaire (2026-11-14) : 1 ou 2 visiteurs par wagon, assis l'un derrière l'autre (`car {seats: 2, inline: true}`), un wagon peut partir avec un seul passager.

- Bobsleigh Mack Rides, ouvert le 31 mars 2001, 900 m, 31 m de haut, 60 km/h.
- Trains : 7 wagons ; 14 passagers par train selon RCDB (2 par wagon, l'un derrière l'autre), 7 selon Coasterpedia. 5 ou 6 trains selon les sources. Couleurs des bobs non vérifiées.

## Repères (origine lat 49.13554, lon 2.56816 ; x est, z sud)

- Gare couverte : de (-7.57,-4.45) à (5.57,6.95), cap sud-est, 17,4 m. Puis lift rectiligne de (18.8,4) à (59.2,-82), sommet à s ≈ 129.
- Bâtiment de gare : way 148160006 (`OSM.polys.station`). Entrées côté nord-est (gauche du sens de marche) : (4.8,-1.7) principale, (2.9,-3.3). Sortie côté sud-ouest : (-0.6,7.0).
- File : way 1032354546 (`OSM.paths.queue`, 174 m, de (54.9,14.7) à (4.8,-1.7)). Deux ways voisins près de la gare : 1032685209 (`queueB`) et la boucle 1032685208 (`queueLoop`, 46 m) entre (0.6,-10.9) et (3.3,-11.3) : candidate pour une fourche avec barrière pivotante.
- Sortie : way 1032354545 (`OSM.paths.exit`), de (-0.6,7.0) à (25.8,38.3).
- Allée d'accès : way 1220633159 (`OSM.paths.prom`), passe à (61.1,16.8), à 6 m du début de la file.
- Ces quatre chemins sont retirés du décor par `make_site.py` : les redonner au moteur via `SITE.paths`.

## Configuration envisagée avant T4 (historique)

- `car {len: 1.55, n: 7, inline: true, w: .95}`, 6 trains (5 au plus en circulation) (un canton de plus qu'il n'y a de trains : gare, lift, 2 cantons de parcours).
- `stopBack: .5`, `holdBack: 27` (arrêt au frein final à s ≈ 752, avant la dernière courbe), `dropAfter: 12`.
- Fourche de file en F = (5.6,-9.4) : raccourci F → (5.9,-6.5) → (4.9,-5) → (3.6,-3.6) ; boucle par `queueLoop` puis (0.2,-10.3) (0.9,-8.1) (0.7,-7.6) (1.6,-6.4) (2.6,-4.9) → (3.6,-3.6). Barrière : pivot (4.55,-8.84), raccourci fermé (6.74,-9.07), boucle fermée (5.95,-10.54).
- Barrière d'entrée sur le raccord allée → file : pivot (58.35,14.71), fermée (57.65,16.79), ouverte (56.27,14.0) ; point d'attente extérieur (59.2,16.15).
- Poste de conduite près de l'avant du train, côté quai : ≈ (8.3,4.1), angle 0,715 rad.
- Vue : centre (43,-28), 190 × 150 m.

Toutes ces coordonnées sont calculées sur plan, pas vérifiées à l'écran.

## Pupitre par zones (T7) — estimé

Zones à moteurs (pneus) supposées : gare, frein final, rail mobile du parcours, rail du chariot (chariot), frein avant gare, voies de garage (Reculer seulement) ; freins de bloc B1…B3 sans moteurs. Réglable par `SITE.zones` dans `lieux/parc/asterix/hourra.js`. À confirmer par le propriétaire (Q4 de [[`docs/ROADMAP.md`](https://github.com/qhess34/osmrides/blob/main/docs/ROADMAP.md)](https://github.com/qhess34/osmrides/blob/main/docs/ROADMAP.md)).

## Mise à jour OpenStreetMap du propriétaire (2026-11-16)

- **Circuit découpé et étiqueté** (`roller_coaster:track`) : lift 937061488 (s 37 → 118 m), zones `waiting` : sommet du lift 1580086188 (s 118–130, traitée comme l'arrêt en haut du lift du moteur, question prioritaire 4), **freins de bloc** 1580086189 (B1, s 302–322) et 1580086191 (B2, s 509–527), **frein final** 1580086193 (s 689–708), **rail mobile du parcours** 1580086185 (s 740–756, 15,4 m : le rail A du pont droit, repères `tr0`/`tr1`), **frein avant gare** 1580086183 (s 763–778, repères `pre0`/`pre1`). Les repères viennent maintenant d'OSM (`tools/specs/hourra.json` : `osm_brakes`) ; seuls `st0`/`st1` restent forcés (gare 1231613335 non étiquetée). Trois freins de bloc estimés → deux freins OSM. Profil : sommet du lift recalé à s 118 (31 m, ESTIMÉ), plateau jusqu'à 135.
- Tout ce que le propriétaire avait dit est confirmé par OSM : frein final, rail mobile du parcours (zone de stockage), frein avant gare. Aucun conflit.
- **File** : le chemin 1032354546 arrive au bord est de la gare puis **passe sous la gare** (1580086194, `tunnel=yes`, `layer=-1`), remonte vers le nord (1032685209), fourche en (0,6 ; -10,9) : raccourci ou boucle 1032685208 (barrière ESTIMÉE), retour par 1032685209 et escalier 1580086195 jusqu'à l'entrée `entrance=main` (1,0 ; -1,3). L'ancien raccord inventé (11,5 ; -9) → (5,6 ; -9,4) est supprimé. Le passage couvert est dessiné quand le toit de la gare s'efface.
- **Sortie** : `entrance=exit` (-0,5 ; 3,8) sur le quai sud-ouest, escalier 1580086196 qui descend, puis 1032354545.
- **Zone piétonne** : multipolygone 8427077 (surface praticable autour de l'attraction) ; les allées parallèles redondantes qu'elle contient (1220633159, 1220633160…) ne sont plus dessinées.
- **Passagers** : `car.pitch:.78` — 0,78 m d'axe à axe entre les deux places (avant : 0,70 m avec des corps trop larges), épaules dessinées sur 0,36 m : les corps ne se touchent plus ; lapbar commune en travers devant le passager avant. Le bob garde 1,55 m (pas besoin de l'allonger).

### 2e mise à jour OSM du propriétaire (2026-11-16, après-midi) et réponses

Filtrage par changesets du jour (`/api/0.6/changesets?bbox=…&time=…`, auteur des ways cités) : 192026103 (passerelle), 192026350 (rocher), 192026807 (forêt, eau, file) ; liste exacte des objets par `/api/0.6/changeset/<id>/download`.
- **Freins** (propriétaire) : la zone « waiting » de 11,7 m en haut du lift (1580086188, s 118–130) est un **frein de bloc** : B1 ; B2 s 302–322, B3 s 509–527 confirmés. Le lift retient le train tant que B1 est occupé (`LIFT_NEXT`).
- **File** : 1580139651, **passage sous le rocher** 1580139652 (`tunnel=yes`, `layer=-1`), 1580137178, **passerelle** 1580137179 (`bridge=yes`, `layer=2`) qui franchit le circuit (hauteur ESTIMÉE 6,9 m : voie à 3,9 m + 2,9 m), 1032354546, passage sous la gare, 1580149150 (fourche), boucle 1032685208 ou raccourci, escaliers 1032685209 et 1580086195.
- **Barrières** (propriétaire) : deux barrières liées à la fourche (0,6 ; -10,9), l'une sur la boucle 1032685208, l'autre sur le raccourci ; emplacement exact ESTIMÉ (1,6 m de la fourche). Le propriétaire a cité 1580112207 pour la 2e : c'est la boucle de Goudurix (question posée).
- **Rocher** 1580139648 (`natural=rock`) : la voie le traverse en tunnel (1580139650, `tunnel=true`, s ≈ 559–563 m du moteur, à 7,6 m) et la file dessous ; hauteur du rocher ESTIMÉE ≈ 9,8 m.
- **Décor** : forêt 1580149149 et eau 1580149148 (autour du rocher) régénérées ; les arbres de bois ne sont plus semés sur les chemins, la file, les escaliers, l'eau ni les rochers.

### Lot 3 (propriétaire, 2026-11-16, soir) — gare, barrières, rocher, passerelle

Extrait OSM frais (`/tmp/osm4`) ; changesets du propriétaire depuis le lot 2 : 192031122 / 192031244 (file d'OzIris, déjà intégrés) et **192038616** (gare 1231613335 étiquetée `roller_coaster:track=station`). Le changeset 192031701 (1 167 modifications) est d'un autre contributeur : non concerné.
- **Gare** : `st0`/`st1` lus dans OSM (quai 17,4 m ; plus de `tags` forcés dans la spec).
- **Barrières** : deux barrières liées sur la boucle 1032685208, à son **entrée** et à sa **sortie** (1,6 m de chaque bout, ESTIMÉ ; jumelle posée par le moteur) ; plus de barrière sur le raccourci 1580149150 (posée par erreur au lot 2).
- **Rocher** 1580139648 : la voie qui vient de l'ouest (s moteur ≈ 547–565, 7,6 m) passe **au-dessus** (poteaux posés sur le rocher), la voie basse après la boucle à 270° (s moteur 606,4–611,9) passe **dessous** en tunnel. OSM porte `tunnel=true` sur la voie haute (1580139650) : ignoré (`tunnels_ignore` de la spec), tunnel ESTIMÉ sur la voie basse (`tunnels_extra` s sol 612,5–618) ; question posée pour corriger OSM. Voie basse abaissée à 4,0 m au croisement (écart 3,6 m). Hauteur du rocher ESTIMÉE ≈ 6,6 m (voie haute − 0,9 m).
- **Passerelle** 1580137179 (width 1 m) : deux escaliers ajoutés par le moteur (absents d'OSM), le long de la file, ≈ 11 m chacun pour 6,8 m de hauteur (ESTIMÉ), 1 m de large ; visiteurs ralentis dessus. Tablier dessiné à 1,3 m (width + garde-corps).
- **Escaliers** 1032685209 et 1580086195 : 1 m (width OSM).

### Lot 4 (propriétaire, 2026-11-16, fin de journée) — rocher, passerelle, barrières

Extrait OSM frais (`/tmp/osm5`) ; changesets du propriétaire depuis le lot 3 : **192040289** (541427592 découpé : 1580221723, **1580221724** `tunnel=true` = voie basse sous le rocher ; rocher 1580139648 retouché) et **192040396** (escaliers 1580224119 `incline=up` et 1580224122 `incline=down`, paliers 1580224120 / 1580224121, `width=1`).
- **Rocher** : les DEUX niveaux de voie passent dans le tunnel (propriétaire) : tunnels OSM 1580139650 (voie haute, s moteur 559–563) et 1580221724 (voie basse, 606–611), prolongés par le moteur jusqu'aux bords du rocher ; `tunnels_ignore` / `tunnels_extra` retirés de la spec ; plus de poteaux sur le rocher. Hauteur du rocher ESTIMÉE ≈ 9,8 m (voie haute 7,6 m + 2,2 m) ; écart des deux voies 3,6 m (profil inchangé, ESTIMÉ). Portails sombres taillés dans la roche (plus de dalles claires).
- **Passerelle** 1580137179 : escaliers OSM chaînés dans la file (`paths.queue` de la spec) ; le moteur n'ajoute plus d'escaliers (OSM en a à moins de 5 m de chemin). Escaliers, passerelle et file à la même largeur dessinée (≈ 2,2 m). Hauteur de la passerelle toujours ESTIMÉE à 6,8 m alors que les escaliers OSM ne montent que ≈ 1,5–2 m : question posée.
- **Barrières** de la boucle 1032685208 : deux barrières de fourche pivotantes parallèles (entrée et sortie de la boucle, poteaux dans la pointe des fourches, ESTIMÉS) qui bougent ensemble : boucle ouverte, toutes deux en travers du raccourci ; boucle fermée, elles barrent l'entrée et la sortie de la boucle.

- **Lot 5 (2026-11-16)** : poteaux-pivots des deux barrières parallèles sur la **bordure du raccourci**, côté boucle, juste après la pointe (ESTIMÉ) ; file dessinée à la **width OSM (1 m)**, boucle 1032685208 (sans width) à 1 m aussi (ESTIMÉ) ; escalier 1580086195 (entièrement sur le quai) plus dessiné, l'escalier qui y mène et l'escalier de sortie s'arrêtent au **bord du quai** ; traversée du quai délimitée de barrières ; couloir sous la gare et tunnel sous le rocher visibles seulement avec « Masquer la gare ».
- **Réimport 19/11** : le rocher (anciens ways 1580139648 et deux autres) est remplacé par la relation r22083041 v2 `natural=bare_rock` avec un trou, lue comme un rocher ; le tunnel de voie (`roof`, s 559-563 m) est inchangé.

## Réimport du 2026-11-20 (issue #33)

- Garage dessiné dans OSM par le propriétaire : rail mobile du parcours 1580086185 (`moving`, rail A), rail du chariot 1582324008 (`moving`), 6 voies 1582324002…1582324007. `lieux/parc/asterix/hourra.js` lit dans OSM la distance de chaque voie à l'axe du rail A (7,1 / 9,4 / 11,8 / 14,2 / 16,7 / 20,3 m, au lieu de 8 à 24 m ESTIMÉS), leur longueur (16,4 à 16,6 m), l'écart A/B (3,6 m au lieu de 3,2) et le jeu rail / voies (0,4 m). Voies dessinées à la main dans OSM, pas tout à fait parallèles (± 0,3 m) : moyenne des deux bouts.
- **À corriger dans OSM** : les 6 voies ont `roller_coaster:track=entretienlayer=1_roller_coaster=track_…` (copier-coller cassé) ; mettre `roller_coaster:track=maintenance`.
- Frein final 1580086193 en `brake_run`, rail du pont en `moving` : repères inchangés (noms par la spec `osm_brakes`).
- Restent ESTIMÉS : course du rail A escamotable (3,2 m), vitesses du chariot et des manœuvres, profil en hauteur (aucun `ele`).
