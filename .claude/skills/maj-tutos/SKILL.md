---
name: maj-tutos
description: Mettre à jour tutos.html et ses captures quand un libellé, un bouton, un message ou une manœuvre du jeu change. À utiliser après une modification de l'interface ou du comportement d'une attraction.
---
1. Chercher dans `tutos.html` les libellés cités (`grep -n` du texte du bouton ou du message) ; les vrais libellés sont dans `jeu.html`, `engine/ui.js`, `engine/sim.js` (dans `qhess34/osmrides`, à la version de `MOTEUR`) (`log(...)`, `refuse(...)`) et [`docs/manoeuvres.md`](https://github.com/qhess34/osmrides/blob/main/docs/manoeuvres.md).
2. Corriger le texte pour qu'il reflète le comportement réel ; rejouer la séquence concernée aux vrais boutons si elle a changé (portillons `#bGate`, départ `#bGo`, zones `#z<id>_<k|m|f|b|x>`, appareil `#y…`).
3. Régénérer les captures touchées (`captures-jeu`) et les regarder.
4. Nouvelle attraction : ajouter sa note dans l'article « Garer et sortir un train » (bouton Essayer vers `jeu.html?type=parc&lieu=asterix&el=<id>&mode=sandbox`) et, si elle a une boucle de file, dans « File d'attente ».
5. Vérifier : 0 erreur de page, pas de défilement horizontal à 360 px, ancres valides.
