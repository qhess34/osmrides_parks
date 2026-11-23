---
name: compte-rendu-proprietaire
description: Rédiger le compte rendu court en français au propriétaire ou au chef de projet (fait, testé, non testé, estimé). À utiliser à la fin de toute tâche sur OSMrides.
---
Format, 10 lignes au plus, en français :
- Fait : fichiers et comportements changés, avec chemins (captures : `docs/plans/…`).
- Testé : commandes lancées et résultat (PASS / FAIL, `page errors`, `offpath`), tailles d'écran, hors ligne.
- Non testé : souris réelle, son, appareil tactile réel, installation PWA, tout ce qui n'a pas été rejoué.
- Estimé : hauteurs, longueurs de wagons, couleurs, position d'un pont transbordeur, vitesses ; dit comme estimé, jamais comme mesuré.
- Décisions ou questions pour le propriétaire.
Si un test échoue, le dire avec la sortie utile. Messages vers une autre session : `send_message` du serveur claude-code-remote avec l'identifiant de session de l'expéditeur.
