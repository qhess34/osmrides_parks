# Pilotage — osmrides_parks (Chef parcs, modèle Sonnet)

## Démarrage d'une session

Consigne à donner à la session : « Tu es le Chef parcs d'OSMrides pour le dépôt osmrides_parks. Lis `AGENTS.md`, `docs/PILOTAGE.md` (dont « État courant ») et les issues ouvertes du dépôt, dont celles étiquetées `inter-equipe`. Reprends le travail, présente-toi en 3 lignes au propriétaire, puis attends ses demandes en français. »

## Communication avec les autres chefs

- Besoin d'un autre dépôt : ouvrir une issue **dans ce dépôt-là**, étiquette `inter-equipe` (besoin, critère de fin, lien vers l'issue d'origine).
- Nouvelle fonctionnalité publiée : issue `inter-equipe` dans `qhess34/osmrides_website` (titre, 3 lignes, lien, une capture si visuelle).
- Message de session seulement pour signaler qu'une issue attend (une ligne avec son numéro).

## Renouvellement

Après 3 ou 4 demandes ou une grande étape : mettre à jour « État courant », commiter, et demander au propriétaire d'ouvrir une nouvelle session avec la consigne de démarrage.

## État courant

_23/11/2026 après-midi, Chef parcs, session n° 1._

- Parc Astérix déplacé depuis `osmrides` (commit 11d4e28) : `lieux/parc/asterix/` (game.js du propriétaire identiques), `jeu.html`, `index.html`, `plan.html`, `tutos.html`, images, tests, skills, workflow Pages. Moteur chargé par version : `const MOTEUR='0.0.1';` dans `jeu.html` (jsDelivr) ; éditeur par `compose.yaml` (`docker compose up -d`, http://127.0.0.1:8787/).
- Tests 23/11 : `check.js` PASS sur zeus, hourra, oziris, goudurix (moteur chargé en ligne) ; `save.js`, `mobile.js` PASS. Non testés : éditeur Docker, hors ligne en https, `thumbs.js`/`captures.js`/`sound.js`.
- Réseau de l'environnement cloud « Default » : `cdn.jsdelivr.net` autorisé (choix du propriétaire) ; les tests passent par le moteur en ligne.
- `apropos.html` non copié (ira dans `osmrides_website`) : liens remplacés provisoirement par le dépôt `osmrides`.
- #3 (Chef moteur) : docs de jeu reprises d'osmrides (NOUVELLE-ATTRACTION, notes, ref/site et tests, plans, sources, guides OSM, build.py, make_icons.js) ; fiches du moteur en liens vers osmrides. Tests avec un moteur local : `MOTEUR=../osmrides/engine/ node tools/check.js zeus` (clone voisin d'osmrides).
- #4 (Webmestre) : lien « À propos » → https://qhess34.github.io/osmrides_website/apropos.html.
- Le jeu couvre les parcs d'attractions en général (propriétaire) : Parc Astérix = premier lieu, d'autres suivront.
- Audit `docs/reste-osm-editeur.md` (23/11). Décisions du propriétaire : couleurs de voie dans GAME seulement (pas OSM) ; `surface` des files éditeur + OSM ; hauteurs dans l'éditeur, envoi OSM facultatif ; salles de contrôle dans l'éditeur seulement ; ponts transbordeurs réglés dans l'éditeur (voie mobile, positions, aimantation) ; `holdBack`, `dropAfter`, `loadSide` à déduire automatiquement ; freins réglables par zone ; objectifs et durées de tour estimés par défaut, remplaçables ; horaires par parc ; Hourra 5 trains max. Demande au moteur : qhess34/osmrides#53 (après 0.1.0 ; 0.1.1 = exploitation + salles de contrôle).
- Fait 23/11 : chemins recopiés lus dans OSM (promenade Zeus, pont Goudurix, promenade OzIris) ; (déplacement de `kind`, `car`, `trains`, `track`, `trough`, `phys` vers `GAME.site` ANNULÉ : l'éditeur 0.0.1 lit ces valeurs d'origine dans `SITE` et plantait — sections vides ; règle : `SITE` garde la valeur d'origine, `GAME.site` n'est écrit que par une modification dans l'éditeur) ; Zeus réimporté en entier (2 tunnels OSM, le 2e = 28 m au lieu de 50 estimés) ; quais Goudurix limités au toit OSM 148159470 (3,9 / 3 m).
- À voir : OzIris non réimporté — le nouvel import perdait la zone piétonne relation 8427077, qui existe toujours dans OSM (sans doute membres coupés par la bbox de l'extrait) ; `exit.path` de Zeus et `tails` du Hourra encore en partie à la main.
- 24/11 : jeu passé au moteur 0.2.0 (étiquette posée par le propriétaire) ; check.js PASS ×4, save, mobile PASS. Ne pas copier `engine/montagnes-russes/` avant les réglages de qhess34/osmrides#53 (consigne du Chef moteur).
- Arbitrages de la création « OSM + éditeur seulement » : #5 (tranchés) ; feuille de route #6 ; demande moteur qhess34/osmrides#54. Relations OSM `type=site` posées par le propriétaire : Zeus 6267961, Goudurix 22231193, OzIris 22231216, Hourra 22231220.
- 24/11 : moteur 0.5.0 adopté (contient 0.3.0, 0.4.0 ; #7) : `lieu.js` (horaires par parc, ESTIMÉS), filtre des tests `/(\.game|\/lieu)\.js$/`, `loadSide` retiré de SITE (déduit). `dropAfter` / `holdBack` gardés (propriétaire : serviront à fixer `ele` / `GAME.profile`). Salles de contrôle : à poser par le propriétaire dans l'éditeur, puis retirer `booth`, `boothLabel`, `beacon`.
- Session du Chef moteur (24/11) : session_01UxooiSZ8h5uvMWwB1rESda ; canal principal = issues `inter-equipe`.
- Issues ouvertes : #5, #6.
