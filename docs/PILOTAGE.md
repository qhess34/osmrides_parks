# Pilotage — osmrides_parks

**Depuis le 27/11/2026 (décision du propriétaire), ce dépôt est piloté par le Chef moteur** (session de `qhess34/osmrides`), qui adopte lui-même chaque version du moteur ici. Il n'y a plus de session Chef parcs ni d'issue de passage entre moteur et parcs. Le Chef stations (`osmrides_skiresort`) reste séparé : second utilisateur du moteur, il garantit sa généricité.

## Règles de la fusion

- Deux dépôts séparés. Le propriétaire pose les étiquettes de version ; `jeu.html` (`const MOTEUR`) ne pointe que sur une étiquette posée.
- Généricité : aucun nom d'attraction ni de parc dans le noyau du moteur. Ce qui est propre aux montagnes russes reste dans `engine/montagnes-russes/`, appelé à venir ici (qhess34/osmrides#51). Chaque note de version dit ce qui est générique et ce qui est propre aux parcs.
- Adoption d'une version : dans la même série de travail que la version, mêmes règles de test (`AGENTS.md`, section Tests, issue #12) ; plus de copie adaptée de `check.js` côté moteur, on modifie directement celui de ce dépôt.
- `SITE` garde la valeur d'origine lue par l'éditeur (« Origine ») ; `GAME` (`*.game.js`) n'est écrit que par l'éditeur ou par le propriétaire.
- Réimport OSM : `*.data.js` toujours régénéré en entier par `tools/make_site.py` (extrait du parc : bbox `2.560,49.127,2.582,49.142`), jamais édité à la main ; données qui cassent un test → branche à part, pas `main`.

## État courant

_27/11/2026, adoption du moteur 0.12.0 sur la branche `adopt-0.12.0` (pas encore sur `main`)._

**Sur `main`** : moteur **0.11.0**. **Sur `adopt-0.12.0`** : `const MOTEUR='0.12.0'` (étiquette sur le commit 1447c04 d'osmrides), réimport d'OzIris refait avec l'outil JS (`tools/import-osm.js` d'osmrides : tags de toit, niveaux), `stationRoofCol` retiré de `SITE` d'OzIris (toit gris lu dans OSM). Déjà retirés avant : `fade` de la halle, tunnel à toit d'OzIris, libellés « Frein final » de Hourra. Tests avec le moteur de l'étiquette : `check`, `save`, `mobile` PASS sur OzIris et Hourra ; Zeus : `check` PASS ou échec aléatoire sur les évacuations (qhess34/osmrides#73) ; Goudurix : `jumpQ=1` (données de `main`, zone d'attente à ajuster dans l'éditeur).

**Reste à faire**
- Fusionner `adopt-0.12.0` dans `main` (quand le propriétaire confirme l'étiquette 0.12.0).
- **#17 (ouverte)** — réimport OSM du 27/11 : Zeus, OzIris, Hourra faits ; **Goudurix** sur la branche `goudurix-osm-2711` (gare décalée de 3,2 m ; zone d'attente à ajuster dans l'éditeur ; lecture de la gare et des quais dans OSM : qhess34/osmrides#68).
- **#14 (ouverte)** — rails mobiles en groupes (0.12.0) : quand le propriétaire aura enregistré les positions dans l'éditeur, retirer de `SITE` `retract.d` (Hourra), `post` (Hourra, OzIris) et `laneGap` (OzIris). Garder les `d` des voies et le `laneGap` du Hourra.
- **#6 (ouverte)** — feuille de route « attraction créée depuis OSM et l'éditeur seulement ».
- **Salles de contrôle** : éditeur seulement (`booth`, `boothLabel`, `beacon` encore dans `SITE` d'OzIris, à retirer quand elle aura la sienne).
- **Gardé dans `SITE`** : `dropAfter`, pour fixer le profil des hauteurs (`GAME.profile`).
- Toits de la dalle des voies de garage, heurtoirs, carter du rotatif : encore dessinés par le moteur (qhess34/osmrides#68).

**Décisions du propriétaire à garder en tête**
- Le maximum de réglages en WYSIWYG.
- Pas de frein final ni de frein avant gare à part.
- Maintenance automatique au garage, avec une durée réglable : c'est le seul moyen de remettre l'usure à zéro.
- Horaires par parc (`lieu.js`, ESTIMÉS 10:00–19:00).
- Décors en fichiers image (PNG / SVG, posés dans l'éditeur) ; la statue de Zeus sera à convertir en SVG.
- Doc globale à la place des tutos par attraction. Captures périmées à refaire avec elle : `img/tutos/05b-zones-pupitre.jpg`, `06-lift.jpg`, probablement `01-pupitre.jpg` et `12-mobile-pupitre.jpg`.
- Quais : par défaut, l'emprise du bâtiment de la gare ; une zone `railway=platform` dans OSM prend le dessus.

**Points de vigilance**
- GitHub Pages : workflow en deux jobs (build / deploy, depuis le 26/11).
- `check.js zeus` : la voie de garage de Zeus est pleine au départ, donc le refus « voie pleine » est attendu (#13).
- Session de pilotage du Chef stations : `session_01UxooiUusvP87dcc2KzmDKS`. Webmestre : `session_01UxooiRtfABKro1gsAbyXj2`.
