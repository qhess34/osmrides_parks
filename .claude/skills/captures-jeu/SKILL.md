---
name: captures-jeu
description: Produire des captures du jeu OSMrides (vignettes d'attractions, captures de tutoriels, plans) avec Playwright. À utiliser pour illustrer un changement ou régénérer des images.
---
- **Règle du propriétaire (lot 6)** : aucune capture pour un changement de logique ; une seule petite capture (≈ 600×450, échelle 1, JPEG ≈ 70) par point visuel modifié, regardée une fois, jamais refaite sauf correction de ce point ; un seul montage final `docs/plans/lot-<n>.jpg` (< 200 Ko) ; pas d'avant / après sauf bug signalé en image ; vignettes et tutos seulement à la fin d'une grande étape ou sur demande.
- Vignettes de l'écran de choix : `NODE_PATH=$(npm root -g) node tools/thumbs.js` (630x360, `img/accueil/<id>.jpg` ; ajouter l'id d'une nouvelle attraction à la liste du script).
- Captures des tutoriels : `node tools/captures.js` (`img/tutos/*.jpg`, dsf 1, JPEG sous 120 Ko).
- Captures libres : ouvrir `file:///…/jeu.html?type=parc&lieu=asterix&el=<id>`, l'aide n'est plus ouverte au lancement (si un script l'a ouverte : `[data-act=closeHelp]`), `act('speed',0)`, boucler `step(.05)`, `G.wx.next=1e6` ; caméra : `setCam('<nom>')` (noms dans `SITE.cams`) ou `cam.g={x,z,s}` puis `render(.05)` ~40 fois ; `G.roofOff=true` pour voir sous les toits ; synoptique masqué par `localStorage t2z.syn='0'`.
- Mobile : `devices['iPhone 13']`, 390x844 ou 360x640, dsf 1.
- Regarder chaque image ; vérifier la taille (< 120 Ko pour les tutos), et que rien d'estimé n'est présenté comme mesuré.
