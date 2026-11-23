---
name: nouvelle-attraction
description: Ajouter une nouvelle attraction au jeu OSMrides (données OSM, SITE, écran de choix, tutoriels, docs). À utiliser dès que le propriétaire demande une nouvelle attraction.
---
Règles complètes : `docs/NOUVELLE-ATTRACTION.md` (à lire, ne pas réécrire) ; détail technique : fiches `docs/ref/` (`site.md` pour `SITE`). Ne jamais lire `lieux/parc/asterix/*.data.js` ni `lieux/parc/asterix/plan.data.js` en entier.

1. Lire `docs/ROADMAP.md`, puis la note de l'attraction la plus proche (`docs/*-notes.md`) ; créer `docs/<id>-notes.md` (caractéristiques, sources, ce qui est estimé).
2. Extrait OSM (`api.openstreetmap.org`, bbox du parc), `tools/specs/<id>.json`, puis `python3 tools/make_site.py extrait.osm tools/specs/<id>.json lieux/parc/asterix/<id>.data.js apercu.png` ; croisements ≥ 3,2 m, vitesse plausible.
3. `lieux/parc/asterix/<id>.js` en partant de `lieux/parc/asterix/zeus.js` ; garage : règles de `docs/manoeuvres.md`. Moteur modifié seulement si nécessaire, de façon générique, puis revérifier toutes les attractions.
4. Branchement : carte `a.card[data-el]` dans l'écran de choix de `index.html`, vignette (`tools/thumbs.js`, ajouter l'id), `site` dans `lieux/parc/asterix/plan.data.js` via `tools/make_park.py`, note dans l'article « Garer et sortir un train » de `tutos.html`, ligne du README, tâche du ROADMAP, journal `docs/journal/<mois>.md` (ajout en fin de fichier, sans relire).
5. Vérifier avec le skill `verifier-attraction`, regarder les captures, puis rendre compte avec `compte-rendu-proprietaire` (tout ce qui est estimé doit être dit, jamais présenté comme mesuré).
