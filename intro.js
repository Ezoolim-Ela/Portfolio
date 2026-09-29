/* ==========================================================
   Accueil vivant : blocs en relief qui s'emboîtent, lumière qui suit la
   souris et nom qui se lève lettre par lettre. Plus d'écran d'ouverture :
   le site s'ouvre directement sur l'accueil.
   ========================================================== */
(function () {
  var html = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  if (!hero) { html.classList.remove('intro-pending'); return; }

  /* ---------- Accueil : lettres du nom ---------- */
  var nameEl = hero.querySelector('.hero-name');
  if (nameEl && !reduceMotion) {
    nameEl.setAttribute('aria-label', nameEl.textContent.replace(/\s+/g, ' ').trim());
    // Le nom peut être posé en lignes (.hn, une par mot dans l'accueil « L'Arche ») :
    // on découpe à l'intérieur de chacune sans les défaire, pour garder la mise en page.
    // Chaque mot reste insécable : le nom ne se coupe jamais au milieu d'un mot.
    var lignes = nameEl.querySelectorAll('.hn');
    var n = 0;
    (lignes.length ? Array.prototype.slice.call(lignes) : [nameEl]).forEach(function (ligne) {
      var text = ligne.textContent.trim();
      ligne.textContent = '';
      text.split(/\s+/).forEach(function (word, w) {
        if (w > 0) ligne.appendChild(document.createTextNode(' '));
        var box = document.createElement('span');
        box.className = 'word';
        box.setAttribute('aria-hidden', 'true');
        word.split('').forEach(function (ch) {
          var s = document.createElement('span');
          s.className = 'ch';
          s.style.setProperty('--i', n++);
          s.textContent = ch;
          box.appendChild(s);
        });
        ligne.appendChild(box);
      });
    });
  }

  /* ---------- Accueil : blocs en relief qui s'emboîtent ---------- */
  // x, y, largeur, hauteur (en % de l'accueil), couleur, profondeur de parallaxe, arrondis, sens d'arrivée
  // Les deux dernières valeurs font la pluie : le sens (1 descend, -1 monte)
  // et la durée d'une traversée. Les durées sont volontairement toutes
  // différentes et sans diviseur commun : la composition ne se répète jamais.
  var BLOCS = [
    [49, -12, 10, 64, '#561D3B', 8, '0 0 28px 28px', -1, '', 1, 47],
    [57, 6, 9, 42, '#E2CAB6', 30, '26px', 1, 'is-light', -1, 38],
    [64, -14, 19, 52, '#4A1932', 16, '0 0 30px 60px', -1, '', 1, 59],
    [81, -8, 23, 34, '#6A2449', 24, '0 0 0 34px', -1, '', -1, 43],
    [71, 36, 14, 74, '#3F152B', 12, '28px 28px 0 0', 1, '', 1, 67],
    [84, 28, 20, 44, '#AB8975', 38, '34px 0 0 34px', 1, 'm-hide', -1, 53],
    [58, 52, 15, 60, '#561D3B', 20, '26px 26px 0 0', 1, '', -1, 61],
    [86, 70, 18, 42, '#D6A5C0', 34, '30px 0 0 0', 1, 'is-light m-hide', 1, 41],
    [51, 74, 7, 40, '#521B37', 6, '24px 24px 0 0', 1, 'm-hide', -1, 71]
  ];
  var relief = document.createElement('div');
  relief.className = 'hero-relief';
  relief.setAttribute('aria-hidden', 'true');
  /* Chaque bloc est posé deux fois, le jumeau décalé d'une demi-course :
     quand l'un sort du cadre, l'autre y entre. Sans ce jumeau la scène se
     viderait, puisqu'un bloc passe la moitié de son trajet hors de l'écran. */
  BLOCS.forEach(function (b, i) {
    // départ décalé dans le passé : à l'ouverture, chaque bloc est déjà
    // quelque part dans sa course, jamais tous alignés au même endroit
    var phase = -((i * 7 + 3) % b[10]);
    [0, b[10] / 2].forEach(function (retard, j) {
      var d = document.createElement('span');
      d.className = 'rb' + (b[8] ? ' ' + b[8] : '') + (j ? ' rb-jumeau' : '');
      d.style.cssText = '--x:' + b[0] + '%;--y:' + b[1] + '%;--w:' + b[2] + '%;--h:' + b[3] + '%;--c:' + b[4] +
        ';--k:' + b[5] + ';--r:' + b[6] + ';--i:' + i +
        ';--sens:' + b[9] + ';--duree:' + b[10] + 's;--phase:' + (phase - retard).toFixed(1) + 's';
      relief.appendChild(d);
    });
  });
  hero.insertBefore(relief, hero.firstChild);
  var grain = document.createElement('div');
  grain.className = 'hero-grain';
  grain.setAttribute('aria-hidden', 'true');
  hero.insertBefore(grain, hero.firstChild);
  var glow = document.createElement('div');
  glow.className = 'hero-light';
  glow.setAttribute('aria-hidden', 'true');
  hero.insertBefore(glow, hero.firstChild);
  hero.classList.add('is-alive');

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var raf = null, mx = 0.5, my = 0.5;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        hero.style.setProperty('--mx', (mx * 100).toFixed(2) + '%');
        hero.style.setProperty('--my', (my * 100).toFixed(2) + '%');
        hero.style.setProperty('--px', (mx - 0.5).toFixed(3));
        hero.style.setProperty('--py', (my - 0.5).toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0);
    });
  }

  /* ---------- Entrée de l'accueil ---------- */
  // Le contenu reste masqué (classe intro-pending, posée dans le <head>) jusqu'à ce que les
  // polices du nom et du « Bonjour » soient là — au plus 2 s après le début du chargement :
  // sur un cache vide elles arrivent en 1,2 à 1,8 s, et un nom qui changerait de police en
  // pleine entrée sauterait. Une fois en cache, elles sont là tout de suite.
  // Les deux classes changent dans la même image : l'état de départ des animations prend
  // aussitôt le relais, l'accueil ne clignote pas.
  var entre = false;
  function entrer() {
    if (entre) return;
    entre = true;
    html.classList.add('intro-done');
    html.classList.remove('intro-pending');
  }
  /* les polices à attendre : celles que l'accueil annonce (data-polices), sinon celles du nom et du « Bonjour » */
  var voulues = (hero.getAttribute('data-polices') || 'Fraunces,Parisienne').split(',').map(function (n) { return n.trim(); });
  function policesPretes() {
    var pretes = {};
    voulues.forEach(function (n) { pretes[n] = false; });
    document.fonts.forEach(function (f) {
      var nom = f.family.replace(/["']/g, '');
      if (nom in pretes && f.status === 'loaded') pretes[nom] = true;
    });
    return voulues.every(function (n) { return pretes[n]; });
  }
  if (html.classList.contains('intro-pending') && document.fonts && document.fonts.forEach) {
    (function guetter() {
      if (policesPretes() || performance.now() > 2000) entrer();
      else setTimeout(guetter, 50);
    })();
  } else {
    entrer();
  }
})();
