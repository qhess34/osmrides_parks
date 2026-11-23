# Tests, boutons du pupitre, mobile, son

Quand la lire : écrire ou lancer un test, savoir quel id de bouton cliquer, lire la sortie de `check.js`, `mobile.js`, `save.js`, `editor-test.js`, tester les toits ou le son.

Fiche de référence (extraite d'`AGENTS.md`, 21/11). Une règle n'est écrite qu'ici ; ailleurs on renvoie.

## Mise en place

Playwright et Chromium sont préinstallés (`require('playwright')`, `chromium.launch()` sans option).

Moteur local (osmrides_parks) : `MOTEUR=../osmrides/engine/ NODE_PATH=$(npm root -g) node tools/check.js <el>` ajoute `&moteur=…` à l'URL de `jeu.html` (aussi `save.js`, `mobile.js`, `sound.js`, `captures.js`, `thumbs.js`, `yard-zone.js`) ; sans variable, moteur par version (`const MOTEUR`).

Ouvrir `file:///…/jeu.html?type=parc&lieu=asterix&el=<site>` (l'aide n'est plus ouverte au lancement, seulement au bouton « ? » `[data-act=help]` ; les scripts l'ouvrent avec `act('help')` puis cliquent `[data-act=closeHelp]`), puis dans `page.evaluate` :

- avancer vite : `act('speed',0)` puis boucler `step(.025)` ; figer la météo avec `G.wx.next=1e6` ;
- exploitation de 9 h (plus de journée : jeu continu, rien ne se réinitialise, [[`docs/manoeuvres.md`](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md)) : boucler tant que `G.played - p0 < 540` (minutes de jeu cumulées ; `G.time` boucle 10:00–19:00), en dépannant (`act('job','liftFix')`, `'brakeFix'`, `act('rearm',i)`) ;

## Pupitre

cliquer les vrais boutons du pupitre (libellés en texte court, aucun pictogramme, issue #41 : `#bOpen` « OUV. FERM. », `#bEvac` « ÉVAC. », `#bGate` « OUV. FERM. », `#bRes` « OUV. VERR. », `#bGo` « DÉPART » ; voyant `#lEvac` ; `#bOpen`, `#bAuto`, `#bGate` (seul moyen d'ouvrir / fermer les portillons), `#bRes` (sécurités : ouvrir / verrouiller, voyant `#lRes`), `#bGo`, `#bStop`, `#bByp` ; zones (`engine/garage.js` `ZONES`, `act('zone','<id>:<cmd>')`) : ids `St` (gare), `B1…Bn` (freins de bloc), `Fin` (frein final), `RA`/`RB` (pont droit : rail mobile du parcours = rail A, rail du chariot = rail B ; pont à rail unique `single` : `RB` seul, « Rail du pont », zone de freinage AUTO/MANU en P et zone porteuse face à une voie), `Pre` (frein avant gare, si `SITE.preBrake`), `L1…Ln` (voies : bouton **Dispatch** `#zL<k>_d`, `act('zone','L<k>:d')` (issue #11) : appareil sur la voie k, entrée du train prêt sur la zone porteuse `RB` / `St` / `Fin` s'il y a de la place, sinon sortie du train de tête ; sens choisi par le moteur, freins des voies automatiques, arrêt automatique à `SITE.yard.buffer` m (défaut 2, ESTIMÉ) du butoir et du train garé devant ; refus au journal si l'appareil n'est pas sur la voie ou si la zone porteuse porte déjà un train (jamais de sortie alors) ; bouton de freins forcés `#zL<k>_k` (`act('zone','L<k>:k')`, Serrer / Relâcher : arrêt immédiat du train qui entre ou sort, Dispatch refusé tant que serrés, reprise au Dispatch) ; pas de `_f`/`_b`/`_x`), boutons `#z<id>_k` (freins serrer/relâcher ; pas pour la gare `St` : freins liés au départ, voyant `#zSt_fr`), `#z<id>_f` / `_b` / `_x` (moteurs Avancer / Reculer / Arrêt, si la zone en a ; freins de bloc `B<k>` : roues de propulsion en marche avant seule, `drive:'fwd'`, `#zB<k>_f` / `_x` sans `_b` ; en MANU un train arrêté au frein n'en repart qu'à AV, refusé si le canton suivant est occupé), `#z<id>_m` (AUTO/MANU, zones de freinage), `#zLift_on` / `#zLift_off`, `#zAuto` (toutes les zones de freinage en AUTO), voyant `#lz<id>` ; appareil de voie `#yP` (P, sauf pont droit à rail A escamotable), `#y1`…`#yN`, `#yG` (pont droit à deux rails : rail de garage en ligne ; absent pour un rail unique) ; rail A escamotable `#yA0` (sur le circuit), `#yA1` (retiré) ; synoptique du circuit (plan nord en haut, zones, freins de bloc B1…, garage, trains numérotés ; bouton `#bSyn`, choix gardé dans `localStorage` `t2z.syn`, masqué par défaut sous 600 px ; clic sur un numéro = caméra de suivi) dessiné par `drawSyn()` dans `engine/render.js` ; aucune commande par train) ;

## Mobile

mobile et plein écran : `node tools/mobile.js [zeus hourra] [--shots=DIR] [--montage=f.jpg]` (iPhone 13 portrait 390x844, 360x640, paysage 844x390, tactile réel CDP : un doigt = déplacement, deux doigts = zoom, toucher barrière / numéro du synoptique, onglets, plein écran en repli CSS, rotation, `plan.html`)

- ids : `#bFs` (Plein écran / Quitter le plein écran, dans `#cams`), `#fsBar` (barre du plein écran : `#fsHud`, `#fsMsg`, `#bDesk` = tiroir du pupitre, Quitter), `#tabs` (`data-act=tab` : `carte`, `pupitre`, `journal`)
- classes de `body` : `dm` (téléphone / tablette étroite : pupitre et journal en tiroirs), `fs` (plein écran), `fsdesk` (tiroir ouvert en plein écran)
- `setFs()`, `setTab()`
- en plein écran `#side` est déplacé dans `#view` ;

## Sauvegarde

sauvegarde et bac à sable : `node tools/save.js [zeus hourra oziris]` (2 h de jeu, état identique après `pagehide` / retour, passage de 19:00 sans remise à zéro, bilan, fin de partie, ancienne sauvegarde à journées, alternance entre attractions, Nouvelle partie, bac à sable, stockage indisponible)

- `jeu.html?type=parc&lieu=asterix&el=<id>&mode=sandbox` (`G.sandbox` : ni budget, ni météo, ni pannes ; en-tête `#hMode`)
- les tests `check.js` repartent d'un état vide ;

## `check.js`

test rapide : `node tools/check.js <site>` (manœuvre de garage scriptée aux boutons de zone + 9 h de jeu avec portillons et sécurités pressés au bouton, scénario `res:` des sécurités, ligne `dep:` (règle de départ, appareil hors de P), `--build` pour le fichier unique, `--shots=DIR` captures du garage à pont droit ; sortie courte PASS/FAIL avec `offpath=<n>` (visiteurs hors des chemins, `tools/offpath.js`, échec si n>2), `strollQ=<n>` (promeneurs sur un chemin de file, échec si n>0), `overlapQ=<n>` (paires de visiteurs de file, travées et réserve à moins de `QPW`, visiteurs qui gagnent leur place sur le quai comptés contre ceux qui attendent, issue #44, échec si n>0 ; arrivants arrêtés relevés à part), `evacPlat=ok` (après chaque évacuation, travées et couloir d'attente vidés des évacués en 40 s de jeu, issue #21), `trainEvac: lockedStay emptied outByExit noIncome onPaths` (évacuation d'un train à quai : sécurités verrouillées, passagers assis ; ouvertes, ils descendent par la sortie, issue #26), `bars: blocked waitBefore entryShut otherWay forkShortest forkBlocked evacHeld evacNoAdvance evacResume` (issue #37, page à part : barrière fermée jamais franchie, attente devant, entrée fermée, autre trajet ouvert, plus court trajet sans trajet ouvert, évacué arrêté devant une barrière fermée et reparti à l'ouverture, personne n'avance pendant l'évacuation, `lineGo` : barrières de l'attraction fermées 200 s puis rouvertes, `overlapQ=<n>` : visiteurs de file, arrivants et évacués arrêtés devant une barrière fermée à moins de `QPW`, entrée fermée 200 s, échec si n>0, issue #40), `queue=auto(<fourches>)|manuel bars=<n> (<k> converties)`, capture `/tmp/t1/<site>.png`) ;

## Toits

toits : `#bRoof` et le zoom rapproché effacent les toits `SITE.fade` et tous les abris (auvents OSM `building=roof`, bâtiments au-dessus de la file ou des quais ; `engine/render.js`, `b.ab`)

- chemin couvert (escalier, allée) sous un **simple toit effaçable** (hors souterrain, hors gare à 1 m près des bouts, hors rocher, couvert seulement par des toits `SITE.fade` / abris : `COVD[i].rf`, issue #21, escalier de Zeus) : montré avec ses visiteurs dès que ce toit s'efface (zoom, `#bRoof`, « Masquer la gare »), les autres couloirs couverts seulement avec « Masquer la gare » ;

## Éditeur

éditeur ([`tools/editor-test.js`](https://github.com/qhess34/osmrides/blob/main/tools/editor-test.js), dépôt osmrides) : `node tools/editor-test.js [goudurix zeus] [--check]` (serveur, apparence `GAME.look`, souris (barrières, salle, sommets de la zone d'attente), diff, sauvegarde, relecture après redémarrage, application dans le jeu (visiteurs dans le polygone, évacuation) ; restaure les `game.js` du propriétaire) ;

- relever `pageerror` ; faire des captures (`cam.g={x,z,s}` puis `render(.05)` plusieurs fois) et **les regarder**.

Toute modification du moteur doit être revérifiée sur chaque attraction. Annoncer au propriétaire ce qui a été testé et ce qui ne l'a pas été (la souris réelle et le son ne sont pas testables ici).

## Son

Son (`engine/state.js` `sfx`, coupé par défaut, bouton `#bMute` « Son », allumé quand le son est activé) : synthèse Web Audio en couches (pas de fichiers : Wikimedia Commons est bloqué ici), spatialisé

- freins qui se desserrent (air) / se serrent (claquement), sécurités (air 0,5 s avant l'ouverture `RES_AIR`, crémaillère à la fermeture), lift (grondement, anti-retours selon `SITE.liftSound={antiRollback, gain, pitch}`, défaut sans anti-retours pour un bob)
- espion `sfx.N`, test `node tools/sound.js`.
