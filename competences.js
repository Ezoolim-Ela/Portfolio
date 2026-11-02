/* ==========================================================
   Compétences « Le carrousel »
   D'après la vidéo de référence : les technologies se suivent en file, une
   seule au centre, en grand. Derrière elle, son nom écrit en lettres
   géantes ; en dessous, la pastille qui la nomme et dit ce que j'en fais.
   Les voisines restent visibles, plus petites et plus pâles, pour qu'on
   voie ce qui arrive.

   On change de technologie en la survolant, en cliquant dessus, avec les
   flèches ou au clavier ; sinon le carrousel avance tout seul toutes les
   trois secondes et demie. Il s'arrête sous la souris, au clavier, hors de
   l'écran, et ne démarre pas du tout si l'on préfère moins de mouvement.
   La légende met une famille en avant : les autres s'effacent.
   ========================================================== */
(function () {
  var scene = document.querySelector('[data-carrousel]');
  if (!scene) return;
  var items = Array.prototype.slice.call(scene.querySelectorAll('.cp-item'));
  if (!items.length) return;

  var geant = scene.querySelector('[data-cp-geant]');
  var etiquette = scene.querySelector('.cp-etiquette');
  var eFam = etiquette && etiquette.querySelector('.cp-fam');
  var eNom = etiquette && etiquette.querySelector('.cp-nom');
  var eDet = etiquette && etiquette.querySelector('.cp-det');
  var legendes = Array.prototype.slice.call(document.querySelectorAll('.or-leg'));
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  var actif = 0, famille = null, minuteur = 0;
  var arret = { survol: false, focus: false, horsChamp: true, cache: false };

  /* ----------------------------------------------------------
     Placer la file
     L'écart grandit avec la distance au centre : la voisine immédiate est
     proche, les suivantes s'éloignent et s'effacent. Au-delà de trois crans
     on n'affiche plus rien — mais les boutons restent dans la page, le
     clavier les atteint et le lecteur d'écran les lit.
     ---------------------------------------------------------- */
  var ECART = [0, 1, 1.78, 2.4];
  var TAILLE = [1, 0.58, 0.38, 0.26];
  var VOILE = [1, 0.55, 0.26, 0];

  function placer() {
    var n = items.length;
    items.forEach(function (it, i) {
      /* la distance la plus courte, en faisant le tour : la file est un anneau */
      var d = i - actif;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      var loin = Math.min(Math.abs(d), 3);
      var sens = d < 0 ? -1 : 1;
      it.style.setProperty('--x', (sens * ECART[loin] * 100) + '%');
      it.style.setProperty('--s', TAILLE[loin]);
      it.style.setProperty('--o', estVoilee(it) ? VOILE[loin] * 0.25 : VOILE[loin]);
      it.style.setProperty('--z', String(10 - loin));
      it.classList.toggle('est-actif', i === actif);
      it.setAttribute('aria-current', i === actif ? 'true' : 'false');
      it.tabIndex = i === actif ? 0 : -1;        /* un seul arrêt de tabulation, les flèches font le reste */
      it.setAttribute('aria-hidden', loin >= 3 ? 'true' : 'false');
    });
  }
  function estVoilee(it) {
    return famille !== null && it.getAttribute('data-famille') !== famille;
  }

  /* ----------------------------------------------------------
     Le mot géant tient dans la scène
     « Cisco Packet Tracer » est trois fois plus long que « Java » : à taille
     égale il déborderait. On le pose en pleine taille, on le mesure, et on
     ne le réduit que s'il le faut — le facteur va sur le paragraphe, c'est
     lui qui porte la taille de police.
     ---------------------------------------------------------- */
  var cadreGeant = geant && geant.parentNode;
  function ajuster() {
    if (!geant || !cadreGeant) return;
    cadreGeant.style.setProperty('--long', '1');
    var dispo = scene.clientWidth * 0.94;
    var large = geant.getBoundingClientRect().width;
    if (large > dispo && large > 0) cadreGeant.style.setProperty('--long', (dispo / large).toFixed(3));
  }
  window.addEventListener('resize', ajuster);

  function montrer(i, douceur) {
    actif = (i + items.length) % items.length;
    var it = items[actif];
    scene.style.setProperty('--c', it.style.getPropertyValue('--c'));
    if (geant) {
      geant.textContent = (it.getAttribute('data-nom') || '').replace(/&amp;/g, '&');
      ajuster();
      if (douceur !== false) {
        geant.classList.remove('est-neuf');
        void geant.offsetWidth;                  /* on relance l'arrivée du mot */
        geant.classList.add('est-neuf');
      }
    }
    if (eFam) eFam.innerHTML = it.getAttribute('data-fam') || '';
    if (eNom) eNom.innerHTML = it.getAttribute('data-nom') || '';
    if (eDet) eDet.innerHTML = it.getAttribute('data-det') || '';
    placer();
  }

  /* la suivante — dans la famille mise en avant s'il y en a une */
  function voisine(pas) {
    var n = items.length, i = actif;
    for (var k = 0; k < n; k++) {
      i = (i + pas + n) % n;
      if (!estVoilee(items[i])) return i;
    }
    return actif;
  }

  /* ---------- le mouvement de fond ---------- */
  function tourner() {
    clearTimeout(minuteur);
    if (reduit.matches) return;
    if (arret.survol || arret.focus || arret.horsChamp || arret.cache) return;
    minuteur = setTimeout(function () { montrer(voisine(1)); tourner(); }, 3500);
  }
  function reprendre() { tourner(); }

  /* ---------- ce qui arrête le carrousel ---------- */
  scene.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') { arret.survol = true; tourner(); } });
  scene.addEventListener('pointerleave', function () { arret.survol = false; reprendre(); });
  scene.addEventListener('focusin', function () { arret.focus = true; tourner(); });
  scene.addEventListener('focusout', function (e) {
    if (!scene.contains(e.relatedTarget)) { arret.focus = false; reprendre(); }
  });
  document.addEventListener('visibilitychange', function () { arret.cache = document.hidden; arret.cache ? tourner() : reprendre(); });

  /* ---------- viser une technologie ---------- */
  items.forEach(function (it, i) {
    /* au survol elle vient au centre : c'est le geste le plus direct */
    it.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch' && !estVoilee(it)) montrer(i); });
    it.addEventListener('click', function () { montrer(i); });
    it.addEventListener('focus', function () { montrer(i); });
  });

  var fg = scene.querySelector('.cp-fleche--g');
  var fd = scene.querySelector('.cp-fleche--d');
  if (fg) fg.addEventListener('click', function () { montrer(voisine(-1)); });
  if (fd) fd.addEventListener('click', function () { montrer(voisine(1)); });

  scene.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); montrer(voisine(1)); items[actif].focus(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); montrer(voisine(-1)); items[actif].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); montrer(0); items[actif].focus(); }
    else if (e.key === 'End') { e.preventDefault(); montrer(items.length - 1); items[actif].focus(); }
  });

  /* ---------- la légende : une famille en avant ---------- */
  legendes.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-famille');
      famille = (famille === f) ? null : f;
      legendes.forEach(function (x) {
        x.setAttribute('aria-pressed', x.getAttribute('data-famille') === famille ? 'true' : 'false');
      });
      scene.setAttribute('data-famille', famille || '');
      if (famille && estVoilee(items[actif])) montrer(voisine(1));
      else placer();
    });
  });

  /* ---------- on n'anime que ce qu'on voit ---------- */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entrees) {
      arret.horsChamp = !entrees[0].isIntersecting;
      arret.horsChamp ? tourner() : reprendre();
    }, { rootMargin: '80px 0px' }).observe(scene);
  } else {
    arret.horsChamp = false;
  }

  montrer(0, false);
  reprendre();
})();
