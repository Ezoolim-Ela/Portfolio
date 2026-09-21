# Portfolio — Ago Ezoolim-Ela

Site personnel d’Ago Ezoolim-Ela, étudiante en Génie Logiciel & Systèmes d’Information à l’IAI-TOGO (Lomé, Togo).

🔗 En ligne : https://ezoolim-ela.github.io/Portfolio/

## Pages

| Page | Contenu |
|---|---|
| `index.html` | Accueil, à propos, compétences, parcours (frise interactive), projets, contact |
| `stea.html` | Étude de cas du projet phare **STEA** : le défi, la réponse technique, sécurité et qualité, résultats chiffrés, leçons |
| `assets/CV_Ago_Ezoolim-Ela.pdf` | CV d’une page, même palette et mêmes polices que le site |

## Structure

```
index.html            Page d’accueil
stea.html             Étude de cas STEA
styles.css            Feuille de style unique (thème clair par défaut, mode sombre via [data-theme="dark"])
script.js             Thème, menu mobile, frise, compteurs, galerie d’écrans, formulaire
assets/               Photo, image de partage (og-image.jpg), CV, captures de STEA (assets/stea/*.webp)
cv/index.html         Source HTML du CV (page A4)
cv/generer-pdf.cmd    Regénère assets/CV_Ago_Ezoolim-Ela.pdf avec Edge en mode headless
robots.txt, sitemap.xml
```

Aucune dépendance à installer : HTML, CSS et JavaScript natifs. Polices Google Fonts (Fraunces, Plus Jakarta Sans, JetBrains Mono) et icônes Font Awesome chargées depuis un CDN.

## Lancer en local

```bash
python -m http.server 8000
```

puis ouvrir http://localhost:8000. (Ouvrir `index.html` directement dans le navigateur fonctionne aussi.)

## Mettre à jour

- **Textes, projets, compétences** : modifier `index.html` (et `stea.html` pour l’étude de cas). Après une modification de `styles.css` ou `script.js`, incrémenter le paramètre `?v=` des balises `<link>` et `<script>` pour forcer le rafraîchissement du cache.
- **CV** : modifier `cv/index.html`, puis double-cliquer sur `cv/generer-pdf.cmd` (Edge requis, connexion internet pour les polices). Le PDF remplace `assets/CV_Ago_Ezoolim-Ela.pdf`.
- **Photo** : `assets/photo-ago-ezoolim-ela.jpg` (portrait). **Image de partage** : `assets/og-image.jpg` (1200 × 630), affichée quand le lien est partagé sur LinkedIn ou WhatsApp.
- **Captures de STEA** : `assets/stea/*.webp`, référencées dans `script.js` (galerie) et `stea.html`.
- **Témoignage du client** : un bloc `project-quote` est prêt, en commentaire, dans `index.html` et `stea.html`.
- **Formulaire de contact** : l’attribut `action` du formulaire pointe vers Formspree ; le remplacer si le compte change.

## Ce que le site fait bien

- Thème clair / sombre mémorisé, responsive de 360 px à 1440 px, navigation clavier, lien d’évitement, libellés ARIA, animations désactivées si l’utilisateur préfère réduire les mouvements.
- Référencement et partage : balises `description`, canonical, Open Graph, Twitter card, données structurées `Person`, `robots.txt` et `sitemap.xml`.
- Les chiffres affichés pour STEA (modules, rôles, endpoints, tests, versions) sont mesurés dans le code source et les releases du projet, pas estimés.

## Publication

Le site est publié avec GitHub Pages depuis la branche `main` (racine du dépôt). Chaque `git push` sur `main` met le site en ligne après une à deux minutes.

## Licence

Code du site : libre de réutilisation pour votre propre portfolio, avec mention de la source. Textes, photo et captures d’écran : tous droits réservés.
