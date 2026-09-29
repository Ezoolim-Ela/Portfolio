/* ==========================================================
   Compétences « L'orbite »
   Une compétence est « active » à la fois : sa bulle dit ce que j'en fais
   (sur téléphone, c'est la carte sous la scène). L'orbite passe de l'une à
   l'autre toutes les 2,8 s ; elle s'arrête sous la souris, au clavier et
   hors de l'écran. Les flèches parcourent les compétences, la légende met
   une famille en avant. Les étincelles des anneaux (SVG) se figent quand on
   demande moins de mouvement ou que la scène sort de l'écran.
   ========================================================== */
(function () {
  var sys = document.querySelector('[data-orbite]');
  if (!sys) return;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  var astres = Array.prototype.slice.call(sys.querySelectorAll('.or-astre'));
  if (!astres.length) return;
  var carte = document.querySelector('.or-carte');
  var legendes = Array.prototype.slice.call(document.querySelectorAll('.or-leg'));
  var svgs = Array.prototype.slice.call(sys.querySelectorAll('.or-orbites'));
  var actif = 0, minuteur = 0, famille = null;
  var arret = { survol: false, focus: false, horsChamp: true, cache: false };

  function nomFamille(li) {
    var ul = li.closest('.or-famille');
    return ul ? ul.getAttribute('aria-label') : '';
  }
  function activer(i) {
    actif = (i + astres.length) % astres.length;
    astres.forEach(function (a, k) {
      a.classList.toggle('est-actif', k === actif);
      a.tabIndex = k === actif ? 0 : -1;       /* un seul arrêt de tabulation, les flèches font le reste */
    });
    if (!carte) return;
    var a = astres[actif];
    var icone = carte.querySelector('.or-carte-icone');
    var svg = a.querySelector('.or-forme .icon');
    while (icone.firstChild) icone.removeChild(icone.firstChild);
    if (svg) icone.appendChild(svg.cloneNode(true));
    icone.style.setProperty('--c', a.style.getPropertyValue('--c'));
    carte.querySelector('.or-carte-fam').textContent = nomFamille(a);
    carte.querySelector('.or-carte-nom').textContent = a.querySelector('.or-nom').textContent;
    carte.querySelector('.or-carte-det').textContent = a.querySelector('.or-bulle-det').textContent;
  }
  /* l'astre suivant (ou précédent), dans la famille mise en avant s'il y en a une */
  function voisin(pas) {
    var n = astres.length, i = actif;
    for (var k = 0; k < n; k++) {
      i = (i + pas + n) % n;
      if (!famille || astres[i].getAttribute('data-famille') === famille) return i;
    }
    return actif;
  }
  function arrete() {
    if (reduit.matches) return true;
    for (var c in arret) if (arret[c]) return true;
    return false;
  }
  function programmer() {
    clearTimeout(minuteur);
    if (arrete()) return;
    minuteur = setTimeout(function () { activer(voisin(1)); programmer(); }, 2800);
  }

  /* la souris : l'astre survolé devient l'actif, et l'orbite attend */
  sys.addEventListener('pointerover', function (e) {
    var li = e.target.closest('.or-astre');
    if (li && e.pointerType === 'mouse') activer(astres.indexOf(li));
  });
  sys.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { arret.survol = true; clearTimeout(minuteur); } });
  sys.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { arret.survol = false; programmer(); } });
  /* le doigt : l'astre touché devient l'actif */
  sys.addEventListener('click', function (e) {
    var li = e.target.closest('.or-astre');
    if (!li) return;
    activer(astres.indexOf(li));
    programmer();
  });
  /* le clavier */
  sys.addEventListener('focusin', function (e) {
    var li = e.target.closest('.or-astre');
    if (!li) return;
    arret.focus = true; clearTimeout(minuteur);
    activer(astres.indexOf(li));
  });
  sys.addEventListener('focusout', function (e) {
    if (e.relatedTarget && sys.contains(e.relatedTarget)) return;
    arret.focus = false; programmer();
  });
  sys.addEventListener('keydown', function (e) {
    if (!e.target.closest('.or-astre')) return;
    var i = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = voisin(1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = voisin(-1);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = astres.length - 1;
    if (i === null) return;
    e.preventDefault();
    activer(i);
    astres[i].focus();
  });

  /* la légende : une famille en avant, les autres s'effacent ; un second appui les rend */
  legendes.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-famille');
      famille = famille === f ? null : f;
      legendes.forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-famille') === famille)); });
      if (famille) sys.setAttribute('data-famille', famille); else sys.removeAttribute('data-famille');
      if (famille && astres[actif].getAttribute('data-famille') !== famille) activer(voisin(1));
      programmer();
    });
  });

  /* l'entrée, et la pause hors de l'écran */
  function etincelles(marche) {
    svgs.forEach(function (s) {
      if (!s.pauseAnimations) return;
      if (marche) s.unpauseAnimations(); else s.pauseAnimations();
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) {
      var visible = entrees[0].isIntersecting;
      arret.horsChamp = !visible;
      if (visible) sys.classList.add('est-visible');
      sys.classList.toggle('or-pause', !visible);
      etincelles(visible && !reduit.matches);
      if (visible) programmer(); else clearTimeout(minuteur);
    }, { threshold: 0.2 }).observe(sys);
  } else {
    sys.classList.add('est-visible');
    arret.horsChamp = false;
    programmer();
  }
  if (reduit.matches) etincelles(false);
  document.addEventListener('visibilitychange', function () {
    arret.cache = document.hidden;
    if (document.hidden) clearTimeout(minuteur); else programmer();
  });

  activer(0);
})();
