/* ==========================================================
   « Le mur »
   Trois colonnes de projets côte à côte, une sur deux à contresens : celle
   de gauche monte, celle du milieu descend, celle de droite monte. Rien ne
   s'arrête, sauf sous la souris — le temps de viser. Un clic ouvre le
   projet en grand : le contexte, ce qu'il fait, sa fiche, ses liens.

   La page ne déclare qu'un rang (data-axe="y", data-sens="haut") et les
   quatre projets ; le mur est bâti ici : la piste de la page devient la
   colonne de gauche, les deux autres sont des copies rangées dans un autre
   ordre, et chacune part un tiers de série plus loin que sa voisine — on
   ne voit jamais trois fois la même carte alignées. Chaque colonne est
   répétée autant de fois qu'il faut pour rester pleine : quand une série
   est sortie, la suivante a pris exactement sa place, et le compteur repart
   de zéro sans que l'œil voie la couture.

   Le moteur, lui, ne connaît que des pistes, un axe et un sens, lus sur le
   parent de chaque piste : un rang horizontal (data-sens="gauche" ou
   "droite") reste possible sans y toucher.

   Le mouvement est calculé ici, image par image, plutôt qu'en animation
   CSS : il faut pouvoir le ralentir en douceur au survol, l'accélérer quand
   on fait défiler la page, et amener une carte à l'écran quand le clavier
   la vise — trois choses qu'une animation CSS ne sait pas faire.
   ========================================================== */
(function () {
  var track = document.querySelector('[data-ruche]');
  if (!track) return;

  var projets = Array.prototype.slice.call(track.querySelectorAll('.rh-piste[data-piste="a"] > .rh-projet'));
  var puces = Array.prototype.slice.call(track.querySelectorAll('.rh-puce'));
  var zone = track.querySelector('.rh-rangs');
  var pisteA = track.querySelector('[data-piste="a"]');
  var N = projets.length;
  if (!N || !zone || !pisteA) return;

  var mqReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  track.setAttribute('data-mode', 'defile');

  /* ----------------------------------------------------------
     Les copies
     Une copie n'est qu'une image : elle ne porte pas le détail du projet
     (seul l'original sert à remplir le grand format), elle est cachée aux
     lecteurs d'écran et le clavier la traverse sans s'y arrêter. Elle reste
     cliquable à la souris et au doigt, et ouvre le même projet.
     ---------------------------------------------------------- */
  function copie(art) {
    var c = art.cloneNode(true);
    c.classList.add('est-copie');
    c.setAttribute('aria-hidden', 'true');
    var plus = c.querySelector('.rh-plus');
    if (plus) plus.parentNode.removeChild(plus);
    Array.prototype.forEach.call(c.querySelectorAll('a, button, [tabindex]'), function (el) {
      el.setAttribute('tabindex', '-1');
    });
    return c;
  }

  /* ----------------------------------------------------------
     Le mur
     La piste de la page — les quatre originaux — devient la colonne de
     gauche ; les deux autres sont bâties ici, avec des copies rangées dans
     un autre ordre. Chaque colonne porte son axe et son sens : une sur deux
     va à contresens de ce que la page demande. La feuille de style en
     efface une sur une tablette, deux sur un téléphone ; une colonne
     masquée ne mesure rien et s'arrête d'elle-même.
     Si l'on préfère moins de mouvement, on ne bâtit rien : les quatre
     projets restent posés en grille, là où la page les met.
     ---------------------------------------------------------- */
  /* Chaque colonne reprend le quatuor décalé d'un cran, et part une carte et
     demie plus loin que sa voisine. Les deux colonnes qui montent gardent le
     même écart pour toujours : c'est ce couple d'ordres et ces départs qui
     font qu'un projet ne se retrouve jamais en face de lui-même. */
  var ORDRE_COL = [[1, 2, 3, 0], [3, 0, 1, 2]];
  var DEPART = [0, 1.5, 2.5];                     /* en cartes */
  var enMouvement = !mqReduit.matches;
  var rang = zone.querySelector('.rh-rang');
  var pistes = [pisteA];

  if (enMouvement && rang && rang.getAttribute('data-axe') === 'y') {
    var sensPage = rang.getAttribute('data-sens') === 'bas' ? 'bas' : 'haut';
    var contresens = sensPage === 'haut' ? 'bas' : 'haut';
    var enColonne = function (piste, k) {
      var col = document.createElement('div');
      col.className = 'rh-col rh-col--' + (k + 1);
      col.setAttribute('data-axe', 'y');
      col.setAttribute('data-sens', k % 2 ? contresens : sensPage);
      col.appendChild(piste);
      rang.appendChild(col);
    };
    enColonne(pisteA, 0);
    ORDRE_COL.forEach(function (ordre, k) {
      var piste = document.createElement('div');
      piste.className = 'rh-piste';
      piste.setAttribute('data-piste', String.fromCharCode(98 + k));   /* b, puis c */
      ordre.forEach(function (i) { if (projets[i]) piste.appendChild(copie(projets[i])); });
      enColonne(piste, k + 1);
      pistes.push(piste);
    });
  }

  /* deux séries pour commencer ; completer en ajoutera si une ne suffit pas */
  if (enMouvement) {
    pistes.forEach(function (piste) {
      Array.prototype.slice.call(piste.children).forEach(function (n) { piste.appendChild(copie(n)); });
    });
  }

  /* ----------------------------------------------------------
     Le mouvement
     x reste toujours entre -L et 0, L étant la largeur d'une série : c'est
     ce repli qui rend la boucle invisible.
     ---------------------------------------------------------- */
  var VITESSE = 34;              /* px par seconde, au repos */
  var rangs = pistes.map(function (piste, k) {
    /* une série = les cartes d'origine de la piste ; les copies de la boucle viennent après.
       La fenêtre (la colonne, ou le rang s'il n'y en a pas) porte l'axe et le sens. */
    var fenetre = piste.parentNode;
    var vers = fenetre.getAttribute('data-sens');
    var axe = fenetre.getAttribute('data-axe') === 'y' ? 'y' : 'x';
    var sens = (vers === 'droite' || vers === 'bas') ? 1 : (vers === 'gauche' || vers === 'haut') ? -1 : (axe === 'y' || k === 0 ? -1 : 1);
    return { el: piste, axe: axe, sens: sens, x: 0, L: 0, n: piste.children.length / (enMouvement ? 2 : 1), series: enMouvement ? 2 : 1 };
  });

  function replier(r) {
    if (!r.L) return;
    while (r.x <= -r.L) r.x += r.L;
    while (r.x > 0) r.x -= r.L;
  }
  function poser(r) {
    var v = r.x.toFixed(2) + 'px';
    r.el.style.transform = r.axe === 'y' ? 'translate3d(0, ' + v + ', 0)' : 'translate3d(' + v + ', 0, 0)';
  }
  /* l'écart entre deux cartes le long de l'axe du rang (offsetLeft / offsetTop : sans les transformations) */
  function ecart(r, a, b) {
    return r.axe === 'y' ? r.el.children[b].offsetTop - r.el.children[a].offsetTop : r.el.children[b].offsetLeft - r.el.children[a].offsetLeft;
  }

  /* Assez de séries pour que le rang soit toujours plein : la piste recule
     d'une série entière avant de se replier, il faut donc qu'une série de
     plus que la largeur du rang reste derrière elle. Avec deux séries
     seulement, une série plus étroite que l'écran laissait un vide au bout
     du rang, un moment à chaque tour. */
  function completer(r) {
    if (!enMouvement || !r.n) return;
    var vue = r.axe === 'y' ? r.el.parentNode.clientHeight : r.el.parentNode.clientWidth;
    var serie = ecart(r, 0, r.n);
    while (serie > 0 && r.series * serie < serie + vue + 2 && r.series < 12) {
      for (var i = 0; i < r.n; i++) r.el.appendChild(copie(r.el.children[i]));
      r.series++;
    }
  }

  function mesurer() {
    rangs.forEach(function (r, k) {
      var ancienL = r.L;
      if (r.axe === 'y') {
        /* la hauteur d'une carte, gouttière comprise : la fenêtre en montre
           une et un sixième (--rangee, lue par la feuille de style). Une
           colonne masquée ne mesure rien : on garde alors l'ancienne valeur,
           sans quoi le mur se refermerait sur zéro. */
        var enfants = r.el.children, k2 = 1;
        while (k2 < enfants.length && enfants[k2].offsetTop === enfants[0].offsetTop) k2++;
        var rangee = k2 < enfants.length ? ecart(r, 0, k2) : enfants[0].offsetHeight;
        if (rangee > 0) (r.el.closest && r.el.closest('.rh-rang') || r.el.parentNode).style.setProperty('--rangee', rangee + 'px');
      }
      completer(r);
      /* la période exacte : l'écart entre une carte et sa copie de la série suivante */
      r.L = enMouvement && r.series > 1 ? ecart(r, 0, r.n) : 0;
      /* le départ de la colonne : une carte et demie de plus que sa voisine
         (DEPART, en cartes ; r.L / r.n est la hauteur d'une carte) */
      if (!ancienL && r.L) r.x = -r.L * (DEPART[k] || 0) / r.n;
      replier(r);
      poser(r);
    });
  }

  var allure = 1;          /* 1 = vitesse normale, 0 = arrêt ; suivie en douceur */
  var carteVisee = null;   /* la carte cliquée : le grand format part d'elle */
  var retenu = false;      /* la souris ou le clavier est sur un rang */
  var elan = 0;            /* poussée donnée par le défilement de la page */
  var dernierY = window.scrollY;
  var anime = false, tPrec = 0;

  function image(t) {
    if (!anime) return;
    var dt = tPrec ? Math.min(0.05, (t - tPrec) / 1000) : 0;
    tPrec = t;

    var cible = (retenu || document.body.classList.contains('rh-ouverte')) ? 0 : 1;
    allure += (cible - allure) * Math.min(1, dt * 7);
    /* l'arrêt est net une fois le freinage fini : sans ce seuil, l'allure
       tendait vers zéro sans l'atteindre et le ruban dérivait encore */
    if (cible === 0 && allure < 0.01) allure = 0;
    elan *= Math.pow(0.04, dt);           /* la poussée s'éteint en moins d'une seconde */

    /* l'élan du défilement est soumis à l'allure lui aussi : un ruban qu'on
       retient ne doit pas repartir parce que la page a bougé */
    var avance = (VITESSE + Math.abs(elan)) * allure * dt;
    rangs.forEach(function (r) {
      /* à l'arrêt, pas de repli : une carte amenée au clavier doit rester
         où on l'a mise, pas céder sa place à sa copie */
      if (!r.L || !avance) return;
      r.x += r.sens * avance;
      replier(r);
      poser(r);
    });
    requestAnimationFrame(image);
  }
  function demarrer() {
    if (anime || !enMouvement) return;
    anime = true; tPrec = 0;
    requestAnimationFrame(image);
  }
  function arreter() { anime = false; }

  /* faire défiler la page donne un coup d'élan aux deux rangs */
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    /* un saut d'un écran ou plus (menu, transition) n'est pas un geste : pas d'élan */
    if (Math.abs(y - dernierY) < window.innerHeight) elan = Math.max(-900, Math.min(900, elan + (y - dernierY) * 6));
    dernierY = y;
  }, { passive: true });

  /* ----------------------------------------------------------
     Viser une carte
     La souris sur un rang : les deux ralentissent jusqu'à l'arrêt. Au
     clavier, la carte qui prend le focus est amenée dans l'écran — elle
     pourrait sinon être hors champ, à l'autre bout du ruban.
     ---------------------------------------------------------- */
  zone.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') retenu = true; });
  zone.addEventListener('pointerleave', function () { retenu = false; });
  zone.addEventListener('focusin', function (e) {
    /* Seul le focus clavier retient le ruban. Après un clic, le grand format
       rend le focus à la carte : pour qui tient une souris, le mouvement ne
       doit pas rester figé pour autant. */
    var auClavier = true;
    try { auClavier = e.target.matches(':focus-visible'); } catch (err) { /* moteur ancien */ }
    if (!auClavier) return;
    retenu = true;
    var carte = e.target.closest ? e.target.closest('.rh-projet') : null;
    if (!carte) return;
    var r = null;
    for (var j = 0; j < rangs.length && !r; j++) if (rangs[j].el.contains(carte)) r = rangs[j];
    if (!r || !r.L) return;
    var vue = r.el.parentNode.getBoundingClientRect();
    var b = carte.getBoundingClientRect();
    var debut = r.axe === 'y' ? 'top' : 'left', fin = r.axe === 'y' ? 'bottom' : 'right';
    var marge = Math.min(80, (r.axe === 'y' ? vue.height : vue.width) * 0.08);
    var dec = 0;
    if (b[debut] < vue[debut] + marge) dec = (vue[debut] + marge) - b[debut];
    else if (b[fin] > vue[fin] - marge) dec = (vue[fin] - marge) - b[fin];
    /* Pas de repli ici : il renverrait la carte d'une série plus loin, et c'est
       sa copie — inaccessible au clavier — qui prendrait sa place à l'écran.
       Le ruban est retenu tant que le focus y reste ; au départ du focus, le
       repli reprend, invisible puisque copies et originaux sont identiques.
       Le plafond évite un vide trop large à gauche, que le fondu masque. */
    if (dec) { r.x = Math.min(140, r.x + dec); poser(r); }
  });
  zone.addEventListener('focusout', function (e) {
    if (!zone.contains(e.relatedTarget)) retenu = false;
  });

  /* on n'anime que ce qu'on voit */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting) demarrer(); else arreter();
    }, { rootMargin: '120px 0px' }).observe(zone);
  } else {
    demarrer();
  }

  /* ---------- le grand format ---------- */
  var fiche = document.getElementById('rh-fiche');
  var interieur = fiche && fiche.querySelector('.rh-fiche-in');
  var peutOuvrir = !!(fiche && interieur && typeof fiche.showModal === 'function');
  var dernier = null;

  function vider(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

  function remplir(art) {
    var q = function (sel) { return fiche.querySelector(sel); };
    var visuel = q('[data-rh-visuel]');
    var source = art.querySelector('.rh-ecran-in img, .rh-ecran-in .scene');
    vider(visuel);
    if (source) {
      var vue = source.cloneNode(true);
      if (vue.tagName === 'IMG') {
        vue.setAttribute('sizes', '(max-width: 1140px) 94vw, 1140px');
        vue.setAttribute('loading', 'eager');
      }
      visuel.appendChild(vue);
    }

    var kind = q('[data-rh-kind]');
    vider(kind);
    var kindSrc = art.querySelector('.rh-kind');
    if (kindSrc) {
      Array.prototype.forEach.call(kindSrc.children, function (n) { kind.appendChild(n.cloneNode(true)); });
    }

    var titre = art.querySelector('h3');
    q('[data-rh-titre]').textContent = titre ? titre.textContent : '';
    var desc = art.querySelector('.rh-desc');
    q('[data-rh-desc]').textContent = desc ? desc.textContent : '';

    var colG = q('[data-rh-points]');
    var colD = q('[data-rh-faits]');
    vider(colG); vider(colD);
    var plus = art.querySelector('.rh-plus');
    if (plus) {
      var pg = plus.querySelector('.rh-plus-points');
      var pd = plus.querySelector('.rh-plus-faits');
      if (pg) Array.prototype.forEach.call(pg.children, function (n) { colG.appendChild(n.cloneNode(true)); });
      if (pd) Array.prototype.forEach.call(pd.children, function (n) { colD.appendChild(n.cloneNode(true)); });
    }

    var tags = q('[data-rh-tags]');
    vider(tags);
    var tagsSrc = art.querySelector('.tags');
    if (tagsSrc) Array.prototype.forEach.call(tagsSrc.children, function (n) { tags.appendChild(n.cloneNode(true)); });

    /* le grand format porte la liste complète des liens ; la carte, elle,
       n'en garde que l'essentiel — et son bouton « Ouvrir » n'a plus de sens ici */
    var actions = q('[data-rh-actions]');
    vider(actions);
    var actSrc = (plus && plus.querySelector('.rh-plus-actions')) || art.querySelector('.rh-actions');
    if (actSrc) {
      Array.prototype.forEach.call(actSrc.children, function (n) {
        if (n.hasAttribute('data-rh-open')) return;
        var copie = n.cloneNode(true);
        /* la galerie garde son déclencheur d'origine : elle est câblée ailleurs */
        if (copie.hasAttribute('data-gallery-open')) {
          copie.removeAttribute('data-gallery-open');
          copie.addEventListener('click', function () { n.click(); });
        }
        actions.appendChild(copie);
      });
    }

    fiche.setAttribute('aria-label', titre ? titre.textContent : '');
    fiche.style.setProperty('--c', art.getAttribute('data-c') || '#CDAE98');
  }

  function ouvrir(i, depuis, origine) {
    if (!peutOuvrir) return;
    var art = projets[i];
    if (!art) return;
    dernier = depuis || null;
    remplir(art);
    fiche.showModal();
    document.body.classList.add('rh-ouverte');

    /* L'alvéole s'agrandit depuis sa place exacte : on mesure le panneau sans
       sa transformation, puis on le renvoie sur l'écran du projet. Le temps de
       poser ce point de départ, la transition est coupée — sinon elle partirait
       d'elle-même et le grand format s'ouvrirait de nulle part. */
    interieur.style.transition = 'none';
    ['--fx', '--fy', '--fsx', '--fsy'].forEach(function (v) { interieur.style.removeProperty(v); });
    /* L'alvéole s'agrandit depuis la carte visée : une copie du rang du bas
       peut être loin de l'original, qui défile ailleurs, voire hors champ. */
    var cible = origine || (carteVisee || art).querySelector('.rh-ecran');
    carteVisee = null;
    var H = cible ? cible.getBoundingClientRect() : null;
    if (H && H.width > 8 && !mqReduit.matches) {
      interieur.classList.add('rh-mesure');
      var P = interieur.getBoundingClientRect();
      interieur.classList.remove('rh-mesure');
      if (P.width > 8) {
        interieur.style.setProperty('--fx', (H.left - P.left).toFixed(1) + 'px');
        interieur.style.setProperty('--fy', (H.top - P.top).toFixed(1) + 'px');
        interieur.style.setProperty('--fsx', (H.width / P.width).toFixed(4));
        interieur.style.setProperty('--fsy', (H.height / P.height).toFixed(4));
      }
    }
    void interieur.offsetWidth;   /* le départ est pris : on rend la transition */
    interieur.style.transition = '';
    fiche.classList.add('is-open');
  }

  /* On range soi-même derrière soi : l'événement « close » d'un <dialog> n'est
     pas garanti sur tous les moteurs, et il ne faut pas que la page reste
     bloquée si jamais il manque à l'appel. Appelable deux fois sans dommage. */
  function ranger_fiche() {
    fiche.classList.remove('is-open');
    document.body.classList.remove('rh-ouverte');
    ['--fx', '--fy', '--fsx', '--fsy'].forEach(function (v) { interieur.style.removeProperty(v); });
    var defile = fiche.querySelector('.rh-fiche-defile');
    if (defile) defile.scrollTop = 0;
    if (dernier && document.body.contains(dernier)) { try { dernier.focus(); } catch (err) {} }
    dernier = null;
  }

  function fermer() {
    if (!fiche || !fiche.open) return;
    fiche.classList.remove('is-open');
    var fin = function () {
      if (fiche.open) fiche.close();
      ranger_fiche();
    };
    if (mqReduit.matches) { fin(); return; }
    setTimeout(fin, 480);   /* le temps que l'alvéole se replie à sa place */
  }

  if (peutOuvrir) {
    fiche.addEventListener('cancel', function (e) { e.preventDefault(); fermer(); });
    fiche.addEventListener('click', function (e) { if (e.target === fiche) fermer(); });
    fiche.addEventListener('close', ranger_fiche);
    Array.prototype.forEach.call(fiche.querySelectorAll('[data-rh-close]'), function (b) {
      b.addEventListener('click', fermer);
    });
  }

  /* ----------------------------------------------------------
     Ouvrir
     Toute la carte est une porte, pas seulement l'image : on cherche le
     projet visé, qu'on ait cliqué sur l'écran, le titre ou une étiquette.
     ---------------------------------------------------------- */
  track.addEventListener('click', function (e) {
    if (!peutOuvrir) return;          /* sans <dialog>, les liens de la carte prennent le relais */
    var cible = e.target.closest ? e.target.closest('[data-rh-open], .rh-projet[data-rh]') : null;
    if (!cible || !track.contains(cible)) return;
    /* un vrai lien dans la carte (étude de cas, dépôt) garde son rôle */
    var lien = e.target.closest('a[href]');
    if (lien && !lien.hasAttribute('data-rh-open')) return;
    var i = parseInt(cible.getAttribute('data-rh-open') || cible.getAttribute('data-rh'), 10) || 0;
    e.preventDefault();
    /* le focus reviendra sur l'original, jamais sur une copie cachée */
    carteVisee = cible.closest('.rh-projet');
    var retour = projets[i] ? projets[i].querySelector('.rh-ecran') : null;
    ouvrir(i, retour || cible);
  });

  /* ---------- depuis l'accueil : la roue des projets ouvre la même fiche ---------- */
  document.addEventListener('rh:ouvrir', function (e) {
    var d = e.detail || {};
    var i = parseInt(d.i, 10) || 0;
    if (!projets[i]) return;
    if (!peutOuvrir) { projets[i].scrollIntoView({ behavior: mqReduit.matches ? 'auto' : 'smooth', block: 'center' }); return; }
    ouvrir(i, d.depuis || null, d.origine || null);
  });

  /* ---------- les pastilles : ouvrir directement un projet ---------- */
  puces.forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (peutOuvrir) { ouvrir(i, b); return; }
      projets[i].scrollIntoView({ behavior: mqReduit.matches ? 'auto' : 'smooth', block: 'center' });
    });
  });

  /* ---------- mesures ---------- */
  var attente = 0;
  function remesurer() {
    clearTimeout(attente);
    attente = setTimeout(mesurer, 120);
  }
  window.addEventListener('resize', remesurer);
  window.addEventListener('load', mesurer);
  /* une capture qui arrive tard change la largeur des cartes : on remesure */
  Array.prototype.forEach.call(track.querySelectorAll('.rh-piste img'), function (img) {
    if (!img.complete) img.addEventListener('load', remesurer, { once: true });
  });
  if (mqReduit.addEventListener) {
    mqReduit.addEventListener('change', function () { window.location.reload(); });
  }
  mesurer();
})();
