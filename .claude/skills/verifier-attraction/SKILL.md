---
name: verifier-attraction
description: Lancer les tests du jeu OSMrides (check, mobile, save) sur une ou toutes les attractions et résumer en quelques lignes. À utiliser après toute modification d'une attraction ou du moteur.
---
Prérequis : `NODE_PATH=$(npm root -g)`. Lancer en arrière-plan (certains tests dépassent 2 min) et ne lire que les lignes PASS / FAIL / `offpath=` / `page errors=` (`… 2>&1 | tail -3`). Une attraction après l'autre, jamais en parallèle.

- Une attraction modifiée : `node tools/check.js <id>` puis `node tools/mobile.js <id>` puis `node tools/save.js <id>`.
- Moteur modifié : répéter pour zeus, hourra, oziris, goudurix (aussi `check.js <id> --build` si `tools/build.py` est concerné).
- Pages d'accueil / tutoriels modifiées : 0 erreur de page et pas de défilement horizontal à 360, 390 (iPhone 13) et 1280 ; liens et ancres valides ; test hors ligne HTTP (copie `_site` comme `.github/workflows/pages.yml`, `python3 tools/make_sw.py _site`, `python3 -m http.server`, Playwright hors ligne).
- En cas d'échec : relancer seul le test qui échoue, lire la ligne du journal en cause, ne jamais désactiver un test.

Pas de capture pour un changement de logique (tests seulement) ; pour un point visuel, une seule petite capture (≈ 600×450, JPEG ≈ 70), regardée une fois (règle du propriétaire, lot 6, skill `captures-jeu`). Ne pas affirmer ce qui n'est pas testable ici : souris réelle, son, appareil tactile réel, installation PWA.
