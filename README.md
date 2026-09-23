# Portfolio — Ago Ezoolim-Ela

Site personnel d’Ago Ezoolim-Ela, étudiante en Génie Logiciel & Systèmes d’Information à l’IAI-TOGO (Lomé, Togo).

🔗 En ligne : https://ezoolim-ela.github.io/Portfolio/

## Pages

| Page | Contenu |
|---|---|
| `index.html` | Accueil, à propos, compétences, parcours (frise interactive), projets, contact |
| `stea.html` | Étude de cas du projet phare **STEA** : le défi, la réponse technique, sécurité et qualité, résultats chiffrés, leçons |
| `en/index.html`, `en/stea.html` | Version anglaise des deux pages (sélecteur FR / EN dans l’en-tête, liens `hreflang`) |
| `404.html` | Page servie par GitHub Pages pour une adresse inexistante |
| `assets/CV_Ago_Ezoolim-Ela.pdf` · `..._EN.pdf` | CV d’une page, en français et en anglais, même palette que le site |

## Structure

```
index.html            Page d’accueil
stea.html             Étude de cas STEA
styles.css            Feuille de style unique (thème clair par défaut, mode sombre via [data-theme="dark"])
script.js             Thème, menu mobile, frise, compteurs, galerie d’écrans, formulaire
assets/               Photo, image de partage (og-image.jpg), CV, captures de STEA (assets/stea/*.webp)
cv/index.html         Source HTML du CV français (page A4)
cv/index-en.html      Source HTML du CV anglais
cv/generer-pdf.cmd    Regénère assets/CV_Ago_Ezoolim-Ela.pdf avec Edge en mode headless
cv/generer-pdf-en.cmd Idem pour la version anglaise
robots.txt, sitemap.xml
```

Aucune dépendance à installer : HTML, CSS et JavaScript natifs. Polices Google Fonts (Fraunces, Plus Jakarta Sans, JetBrains Mono) chargées sans bloquer le rendu ; les icônes sont un sprite SVG local (`assets/icons.svg`), sans appel à un CDN.

## Lancer en local

```bash
python -m http.server 8000
```

puis ouvrir http://localhost:8000. (Ouvrir `index.html` directement dans le navigateur fonctionne aussi.)

## Mettre à jour

- **Textes, projets, compétences** : modifier `index.html` (et `stea.html` pour l’étude de cas), puis reporter la modification dans `en/`. Les textes de l’interface pilotés par le script (libellés des boutons, légendes de la galerie, messages du formulaire) sont dans le dictionnaire `TEXTES` en tête de `script.js`, en français et en anglais ; la langue vient de l’attribut `lang` de `<html>`. Après une modification de `styles.css` ou `script.js`, incrémenter le paramètre `?v=` des balises `<link>` et `<script>` pour forcer le rafraîchissement du cache.
- **CV** : modifier `cv/index.html`, puis double-cliquer sur `cv/generer-pdf.cmd` (Edge requis, connexion internet pour les polices). Le PDF remplace `assets/CV_Ago_Ezoolim-Ela.pdf`.
- **Photo** : `assets/photo-ago-ezoolim-ela.jpg` (portrait). **Image de partage** : `assets/og-image.jpg` (1200 × 630), affichée quand le lien est partagé sur LinkedIn ou WhatsApp.
- **Captures de STEA** : `assets/stea/*.webp`, référencées dans `script.js` (galerie) et `stea.html`.
- **Témoignage du client** : un bloc `project-quote` est prêt, en commentaire, dans `index.html` et `stea.html`.
- **Formulaire de contact** : l’attribut `action` pointe vers Formspree. **L’identifiant actuel n’est pas actif** : créer le formulaire sur formspree.io, confirmer l’adresse par courriel, puis remplacer l’identifiant. En attendant, un échec d’envoi propose un courriel déjà rempli.

## Ce que le site fait bien

- Thème clair / sombre mémorisé, responsive de 360 px à 1440 px, navigation clavier, lien d’évitement, libellés ARIA, animations désactivées si l’utilisateur préfère réduire les mouvements.
- Référencement et partage : balises `description`, canonical, Open Graph, Twitter card, données structurées `Person`, `robots.txt` et `sitemap.xml`.
- Les chiffres affichés pour STEA (modules, rôles, endpoints, tests, versions) sont mesurés dans le code source et les releases du projet, pas estimés.

## Publication

Le site est publié avec GitHub Pages depuis la branche `main` (racine du dépôt). Chaque `git push` sur `main` met le site en ligne après une à deux minutes.

## Licence

Code du site : libre de réutilisation pour votre propre portfolio, avec mention de la source. Textes, photo et captures d’écran : tous droits réservés.
