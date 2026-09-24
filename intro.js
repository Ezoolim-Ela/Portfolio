/* ==========================================================
   « Coup de dés » — accueil vivant
   1. Ouverture « carte » : un cadre se pose en pivotant, le monogramme AE
      s'ouvre sur le nom complet (un éclat lumineux balaie le passage),
      puis la carte s'efface sur l'accueil.
   2. Accueil : blocs en relief qui s'emboîtent, lumière qui suit la souris
      et nom qui se lève lettre par lettre.
   ========================================================== */
(function () {
  var html = document.documentElement;
  var EN = (html.getAttribute('lang') || 'fr').slice(0, 2) === 'en';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  if (!hero) { html.classList.remove('intro-pending'); return; }

  var T = EN ? {
    grand: 'Welcome to my portfolio', passer: 'Skip',
  } : {
    grand: 'Bienvenue sur mon portfolio', passer: 'Passer',
  };

  /* ---------- Accueil : lettres du nom ---------- */
  var nameEl = hero.querySelector('.hero-name');
  if (nameEl && !reduceMotion) {
    var text = nameEl.textContent;
    nameEl.setAttribute('aria-label', text);
    nameEl.textContent = '';
    // chaque mot reste insécable : le nom ne se coupe jamais au milieu d'un mot
    var n = 0;
    text.split(' ').forEach(function (word, w) {
      if (w > 0) nameEl.appendChild(document.createTextNode(' '));
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
      nameEl.appendChild(box);
    });
  }

  /* ---------- Accueil : blocs en relief qui s'emboîtent ---------- */
  // x, y, largeur, hauteur (en % de l'accueil), couleur, profondeur de parallaxe, arrondis, sens d'arrivée
  var BLOCS = [
    [49, -12, 10, 64, '#34495E', 8, '0 0 28px 28px', -1],
    [57, 6, 9, 42, '#A9D3D9', 30, '26px', 1, 'is-light'],
    [64, -14, 19, 52, '#2C3E50', 16, '0 0 30px 60px', -1],
    [81, -8, 23, 34, '#3A6B7A', 24, '0 0 0 34px', -1],
    [71, 36, 14, 74, '#253545', 12, '28px 28px 0 0', 1],
    [84, 28, 20, 44, '#4CA1AF', 38, '34px 0 0 34px', 1, 'm-hide'],
    [58, 52, 15, 60, '#34495E', 20, '26px 26px 0 0', 1],
    [86, 70, 18, 42, '#8FC7CF', 34, '30px 0 0 0', 1, 'is-light m-hide'],
    [51, 74, 7, 40, '#2E4A5C', 6, '24px 24px 0 0', 1, 'm-hide']
  ];
  var relief = document.createElement('div');
  relief.className = 'hero-relief';
  relief.setAttribute('aria-hidden', 'true');
  BLOCS.forEach(function (b, i) {
    var d = document.createElement('span');
    d.className = 'rb' + (b[8] ? ' ' + b[8] : '');
    d.style.cssText = '--x:' + b[0] + '%;--y:' + b[1] + '%;--w:' + b[2] + '%;--h:' + b[3] + '%;--c:' + b[4] +
      ';--k:' + b[5] + ';--r:' + b[6] + ';--from:' + (b[7] * 90) + 'px;--i:' + i;
    relief.appendChild(d);
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

  /* ---------- Ouverture « carte » ---------- */
  function done() {
    html.classList.remove('intro-pending', 'intro-playing');
    // deux images plus tard : l'état de départ a été peint, les entrées de l'accueil peuvent jouer
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { html.classList.add('intro-done'); });
    });
    try { sessionStorage.setItem('intro-vue', '1'); } catch (e) {}
  }

  if (!html.classList.contains('intro-pending')) { done(); return; }

  var intro = document.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML =
    '<span class="intro-border"></span>' +
    '<div class="intro-card">' +
      '<div class="intro-logo">' +
        '<span class="intro-mono">AE</span>' +
        '<span class="intro-full"></span>' +
        '<span class="intro-trail"></span>' +
      '</div>' +
    '</div>';
  intro.querySelector('.intro-full').textContent = T.grand;
  var skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'intro-skip';
  skip.textContent = T.passer;
  intro.appendChild(skip);
  document.body.appendChild(intro);
  html.classList.add('intro-playing');
  document.body.style.overflow = 'hidden';

  // le monogramme s'élargit jusqu'au nom complet : on mesure les deux largeurs
  var logo = intro.querySelector('.intro-logo');
  var mono = intro.querySelector('.intro-mono');
  var full = intro.querySelector('.intro-full');
  function measureIntro() {
    logo.style.fontSize = '';                       // on repart de la taille prévue par la feuille de style
    logo.style.setProperty('--w0', mono.offsetWidth + 'px');
    var w1 = full.offsetLeft + full.offsetWidth;
    var max = document.documentElement.clientWidth - 48;
    if (w1 > max) {                                  // écran étroit : le nom est réduit pour tenir en entier
      var base = parseFloat(getComputedStyle(logo).fontSize) || 32;
      logo.style.fontSize = (base * max / w1) + 'px';
      logo.style.setProperty('--w0', mono.offsetWidth + 'px');
      w1 = full.offsetLeft + full.offsetWidth;
    }
    logo.style.setProperty('--w1', w1 + 'px');
  }

  var timers = [];
  function finish() {
    timers.forEach(clearTimeout);
    intro.classList.add('is-gone');
    document.body.style.overflow = '';
    done();
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 800);
  }
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { document.removeEventListener('keydown', onKey); finish(); }
  });

  // on attend les polices avant de mesurer (sinon la largeur d'arrivée serait fausse)
  var lance = false;
  function lancer() {
    if (lance) return;
    lance = true;
    measureIntro();
    window.addEventListener('resize', measureIntro);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { intro.classList.add('is-open'); });
    });
    // 0,1 s le cadre se pose · 0,45 s le nom s'ouvre · 1,2 s la signature s'espace · 2,6 s l'accueil
    timers.push(setTimeout(finish, 2600));
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lancer);
    timers.push(setTimeout(lancer, 600)); // filet : on ne bloque jamais plus de 0,6 s
  } else {
    lancer();
  }
})();
