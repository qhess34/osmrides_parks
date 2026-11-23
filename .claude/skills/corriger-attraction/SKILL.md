---
name: corriger-attraction
description: Corriger ou ajuster une attraction existante de OSMrides d'après une remarque du propriétaire (profil, file, garage, couleurs, zones). À utiliser pour toute correction sur zeus, hourra, oziris, goudurix.
---
1. Relire la remarque mot pour mot ; la noter comme décision du propriétaire dans `docs/<id>-notes.md` (questions ouvertes comprises).
2. Lire [`docs/ROADMAP.md`](https://github.com/qhess34/osmrides/blob/main/docs/ROADMAP.md), la fiche utile : `docs/ref/site.md` ici, ou une fiche du moteur ([`voie.md`, `file.md`, `quai.md`, `garage.md`, `decor.md`](https://github.com/qhess34/osmrides/tree/main/docs/ref)) puis seulement le fichier concerné : `lieux/parc/asterix/<id>.js` d'abord (réglages `SITE`), `tools/specs/<id>.json` pour le profil ou le tracé. Ne jamais éditer `lieux/parc/asterix/<id>.data.js` : le régénérer avec `tools/make_site.py`.
3. Le moteur n'est pas dans ce dépôt (chargé par version, [`docs/versions.md`](https://github.com/qhess34/osmrides/blob/main/docs/versions.md) d'osmrides) : une correction générique = issue `inter-equipe` dans `qhess34/osmrides` ; sinon rester dans `SITE`. Commande par zones, jamais par train ; vocabulaire : lapbars, portillons, pupitre, frein final, canton, aiguillage, pont transbordeur.
4. Vérifier avec `verifier-attraction` et regarder une capture avant/après (`captures-jeu`).
5. Mettre à jour la note de l'attraction, le journal `docs/journal/<mois>.md` (ajout en fin de fichier, sans relire) et [`docs/JOURNAL.md`](https://github.com/qhess34/osmrides/blob/main/docs/JOURNAL.md) ; mettre à jour `tutos.html` si un libellé ou une manœuvre a changé (`maj-tutos`).
6. Commit en anglais à l'impératif. Rendre compte avec `compte-rendu-proprietaire`.
