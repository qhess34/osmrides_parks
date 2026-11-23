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
- Issues : #1, #2 (éditeur Docker), #3, #4 à valider par le propriétaire.
