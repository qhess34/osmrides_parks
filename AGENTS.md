# AGENTS.md — osmrides_parks

Dépôt de les parcs d'attractions d'OSMrides (Parc Astérix d'abord : Zeus, Trace du Hourra, OzIris, Goudurix) : données OSM des attractions, `SITE`, réglages `game.js`, pages de jeu et tutos des parcs.
Fait partie d'OSMrides (simulations d'exploitation sur données OpenStreetMap, jeu de fan non officiel, interface en français). Organisation des quatre dépôts et règles communes : [`docs/ORGANISATION.md`](https://github.com/qhess34/osmrides/blob/main/docs/ORGANISATION.md) du dépôt `qhess34/osmrides` (à lire une fois).

## Responsable : Chef parcs

Session longue lancée par le propriétaire ; mémoire et reprise : `docs/PILOTAGE.md`. Le chef code peu : il lit les issues, découpe, délègue à un sous-agent (`.claude/agents/`), vérifie, publie sur `main`, rend compte au propriétaire en français court (fait, testé, non testé, estimé).

## Règles du propriétaire

- Réalisme : rendu crédible, couleurs sourdes, aucun pictogramme ni emoji, rien d'enfantin.
- OSM est la référence ; tout ce qui est estimé est signalé dans le code et dit au propriétaire.
- Code lisible, KISS ; aucune dépendance, tout marche en ouvrant le fichier (`file://`), sans `fetch` ni modules ES.
- Le moteur est **chargé par version** (`const MOTEUR` dans `jeu.html`, mode d'emploi : [`docs/versions.md`](https://github.com/qhess34/osmrides/blob/main/docs/versions.md) d'`osmrides`) : jamais de moteur codé ici ; un besoin = issue `inter-equipe` dans `qhess34/osmrides`.
- Git : branche `main`, commits directs, messages en anglais à l'impératif.

## Tests

`tools/check.js <el>` sur chaque attraction (une après l'autre), `tools/save.js`, `tools/mobile.js` ; relever les erreurs de page.
Moteur local : `MOTEUR=../osmrides/engine/ NODE_PATH=$(npm root -g) node tools/check.js <el>` (variable lue par `check`, `save`, `mobile`, `sound`, `captures`, `thumbs`, `yard-zone` : ajoute `&moteur=…` à l'URL) ; sans variable, moteur chargé par version. Captures seulement pour un point visuel (une petite, ≈ 600×450, JPEG ≈ 70, regardée une fois).

## Économie de tokens

- Lire : ce fichier, `docs/PILOTAGE.md`, les issues ouvertes. Le reste par l'`explorateur` (Haiku).
- Un sous-agent par tâche, consigne autonome (réponses du propriétaire recopiées), rapport ≤ 8 lignes. Modèle : Haiku (recherche, tests), Sonnet (travail courant), Opus seulement sur demande du propriétaire.
- Ne jamais lire en entier un fichier de données généré (`*.data.js`).

## Fichiers

| Fichier | Rôle |
|---|---|
| `jeu.html` | page de jeu (version du moteur : `MOTEUR`) |
| `index.html`, `plan.html`, `tutos.html` | choix des attractions, plan du parc, tutoriels |
| `lieux/` | `index.js` et `parc/asterix/` : données OSM, `SITE`, `*.game.js` |
| `tools/` | tests (`check`, `save`, `mobile`), captures, génération des données |
| `sw.js`, `manifest.webmanifest`, `icons/`, `img/`, `site.css` | hors ligne, installation, images, style |
| `compose.yaml` | éditeur (Docker) |
| `.github/workflows/` | publication GitHub Pages |
