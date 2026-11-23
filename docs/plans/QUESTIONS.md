# Questions pour le propriétaire — plans à annoter

## À répondre en priorité (2026-11-16, lot 6)

Image : `lot-6.jpg` (quais au gabarit et portillons rapprochés des 4 attractions, toit de Zeus, 14 portillons et poste de Goudurix, entrée de file prolongée, paliers en haut des escaliers, pointillé des files couvertes).

1. **Zeus — toit** : le bâtiment OSM de la gare s'arrête vers x = 9,2 m alors que le quai va jusqu'à 13,6 m (avant du train + 1,6 m) ; le toit est agrandi par le moteur (ESTIMÉ). Le bâtiment OSM est-il trop court (à corriger dans OSM) ou le tronçon `station` trop long ?
2. **Bord de quai** : 8 cm entre le gabarit des wagons et le bord ; portillons à 0,8 m du bord (couloir des opérateurs). Bonnes distances ?
3. **Goudurix — poste de contrôle** : pupitre réduit (≈ 2,1 × 0,9 m, ESTIMÉ) sur le quai est, devant le premier wagon, au coin sud-est de la gare, vitre vers la voie : bon emplacement, bonne taille ?
4. **Goudurix — 14 portillons** : un par rangée, deux visiteurs par portillon, les opérateurs vérifient rangée par rangée : conforme ?
5. **Entrée de file sur une zone piétonne** : couloir prolongé à 5 m dans la zone (Goudurix ; Trace du Hourra 6,5 m et OzIris 7 m l'avaient déjà) : bonne longueur ?
6. **Paliers** : carré de la largeur de l'escalier, en haut seulement (sens OSM `incline`, sinon côté gare / porte / passerelle). Escaliers d'OzIris près de la dernière passerelle : sens inconnu, pas de palier tant qu'`incline` manque dans OSM. Bon rendu ?
7. **Files couvertes** : pointillé fin, tirets clairs et sombres alternés, gare affichée : assez discret et lisible ?
8. **En attente de votre mise à jour OSM** (barrières, escaliers, largeurs) : questions 1 à 5 du lot 5 ci-dessous, gardées.

### En attente (lot 5, barrières / escaliers / largeurs OSM)

1. **Barrières parallèles** (Trace du Hourra, Zeus) : poteau-pivot sur la bordure du raccourci côté boucle : bon côté ?
2. **OzIris — barrière pivotante** au sommet de l'angle, sous la voie : lisible ?
3. **Largeur de la file sans width OSM** (boucle 1032685208, OzIris, Goudurix, Zeus) : width à ajouter dans OSM ?
4. **File le long des quais et dans les zones piétonnes** : 1 m ESTIMÉ ; largeur réelle ?
5. **Trace du Hourra — escaliers d'accès** arrêtés au bord du quai : juste ?

### Répondu le 2026-11-16 (lot 6 : questions prioritaires du lot 5 et demandes)

6. ~~**Quais**~~ : teinte claire validée (« parfait »). 7. ~~**Files couvertes**~~ : repère en pointillé très discret quand la gare est affichée : fait (nouvelle question 7). 8. ~~**Goudurix — demi-tour**~~ : validé.
Demandes faites : file prolongée avec barrières des deux côtés là où elle entre sur une zone piétonne (générique) ; toit de Zeus sur tout le quai ; quais au gabarit, portillons, places d'attente et embarquement recalés (4 attractions) ; palier en HAUT de chaque escalier (escalier de sortie de Goudurix : palier en haut, l'ancienne tache de chemin retirée) ; poste de Goudurix au sud-est ; 14 portillons de Goudurix (`plat.gatesPer:'row'`).

### Répondu le 2026-11-16 (lot 5 : questions prioritaires 1–8 du lot 4 et demandes 9–16)

1. ~~**Passerelle de la Trace du Hourra**~~ : hauteur inconnue, rendu jugé bien : gardé.
2. ~~**Rocher**~~ : rendu bien : gardé.
3. ~~**Barrières de la boucle**~~ : pas dans la pointe : poteau-pivot sur la bordure des chemins, le vantail balaie le chemin (règle des barrières parallèles) : fait (nouvelle question 1).
4. ~~**Quai ouest de Goudurix (6,2 m)**~~ : bien.
5. ~~**Largeur de la file**~~ : width OSM (1 m) quand elle existe ; adaptation seulement sans width : fait (`OSM.widths`, nouvelle question 3).
6. ~~**Escaliers de sortie**~~ : 2 m : fait.
7. ~~**OzIris — barrière pivotante**~~ : pivot au sommet de l'angle entre les deux chemins : fait (nouvelle question 2).
8. ~~**Zeus — raccourcis**~~ : deux barrières parallèles, route de la file inchangée : fait.
9. Goudurix, chemin d'entrée refait (raccord régulier à l'escalier en applique) : fait (nouvelle question 8). 10. Quais éclaircis : fait (nouvelle question 6). 11. Ordre de dessin du quai (opérateurs, visiteurs entre portillons et train) : fait, vérifié sur les 4 attractions. 12. Files couvertes masquées sauf « Masquer la gare » : fait (nouvelle question 7). 13. Escaliers de la Trace du Hourra arrêtés au bord du quai : fait (nouvelle question 5). 14. OzIris, file 1 m délimitée des deux côtés (quais, zones piétonnes) : fait (nouvelle question 4). 15. Zeus, 2e raccourci : la « barrière qui ne bouge pas » était un bout de main courante isolé, supprimé ; raccord sans rétrécissement ; contrôle `gatesMove`. 16. Promeneurs exclus des chemins de file ; contrôle `strollQ=0`.

### Répondu le 2026-11-16 (lot 4 : questions prioritaires 1–8 du lot 3, 3e mise à jour OSM : changesets 192040289 / 192040396)

1. ~~**Trace du Hourra — rocher**~~ : les **deux** niveaux de voie passent dans le tunnel du rocher ; tag OSM juste. Fait : `tunnels_ignore` / `tunnels_extra` retirés, voie basse étiquetée par le propriétaire (1580221724), tunnels prolongés jusqu'aux bords du rocher, plus de voie posée sur le rocher ; portails sombres taillés dans la roche, plus de rectangles blancs (nouvelle question 2).
2. ~~**Trace du Hourra — escaliers de la passerelle**~~ : dessinés dans OSM (1580224119, 1580224122) : utilisés ; escaliers estimés du moteur retirés pour cette passerelle (mécanisme gardé quand OSM n'en a pas) (nouvelle question 1).
3. ~~**Trace du Hourra — raccourci**~~ : deux barrières parallèles qui bougent ensemble : boucle ouverte, toutes deux en travers du raccourci ; boucle fermée, elles barrent l'entrée et la sortie de la boucle. Fait (barrières de fourche pivotantes, nouvelle question 3).
4. ~~**Zeus — barrières de sortie**~~ : gardées (nouvelle question 8).
5. ~~**OzIris — raccourci des lacets**~~ : UNE barrière pivotante qui ferme un chemin ou l'autre. Fait (nouvelle question 7).
6. ~~**Goudurix — loop**~~ : base 4 m, boucle 22 m : confirmé.
7. ~~**Goudurix — escalier de la file**~~ : en applique à l'ouest de la gare, collé au mur, hors du quai. Fait : décalé contre le mur (quai ouest ramené à 6,2 m) (nouvelle question 4).
8. ~~**Escaliers — largeurs**~~ : même largeur que les chemins qu'ils prolongent ; palier rectangulaire dans le prolongement de la gare en haut de l'escalier de Goudurix. Fait (nouvelles questions 5–6). En plus : jonctions couloir couvert / allée / escalier / zone piétonne sans trait noir (même sol, bordures sur les côtés seulement).

### Répondu le 2026-11-16 (lot 3 : questions prioritaires 1–8 de la 2e mise à jour OSM)

1. ~~**Trace du Hourra — 2e barrière**~~ : c'était aussi la boucle 1032685208 : barrières à l'**entrée** et à la **sortie** de la boucle, liées ; barrière du raccourci retirée (fait, nouvelle question 3).
2. ~~**Trace du Hourra — rocher**~~ : hauteur inconnue (estimation gardée) ; la voie qui vient de l'ouest passe **au-dessus**, la voie basse après la boucle à 270° passe **dessous** (tunnel) : fait (voie haute dessinée sur le rocher avec ses poteaux, tunnel sur la voie basse, écart 3,6 m ; nouvelle question 1).
3. ~~**Trace du Hourra — passerelle**~~ : hauteur inconnue (estimation gardée) ; escaliers à chaque extrémité, absents d'OSM : ajoutés par le moteur au bout de toute passerelle surélevée sans escalier, sur la file (fait, nouvelle question 2).
4. ~~**Goudurix — loop**~~ : 26 m = hauteur du **sommet** au-dessus du sol : profil corrigé (sommet 26,0 m au lieu de 27,5 m ; nouvelle question 6).
5. ~~**Zeus — tunnel 2**~~ : bien placé, rien à changer.
6. ~~**Goudurix — barrière de file**~~ : la boucle 1580112207 a des barrières à l'entrée **et** à la sortie. **Règle générale** (toutes les attractions) : chaque chemin de file fermable a une barrière à son entrée et à sa sortie, qui bougent ensemble : fait dans le moteur (jumelle posée automatiquement), appliqué à la Trace du Hourra, Goudurix, OzIris, et Zeus (nouvelle question 4).
7. ~~**Trace du Hourra — gare**~~ : étiquetée `station` dans OSM par le propriétaire (changeset 192038616) : repères lus dans OSM, quai de 17,4 m (au lieu de 16 m forcés).
8. ~~**OzIris — barrières**~~ : à tester par le propriétaire (seule la règle 6 appliquée : barrière de sortie ajoutée au raccourci des lacets sud). Goudurix : escalier de sortie dégagé (le chemin de sortie ne le recouvre plus), escalier de la file dessiné sur le quai ; **escaliers** : largeur = width OSM, sinon celle du chemin raccordé (1,2–2 m), jamais plus large que la file, pas de chevauchement entre voisins (fait, nouvelle question 8).

### Répondu le 2026-11-16 (questions prioritaires 1–8 de la 1re mise à jour OSM)

1. ~~**Zeus — 2e tunnel**~~ : **entre les repères 18 et 19** de `zeus-trace-complete.png` (rond n = s moteur (n−1)×50 m, vérifié : 18 = s 850, 19 = s 900) ; fait : `SITE.tunnels` s 850–900.
2. ~~**OzIris — galerie**~~ : **oui**, 1580105918 est une galerie au-dessus du sol (déjà dessinée en toit de béton, `'roof'`).
3. ~~**OzIris — freins**~~ : **confirmé**, aucun frein de bloc en parcours.
4. ~~**Trace du Hourra — sommet du lift**~~ : la zone de 11,7 m est un **frein de bloc après le lift** (zone de freinage AUTO/MANU) ; fait : B1 (s 118–130), le lift retient le train tant que B1 est occupé ; freins de bloc B2 et B3 ensuite.
5. ~~**Trace du Hourra — freins de bloc**~~ : **oui**, s 302–322 et 509–527 (B2, B3).
6. ~~**Goudurix — arrêt au frein final**~~ : **oui**, le train attend au bout du frein final ≈ 34 m avant la gare, juste avant l'aiguillage.
7. ~~**Goudurix — loop**~~ : **26 m** ; fait (voir nouvelle question 4).
8. ~~**Barrières des boucles de file**~~ : Trace du Hourra **oui** (deux barrières liées : boucle 1032685208 / raccourci) ; OzIris : d'abord « non », puis **corrigé par le propriétaire : oui** — une barrière pour le raccourci 1580173580, deux liées pour la boucle 1580173578 / 1580173579 (fait) ; Goudurix non précisé (barrière gardée, nouvelle question 6).

Images par attraction (Trace du Hourra, Tonnerre 2 Zeus, OzIris). `<id>-trace-complete.png` montre le **tracé complet** seul, sur fond clair, avec un rond numéroté **tous les 50 m** (tableau : distance, hauteur estimée, zone), un point tous les 10 m et le sens de marche ; c'est la meilleure base pour placer freins et moteurs. Les deux autres images montrent la vue aérienne et la gare / le garage. Les repères sont des **ronds numérotés** : rouge = zone du circuit (position estimée par nous), gris = repère tous les 100 m de voie (« s = 300 m » veut dire 300 m après le début du quai), bleu = bout de voie de garage, violet = garage. Chaque repère porte un point d'interrogation : « à confirmer ».

**Comment répondre** (au choix, sur téléphone) :
- ouvrir l'image, **dessiner ou entourer** directement dessus (zone de freinage, sens des voies, position du chariot), puis renvoyer l'image annotée ;
- ou répondre **par écrit avec les numéros** : « zone de freinage entre 7 et 8 », « le chariot est au 14 », etc.

Les numéros sont propres à chaque image (une image = une légende).

---

## La Trace du Hourra

Images : `hourra-vue-ensemble.jpg` et `hourra-gare-garage.jpg`.

### Vue d'ensemble

1. **Freins.** *(Répondu par OSM, 2026-11-16 : zones « waiting » = sommet du lift s 118–130, freins de bloc s 302–322 et 509–527, frein final 689–708, rail mobile du parcours 740–756, frein avant gare 763–778 ; reste la question prioritaire 4–5.)* ~~Nos freins de bloc (7, 9 et 12) et le frein final (13 à 14) sont des positions **estimées**.~~ Combien y a-t-il de zones de freinage sur le parcours ? Où sont-elles exactement (« entre 6 et 7 », ou dessinez-les) ? Sont-elles courtes (un seul patin) ou longues (plusieurs mètres) ?
2. **Moteurs.** Quelles zones ont des **pneus d'entraînement** (moteurs avant et arrière) et lesquelles n'ont que des freins ? Gare, pied de lift, freins de bloc, frein final, chariot, voies de garage : pour chacune, « freins seuls » ou « freins + moteurs » ?
3. **Lift.** *(Répondu par OSM : lift s 37 → 118 m, puis zone d'attente au sommet.)* ~~Le lift va-t-il bien du repère 3 (s = 32 m) au repère 5 (s = 132 m) ?~~ Où se trouvent le début et la fin de la chaîne ?
4. **Gare.** Le quai va du repère 1 au repère 2 : quelle est sa longueur, et combien de portillons (un par bob ?) ? Le train s'arrête-t-il bien avec la tête au repère 2 ?
5. **Circuit.** Le sens de marche (1 → 2 → 3 → 5 → … → 13 → 14 → 1) est-il juste ? Y a-t-il d'autres zones où le train s'arrête ou ralentit (avant la gare, avant le lift) ?
6. **Garage.** Le garage violet (15) est-il bien dans ce bâtiment, à l'ouest du frein final ?

### Gare et garage

7. **Pont transbordeur.** *(Confirmé : rail mobile droit, il se déplace avec le train dessus. Position le long du circuit répondue par OSM : tronçon « waiting » 1580086185, 15,4 m, entre la courbe qui suit le frein final et le frein avant gare.)* Il est supposé **droit**, avec **deux rails parallèles** : le rail du parcours (c'est une zone de freinage) qui se décale vers l'est, et le rail de garage qui prend sa place et porte le train. Où commence-t-il et où finit-il le long du circuit (repère 14 ? entre 13 et 14 ?) ? Quelle est sa longueur, c'est-à-dire la longueur d'un train ?
8. **Sens de translation.** Le chariot se décale-t-il bien vers l'est quand le rail de garage vient prendre la place du parcours ? Jusqu'où va-t-il (devant la voie 1 ? 6 ?) ?
9. **Voies de garage.** Il y en a 6, droites et parallèles. Sont-elles bien **nord-sud** comme dessinées (bout nord = 16, 18, 20, 22, 24, 26 ; bout sud = 17, 19, 21, 23, 25, 27) ? Sont-elles de l'**ouest ou de l'est** du pont ? Quelle voie est la plus proche du pont (1 ou 6) ?
10. **Entrée et sortie.** Par quel bout les trains entrent-ils dans une voie (nord ou sud) et par quel bout en ressortent-ils ? Reculent-ils pour sortir, ou ressortent-ils par l'autre bout ?
11. **Équipement des voies.** Les voies de garage ont-elles des freins, des pneus moteurs avant / arrière ? Y a-t-il une butée au bout ?
12. **Frein final.** *(Répondu par OSM : frein final s 689–708, puis rail mobile, puis frein avant gare ; trois trains peuvent attendre.)* ~~Le train s'arrête-t-il au repère 14 (début du chariot) ou plus tôt ? Combien de trains peuvent attendre derrière lui ?~~

---

## Tonnerre 2 Zeus

Images : `zeus-vue-ensemble.jpg` et `zeus-gare-garage.jpg`.

### Vue d'ensemble

1. **Freins.** Nous n'avons qu'un frein final (repère 14, s ≈ 1 050 m, avant le retour en gare) et **aucun frein de bloc**. Y a-t-il d'autres zones de freinage (par exemple avant le lift, avant ou après la descente) ? Lesquelles : « entre 8 et 9 » ?
2. **Moteurs.** Quelles zones ont des pneus ou moteurs d'entraînement (gare, frein final, aiguillage, garage) et lesquelles n'ont que des freins ?
3. **Lift.** Le lift va-t-il du repère 3 (s = 30 m) au repère 4 (s = 115 m) ?
4. **Gare.** Le quai va du repère 1 au repère 2 (s = 0 à 21 m) : longueur réelle ? Combien de portillons ?
5. **Sens et zones.** Le sens 1 → 2 → 3 → 4 → 5 … → 14 → 1 est-il juste ?

### Gare et garage

6. **Aiguillage.** Nous le plaçons entre les repères 2 et 3 (s = 21 à 27 m), juste après l'arrêt en gare. Est-ce le bon endroit ? Se déplace-t-il sur un chariot qui glisse, ou tourne-t-il comme une lame d'aiguillage ?
7. **Garage.** Une seule voie de maintenance, du repère 17 (ouest) au repère 18 (est), au nord de la gare. Combien de trains peut-elle contenir ? Les trains y entrent-ils par le bout ouest (17) et ressortent-ils par le même bout en marche arrière ?
8. **Équipement.** La voie de garage a-t-elle des moteurs avant / arrière ou une butée à l'est (18) ?
9. **Sortie du garage.** Pour ressortir, le train doit-il revenir en gare ou peut-il rejoindre directement le pied du lift (repère 3) ?

---

## La Trace du Hourra — file d'attente (à corriger)

Images : `hourra-file-correction.jpg` (plan à annoter, un rond tous les 5 m de l'entrée 1 à la gare 48) et `hourra-file-vue-aerienne.jpg` (rendu actuel du jeu).
La file de Tonnerre 2 Zeus est validée par le propriétaire : ne pas y toucher.

13. **Tracé.** *(Répondu par OSM, 2026-11-16 : file 1032354546, passage sous la gare 1580086194, boucle 1032685208, escalier 1580086195 ; entrée entrance=main, sortie entrance=exit + escalier 1580086196 ; questions 14, 16, 17 aussi.)* ~~Dessinez le vrai chemin de la file, ou dites où le nôtre est faux avec les numéros.~~
14. **Entrée.** Où est l'entrée réelle (près du 1 ?) et d'où arrivent les visiteurs (trait vert) ?
15. **Boucles et raccourcis.** Combien de boucles peuvent être ouvertes ou fermées, où sont les barrières (la nôtre au 35 est estimée) ?
16. **Arrivée en gare.** Par où la file entre-t-elle dans la gare (48), combien de couloirs vers les portillons ?
17. **Sortie.** Le trait bleu (sortie) est-il juste ?

---

## OzIris

Images : `oziris-trace-complete.png` (tracé complet, rond tous les 50 m, tableau distance / hauteur estimée / zone), `oziris-file-correction.jpg` (file, gare, sortie, repères 1 à 16) et `oziris.jpg` (rendu du jeu : vue d'ensemble, gare, inversion, garage).
Les numéros 1 à 17 ci-dessous renvoient à `oziris-trace-complete.png` ; « repère F<n> » renvoie à `oziris-file-correction.jpg`.

18. **Trains.** Combien de trains en service : 3 (Wikipédia / RCDB) ou 2 (CoasterBuzz) ? Combien au plus sur le parcours en même temps ? Couleurs des trains et de la voie ?
19. **Freins.** *(Répondu par OSM, 2026-11-16 : frein final s 768–791, rail du pont 798–812, zone d'attente avant gare 842–858 ; aucun frein de bloc dans OSM — à confirmer, question prioritaire 3.)* Y a-t-il un frein de bloc en cours de parcours ? Le nôtre (rouge, au 11, s ≈ 520 m) est supposé. Le frein final va-t-il bien du 16 au pont (17), puis zone d'attente jusqu'à la gare (1) ?
20. **Inversions.** *(Répondu en partie via l'affiche, voir 27 : dive loop s ≈ 165–205, looping vertical 240–290, Immelmann 295–345, zéro-G 475–510 et 680–740.)* Nos cinq bosses sont désormais posées d'après l'affiche ; hauteurs estimées.
21. **Pont transbordeur.** *(Répondu, 2026-11-15 : un seul rail — « c'est la voie du parcours qui vient chercher les trains au garage » ; fait, `docs/plans/oziris-garage.jpg`.)* ~~Le pont porte-t-il deux rails côte à côte ou un seul rail ?~~ Reste : longueur du rail et vitesse du chariot (estimées).
22. **Voies de garage.** Les trois voies (violet, 1 à 3) sont en amont du pont, à côté du frein final : le train y entre-t-il bien **en marche arrière** et en ressort-il en marche avant ? Un train par voie ?
23. **Moteurs.** Gare, frein final, pont, voies : freins seuls ou freins + pneus ?
24. **Quais.** *(Répondu par OSM : entrée entrance=main à l'OUEST de la voie, sortie entrance=exit à l'EST ; embarquement passé à l'ouest.)* ~~Embarquement côté est (file, repère F12) et débarquement côté ouest : juste, ou l'inverse ?~~
25. **Sortie.** *(Répondu par OSM : porte du quai est, passerelle 1580105927, escalier 1580105929, allée 1580105928.)* ~~Nous faisons descendre les visiteurs par un escalier au milieu du quai ouest (F13), passer sous la gare (F14), traverser la boutique (F15) et sortir sur l'allée (F16) : où est la vraie sortie ?~~
26. **File.** *(OSM 2026-11-16 : fin de file refaite — zigzag ouest, passage sous la gare, escaliers et passerelles jusqu'à l'entrée ouest. Reste la barrière : question prioritaire 8.)* La boucle ouest (F6, F7) peut-elle être fermée par une barrière à la fourche F5 ? Y en a-t-il d'autres ?

27. **OzIris — plan des figures.** La page envoyée ne contient que des miniatures : le panneau du plan des figures est illisible. Pouvez-vous envoyer l'image en grand (capture plein écran du panneau ou photo) ?
28. **OzIris — trains.** Un article annonce un 4e train : combien de trains aujourd'hui, et de quelles couleurs ?

## Goudurix

Images : `goudurix-trace-complete.png` (tracé complet, rond tous les 50 m, tableau distance / hauteur estimée / zone) et `goudurix-file-correction.jpg` (file, gare, sortie, garage, repères F1 à F12). Les numéros 1 à 16 renvoient à `goudurix-trace-complete.png`. Détails : `docs/goudurix-notes.md`.

29. **Trains.** *(Répondu : 2 trains rouges.)* Reste : liseré, teinte exacte ; un seul ou deux sur le parcours en même temps ?
30. **Inversions.** Nos bosses (vers 6, 10–11, 12–13, 14) sont estimées. Où sont le looping vertical, le batwing, le papillon et la double vrille, et dans quel ordre ? (« le looping est au 6 », etc.)
31. **Freins.** *(Répondu par OSM, 2026-11-16 : B1 = tronçon « waiting » 1580112200, s 665–691 ; frein final = 1580112203, s 745–777, 31,9 m.)* *(Répondu : deux zones de freinage, l'une juste avant la portion droite sous le lift (rond 14, s ≈ 675 m), l'autre sur la voie parallèle à la gare (rond 15–16, s ≈ 735 m) ; faites, emplacements exacts estimés.)* Reste : longueur de chaque zone, nombre de patins ; un train en attente à la première zone bloque-t-il bien le lift ? *(Répondu, 2026-11-15 : la zone qui suit le lift est le premier frein de bloc ; un train arrêté sur le frein final ne bloque le lift **que s'il n'y a aucun frein avant le frein final** — c'est le comportement codé.)*
32. **Lift.** *(Répondu par OSM, 2026-11-16 : lift_hill 541092982, s 31 → 114 m.)* *(Corrigé par le propriétaire : le lift est la montée après la gare, ligne droite entre 15 et 16 de l'ancien plan.)* Fait : lift du 44 au 136 m, sens de marche inversé par rapport à la première version. Début et fin de la chaîne exacts ?
33. **Garage.** *(OSM 2026-11-16 : le S est cartographié (1580112201, du nœud railway=switch, 27 m avant la gare, vers la voie de maintenance).)* *(Répondu : le train recule de la gare vers la voie, aiguillage rotatif autour du tube de rail ; il repart en marche avant de la voie vers la gare ; fait.)* Reste : distance exacte de l'aiguillage à la gare (≈ 44 m, d'après le nœud OSM), nombre de trains qui tiennent dans la voie (nous : 2).
34. **Moteurs.** Gare, frein final, voie de garage : freins seuls ou freins + pneus ?
35. **Quais.** *(Répondu : portillons à l'ouest, fait. Porte de sortie : OSM entrance=exit (3,5 ; 5,5) dans le mur est.)* Profondeur des quais ? Où est la porte de sortie côté est (nous : F6) ?
36. **File.** *(Répondu par OSM, 2026-11-16 : file 1580112206 depuis la promenade, boucle 1580112207, escalier 1580112204 jusqu'à l'entrée ouest.)* ~~OSM ne cartographie pas la file : nous avons pris la promenade ouest (F2) puis un raccord vers le quai ouest (F3), qui passe sous le retour. Où est la vraie file (entrée, boucles, barrières) ?~~
37. **Sortie.** *(Répondu par OSM : 1580112210, escalier 1580112211, 1580112209.)* ~~Nous faisons sortir les visiteurs par une porte du mur est (F6), vers l'allée et le pont de bois (F7, F8) : où est la vraie sortie ?~~
27. **OzIris — plan des figures.** *(Répondu, 2026-11-15 : affiche fournie, `docs/sources/oziris-plan-figures-affiche.png`, noms lisibles : Dive Loop, Vertical Loop, Immelmann, Zero-G Roll ×2 ; placement sur le tracé OSM dans `docs/oziris-notes.md`.)* Reste : l'affiche est stylisée, les emplacements exacts (± 10 m) et les hauteurs des inversions sont estimés ; l'ordre dive loop, looping, Immelmann, zéro-G, zéro-G se déduit de la forme : à confirmer (vidéo embarquée ou photo de la chute).
28. **OzIris — trains.** *(Répondu, 2026-11-15 : 3 trains, tous bleus ; l'article sur un 4e train est dépassé.)* Reste : teinte exacte du bleu et des lapbars (supposée d'après les photos).
38. **Aiguillage en S.** *(Propriétaire : « l'aiguillage est un S ».)* Notre hypothèse : tambour rotatif, une face droite (circuit), une face en S (voie de garage). Est-ce le bon dessin (`docs/plans/goudurix-aiguillage.jpg`) ? Longueur et décalage du S ? *(Photo du propriétaire, 2026-11-15, `docs/sources/goudurix-aiguillage-rotation.png` : retournement en cours — confirme le tambour rotatif : grande poutre jaune portant d'un côté la voie droite, de l'autre la voie courbe ; passerelle et poste de manœuvre à côté. Reste : longueur et décalage exacts.)*
39. **Profil.** Lift jusqu'au rond 3, petite descente, virage à 180° (rond 4), grande descente : hauteurs de la petite descente et du virage (nous : 31 m et 30 m) ?
40. **B1.** Vitesse réelle en sortie du frein de ralentissement (nous : 29 km/h) ; B1 est-il aussi un frein d'arrêt ?
41. **Figures.** *(Répondu en partie, 2026-11-15 : « Le loop est après le batwing, à l'est, entre 9 et 10 » ; Loop déplacé à s ≈ 400–450. Reste à confirmer : Butterfly, Batwing, Double Corkscrew et les hauteurs.)* L'affiche (`docs/plans/goudurix-figures.jpg`) place Butterfly, Loop, Batwing et Double Corkscrew. Notre recalage par la forme (orange) est-il juste (le Loop sur la ligne droite après le Butterfly, le Batwing au bord du lac, le Double Corkscrew au sud-ouest) ? Hauteurs des figures (nous : Butterfly 22 m, Loop 26 m, Batwing 19 m, Double Corkscrew 16 m) ?
42. **Longueur.** *(OSM 2026-11-16 : avec le loop dessiné, 808 m au sol et 891 m en 3D.)* Notre tracé calculé fait 859 m (950 m annoncés) : y a-t-il une portion que nous ne voyons pas (rail de retour, courbe) ?


## Nouvelles questions nées des données OSM (2026-11-16)

Images : `maj-osm.jpg` (rendu du jeu après la mise à jour), `<id>-trace-complete.png` (zones lues dans OSM en rouge).

43. *(Répondu, 2026-11-16 : entre les repères 18 et 19, s 850–900.)* **Zeus — 2e tunnel.** RCDB liste deux tunnels ; OSM n'en a qu'un (polygone 1353118256, bas de la première descente). Le 2e (tunnel sombre à effets, « après un virage à gauche », d'après Wikipédia) est placé à s ≈ 846–871 m : position et longueur ?
44. *(Répondu, 2026-11-16 : galerie au-dessus du sol.)* **OzIris — galerie couverte.** Tronçon 1580105918 `tunnel=yes` + `layer=2` : galerie au-dessus du sol (dessinée en toit de béton) ou tunnel enterré ?
45. **OzIris — gare.** La voie OSM de la gare fait 21,2 m (avant : 18 m) : le train s'arrête maintenant 3 m plus loin. Juste ?
46. **Trace du Hourra — gare.** Le tronçon de gare 1231613335 n'a pas `roller_coaster:track=station` : nous gardons 16 m de quai. Faut-il l'étiqueter ?
47. **Goudurix — cuvette.** Le lift OSM commence à 31 m (avant : 44 m) : la cuvette avant le lift (vous) est ramenée à s 20–31 m. Juste ?
48. **Goudurix — aiguillage.** Le S OSM fait ≈ 11 m ; notre tronçon rotatif en fait ≈ 6 (du nœud switch au 3e point du S). Longueur réelle du tambour ?
49. **Zones « moving » / « waiting ».** Nous lisons `waiting` comme une zone de freinage (stockage ou bloc) et `moving` comme du parcours. Est-ce bien votre convention ? Faut-il distinguer les freins de bloc (`block_brake`) et les zones d'attente ?
50. **Zones piétonnes.** Les chemins à l'intérieur des zones piétonnes OSM ne sont plus dessinés (surface praticable partout). Y en a-t-il qu'il faut garder (allées bordées, barrières) ?

Conflits OSM / réponses du propriétaire : **aucun**. Les données OSM confirment l'aiguillage en S de Goudurix, le frein avant gare, le rail mobile et le frein final de la Trace du Hourra, le rail unique du pont d'OzIris, l'embarquement à l'ouest de Goudurix. Seul point ajusté : la cuvette de Goudurix raccourcie (question 47).
