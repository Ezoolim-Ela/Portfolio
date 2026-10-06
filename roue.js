/* ==========================================================
   Accueil « La roue »
   1. Le mot PORTFOLIO : chaque lettre est posée quatre fois sur un ruban qui
      tourne — le mot plein d'un côté, le mot en contour à l'opposé, chacun à
      l'endroit des deux côtés. Tout le mouvement est en CSS : ici, on ne fait
      que poser les lettres.
   2. La roue : les projets, répétés deux ou trois fois, font le tour d'un
      cadran. Elle avance d'une carte toutes les trois secondes, s'arrête sous
      la souris, au clavier ou quand l'accueil sort de l'écran ; on la fait
      tourner d'un glissement du doigt ou avec les flèches, et une carte ouvre
      la fiche du projet — la même que dans la section Projets.
   ========================================================== */
(function () {
  var hero = document.querySelector('.hero-roue');
  if (!hero) return;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 1. le mot ---------- */
  var mot = hero.querySelector('.hr-mot');
  if (mot) {
    var texte = mot.textContent.trim();
    mot.textContent = '';
    texte.split('').forEach(function (c, i) {
      var col = document.createElement('span');
      col.className = 'hr-col';
      col.style.setProperty('--i', i);
      /* la cale (pour la largeur), puis le plein et le contour, chacun avec son dos */
      ['hr-ph', 'hr-f hr-plein', 'hr-f hr-plein hr-dos', 'hr-f hr-trait', 'hr-f hr-trait hr-dos'].forEach(function (cl) {
        var s = document.createElement('span');
        s.className = cl;
        s.textContent = c;
        col.appendChild(s);
      });
      mot.appendChild(col);
    });
  }

  /* ---------- 2. la roue ---------- */
  var roue = hero.querySelector('.hr-roue');
  var anneau = roue && roue.querySelector('.hr-anneau');
  if (!anneau) return;
  var modeles = Array.prototype.slice.call(anneau.querySelectorAll('.hr-place'));
  var nb = modeles.length;
  /* autant de places qu'un multiple du nombre de projets, au plus près de douze :
     sinon la suite se casse à la couture et deux cartes identiques se touchent
     (quatre projets → douze places, cinq → dix) */
  var N = nb * Math.max(2, Math.round(12 / nb)), PAS = 360 / N;
  anneau.style.setProperty('--hr-cran', PAS + 'deg');
  var k = function (li) { return parseInt(li.style.getPropertyValue('--k'), 10) || 0; };
  var projetDe = function (li) { return parseInt(li.querySelector('.hr-carte').getAttribute('data-projet'), 10) || 0; };

  /* les visuels viennent des cartes de la section Projets : une seule source */
  modeles.forEach(function (li) {
    var src = document.querySelector('.rh-piste[data-piste="a"] > .rh-projet[data-rh="' + projetDe(li) + '"] .rh-ecran-in');
    var v = src && src.querySelector('img, .scene');
    var cible = li.querySelector('.hr-visuel');
    if (!v || !cible) return;
    var copie = v.cloneNode(true);
    if (copie.tagName === 'IMG') {
      copie.setAttribute('sizes', '240px');
      copie.removeAttribute('loading');   /* la carte est visible dès l'ouverture */
      copie.setAttribute('alt', '');
    }
    cible.appendChild(copie);
  });

  /* N places : les originaux (les seuls qu'on atteint au clavier) et leurs copies ;
     en allant vers la gauche, on croise les projets dans l'ordre 1, 2, 3…
     La page place chaque original là où cette suite l'attend : --k ≡ -projet (mod nb) */
  var prises = {};
  modeles.forEach(function (li) { prises[k(li)] = true; });
  for (var n = 0; n < N; n++) {
    if (prises[n]) continue;
    var p = ((-n) % nb + nb) % nb;
    var modele = modeles.filter(function (li) { return projetDe(li) === p; })[0];
    if (!modele) continue;
    var li = modele.cloneNode(true);
    li.style.setProperty('--k', n);
    li.setAttribute('aria-hidden', 'true');
    li.querySelector('.hr-carte').setAttribute('tabindex', '-1');
    anneau.appendChild(li);
  }
  var places = Array.prototype.slice.call(anneau.children);

  /* les illustrations sont dessinées pour 330 px : on les réduit à la taille de la carte */
  function zoomer() {
    var v = anneau.querySelector('.hr-visuel');
    if (v && v.clientWidth) roue.style.setProperty('--hr-zoom', (v.clientWidth / 330).toFixed(4));
  }
  zoomer();
  window.addEventListener('resize', zoomer);

  /* ---------- rotation ---------- */
  var angle = 0;   /* croît d'un cran (PAS) à chaque avance : la roue tourne dans le sens des aiguilles d'une montre */
  function ecart(li) { return ((k(li) * PAS + angle) % 360 + 540) % 360 - 180; }   /* -180..180, 0 = en haut */
  function poser(sansTransition) {
    if (sansTransition) roue.classList.add('hr-sans');
    roue.style.setProperty('--hr-angle', angle + 'deg');
    places.forEach(function (li) {
      var a = Math.abs(ecart(li));
      li.style.zIndex = String(40 - Math.round(a / PAS));
      li.classList.toggle('est-devant', a < PAS / 2);
    });
    if (sansTransition) { void roue.offsetWidth; roue.classList.remove('hr-sans'); }
  }
  function avancer(n) { angle += n * PAS; poser(false); }
  function amener(li) { var a = ecart(li); if (Math.abs(a) > 0.5) { angle -= a; poser(false); } }

  var DELAI = 3200, minuteur = 0;
  var arret = { survol: false, focus: false, horsChamp: false, cache: false, entree: true };
  function arrete() {
    if (reduit.matches || document.body.classList.contains('rh-ouverte')) return true;
    for (var c in arret) if (arret[c]) return true;
    return false;
  }
  function programmer() {
    clearTimeout(minuteur);
    if (arrete()) return;
    minuteur = setTimeout(function () {
      if (!arrete()) avancer(1);
      programmer();
    }, DELAI);
  }

  /* l'entrée : la roue arrive en tournant de deux crans, une fois l'accueil prêt */
  var html = document.documentElement;
  function demarrer() {
    arret.entree = false;
    if (!reduit.matches) { angle = 0; poser(false); }
    programmer();
  }
  if (reduit.matches) { poser(true); demarrer(); }
  else {
    angle = -2 * PAS; poser(true);
    if (html.classList.contains('intro-done')) setTimeout(demarrer, 120);
    else new MutationObserver(function (m, obs) {
      if (html.classList.contains('intro-done')) { obs.disconnect(); setTimeout(demarrer, 380); }
    }).observe(html, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- la souris, le clavier ---------- */
  roue.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { arret.survol = true; clearTimeout(minuteur); } });
  roue.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { arret.survol = false; programmer(); } });
  anneau.addEventListener('focusin', function (e) {
    var li = e.target.closest('.hr-place');
    arret.focus = true; clearTimeout(minuteur);
    /* au clavier seulement : la carte visée vient en haut de la roue */
    if (li && e.target.matches(':focus-visible')) amener(li);
  });
  anneau.addEventListener('focusout', function (e) {
    if (e.relatedTarget && anneau.contains(e.relatedTarget)) return;
    arret.focus = false; programmer();
  });
  anneau.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var b = e.target.closest('.hr-carte');
    if (!b) return;
    e.preventDefault();
    var p = parseInt(b.getAttribute('data-projet'), 10) || 0;
    var suivant = (p + (e.key === 'ArrowRight' ? 1 : nb - 1)) % nb;
    var cible = anneau.querySelector('.hr-place:not([aria-hidden]) .hr-carte[data-projet="' + suivant + '"]');
    if (cible) cible.focus();
  });

  /* ---------- le doigt : un glissement fait tourner la roue ---------- */
  var depart = null, glisse = false;
  roue.addEventListener('pointerdown', function (e) { depart = { x: e.clientX, y: e.clientY }; glisse = false; });
  roue.addEventListener('pointermove', function (e) { if (depart && Math.abs(e.clientX - depart.x) > 12) glisse = true; });
  roue.addEventListener('pointerup', function (e) {
    if (!depart) return;
    var dx = e.clientX - depart.x, dy = e.clientY - depart.y;
    depart = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { avancer(dx > 0 ? 1 : -1); programmer(); }
  });
  roue.addEventListener('pointercancel', function () { depart = null; });

  /* ---------- ouvrir un projet : la fiche de la section Projets, qui s'agrandit depuis la carte ---------- */
  anneau.addEventListener('click', function (e) {
    var b = e.target.closest('.hr-carte');
    if (!b) return;
    if (glisse) { e.preventDefault(); glisse = false; return; }
    var p = b.getAttribute('data-projet');
    var original = anneau.querySelector('.hr-place:not([aria-hidden]) .hr-carte[data-projet="' + p + '"]');
    clearTimeout(minuteur);
    document.dispatchEvent(new CustomEvent('rh:ouvrir', {
      detail: { i: parseInt(p, 10) || 0, depuis: original || b, origine: b.querySelector('.hr-visuel') || b }
    }));
  });
  /* la fiche refermée, la roue repart */
  new MutationObserver(function () { if (!document.body.classList.contains('rh-ouverte')) programmer(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* ---------- hors de l'écran, tout s'arrête ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) {
      var visible = entrees[0].isIntersecting;
      arret.horsChamp = !visible;
      hero.classList.toggle('hr-pause', !visible);
      if (visible) programmer(); else clearTimeout(minuteur);
    }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () {
    arret.cache = document.hidden;
    if (document.hidden) clearTimeout(minuteur); else programmer();
  });
})();
