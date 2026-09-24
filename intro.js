/* ==========================================================
   « Coup de dés » — accueil vivant
   1. Ouverture : un dé est lancé, roule, se pose sur le 1,
      puis on plonge dans son point pour arriver sur l'accueil.
   2. Accueil : blocs en relief qui s'emboîtent, lumière qui suit la souris,
      nom qui se lève lettre par lettre, et un dé à lancer
      qui révèle une facette du profil.
   ========================================================== */
(function () {
  var html = document.documentElement;
  var EN = (html.getAttribute('lang') || 'fr').slice(0, 2) === 'en';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  if (!hero) { html.classList.remove('intro-pending'); return; }

  var T = EN ? {
    coup: 'A roll of the dice…', passer: 'Skip',
    lancer: 'Roll the dice', relancer: 'Roll again',
    invite: 'Nothing here is left to chance.',
    de: 'Six-sided die: roll it to discover one side of my profile',
    faces: [
      ['STEA, in production', 'A stock management application used every day by a company.'],
      ['Java & Spring Boot', 'Solid, tested and maintainable REST APIs.'],
      ['Cisco networks', 'CCNA 1 & 2 certified: routing, VLANs, network security.'],
      ['React & interfaces', 'Clear screens, designed for the people who use them.'],
      ['SQL data', 'MySQL, SQL Server: model first, then code.'],
      ['And you?', 'An internship to offer? The next roll is yours.']
    ],
    contact: 'Get in touch'
  } : {
    coup: 'Un coup de dés…', passer: 'Passer',
    lancer: 'Lancer le dé', relancer: 'Relancer',
    invite: 'Ici, rien n’est laissé au hasard.',
    de: 'Dé à six faces : lancez-le pour découvrir une facette de mon profil',
    faces: [
      ['STEA, en production', 'Une application de gestion de stock utilisée chaque jour par une entreprise.'],
      ['Java & Spring Boot', 'Des API REST solides, testées et maintenables.'],
      ['Réseaux Cisco', 'Certifiée CCNA 1 & 2 : routage, VLAN, sécurisation.'],
      ['React & interfaces', 'Des écrans clairs, pensés pour ceux qui les utilisent.'],
      ['Données SQL', 'MySQL, SQL Server : modéliser avant de coder.'],
      ['Et vous ?', 'Un stage à me proposer ? Le prochain lancer est pour vous.']
    ],
    contact: 'Me contacter'
  };

  /* ---------- Fabrique d'un dé en 3D (faces 1 à 6, points disposés comme un vrai dé) ---------- */
  var PIPS = { 1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  var FACES = { 1: 'front', 6: 'back', 3: 'right', 4: 'left', 2: 'top', 5: 'bottom' };
  // Rotation du cube qui amène chaque face devant
  var POSE = { 1: [0, 0], 6: [0, 180], 3: [0, -90], 4: [0, 90], 2: [-90, 0], 5: [90, 0] };

  function buildDice(extraClass) {
    var cube = document.createElement('div');
    cube.className = 'dice' + (extraClass ? ' ' + extraClass : '');
    ['front', 'back', 'right', 'left', 'top', 'bottom'].forEach(function (side) {
      var core = document.createElement('span');
      core.className = 'dice-core dice-' + side;
      cube.appendChild(core);
    });
    Object.keys(FACES).forEach(function (n) {
      var face = document.createElement('span');
      face.className = 'dice-face dice-' + FACES[n] + ' n' + n;
      PIPS[n].forEach(function (cell) {
        var pip = document.createElement('i');
        pip.className = 'pip';
        pip.style.gridArea = (Math.ceil(cell / 3)) + ' / ' + (((cell - 1) % 3) + 1);
        face.appendChild(pip);
      });
      cube.appendChild(face);
    });
    return cube;
  }

  /* ---------- Accueil : lettres du nom ---------- */
  var nameEl = hero.querySelector('.hero-name');
  if (nameEl && !reduceMotion) {
    var text = nameEl.textContent;
    nameEl.setAttribute('aria-label', text);
    nameEl.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      nameEl.appendChild(s);
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

  /* ---------- Accueil : le dé à lancer ---------- */
  var slot = hero.querySelector('[data-dice]');
  if (slot) {
    var stage = document.createElement('div');
    stage.className = 'dice-stage';
    var tilt = document.createElement('div');
    tilt.className = 'dice-tilt';
    var hop = document.createElement('button');
    hop.type = 'button';
    hop.className = 'dice-hop';
    hop.setAttribute('aria-label', T.de);
    var cube = buildDice('dice-hero');
    hop.appendChild(cube);
    tilt.appendChild(hop);
    stage.appendChild(tilt);
    var shadow = document.createElement('span');
    shadow.className = 'dice-shadow';
    stage.appendChild(shadow);

    var card = document.createElement('div');
    card.className = 'dice-card';
    card.setAttribute('aria-live', 'polite');
    card.innerHTML = '<p class="dice-card-num" aria-hidden="true">?</p><div><p class="dice-card-title"></p><p class="dice-card-text"></p></div>';
    var rollBtn = document.createElement('button');
    rollBtn.type = 'button';
    rollBtn.className = 'btn btn-glass dice-roll';
    rollBtn.innerHTML = '<span class="dice-roll-ico" aria-hidden="true"></span><span class="dice-roll-label"></span>';

    slot.appendChild(stage);
    slot.appendChild(card);
    slot.appendChild(rollBtn);

    var ax = 0, ay = 0, last = 0, rolling = false, first = true;
    var cTitle = card.querySelector('.dice-card-title'), cText = card.querySelector('.dice-card-text'), cNum = card.querySelector('.dice-card-num');
    cTitle.textContent = T.invite;
    cText.textContent = '';
    rollBtn.querySelector('.dice-roll-label').textContent = T.lancer;
    cube.style.transform = 'rotateX(' + ax + 'deg) rotateY(' + ay + 'deg)';

    function show(n) {
      var f = T.faces[n - 1];
      cNum.textContent = n;
      cTitle.textContent = f[0];
      cText.textContent = f[1];
      if (n === 6) {
        var a = document.createElement('a');
        a.href = '#contact'; a.className = 'dice-card-link'; a.textContent = T.contact + ' →';
        cText.appendChild(document.createTextNode(' '));
        cText.appendChild(a);
      }
      card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new');
    }

    function roll() {
      if (rolling) return;
      var n;
      do { n = 1 + Math.floor(Math.random() * 6); } while (n === last);
      if (first) { n = 1; first = false; } // le premier lancer montre toujours STEA, le projet phare
      last = n;
      var pose = POSE[n];
      var turnsX = 2 + Math.floor(Math.random() * 2), turnsY = 2 + Math.floor(Math.random() * 2);
      // on garde des angles croissants pour que le dé tourne toujours « vers l'avant »
      ax = Math.ceil((ax + 1) / 360) * 360 + turnsX * 360 + pose[0];
      ay = Math.ceil((ay + 1) / 360) * 360 + turnsY * 360 + pose[1];
      if (reduceMotion) {
        cube.style.transition = 'none';
        cube.style.transform = 'rotateX(' + pose[0] + 'deg) rotateY(' + pose[1] + 'deg)';
        show(n);
        return;
      }
      rolling = true;
      stage.classList.remove('is-rolling'); void stage.offsetWidth; stage.classList.add('is-rolling');
      cube.style.transition = 'transform 1.25s cubic-bezier(0.18, 0.85, 0.25, 1)';
      cube.style.transform = 'rotateX(' + ax + 'deg) rotateY(' + ay + 'deg)';
      setTimeout(function () {
        rolling = false;
        stage.classList.remove('is-rolling');
        show(n);
        rollBtn.querySelector('.dice-roll-label').textContent = T.relancer;
      }, 1150);
    }
    hop.addEventListener('click', roll);
    rollBtn.addEventListener('click', roll);
  }

  /* ---------- Ouverture « coup de dés » ---------- */
  function done() {
    html.classList.remove('intro-pending', 'intro-playing');
    html.classList.add('intro-done');
    try { sessionStorage.setItem('intro-vue', '1'); } catch (e) {}
  }

  if (!html.classList.contains('intro-pending')) { done(); return; }

  var intro = document.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML =
    '<p class="intro-brand"><span class="gem">AE</span> Ago Ezoolim-Ela</p>' +
    '<div class="intro-scene"><div class="intro-throw"></div><span class="intro-shadow"></span></div>' +
    '<p class="intro-caption"></p>';
  intro.querySelector('.intro-caption').textContent = T.coup;
  var skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'intro-skip';
  skip.textContent = T.passer;
  intro.appendChild(skip);
  intro.querySelector('.intro-throw').appendChild(buildDice('dice-intro'));
  document.body.appendChild(intro);
  html.classList.add('intro-playing');
  document.body.style.overflow = 'hidden';

  var timers = [];
  function finish() {
    timers.forEach(clearTimeout);
    intro.classList.add('is-gone');
    document.body.style.overflow = '';
    done();
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 700);
  }
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { document.removeEventListener('keydown', onKey); finish(); }
  });

  // 0 → 1,7 s : lancer et rebonds ; 2,05 s : plongée dans le point ; 2,7 s : l'accueil apparaît
  requestAnimationFrame(function () { intro.classList.add('is-throwing'); });
  timers.push(setTimeout(function () { intro.classList.add('is-landed'); }, 1750));
  timers.push(setTimeout(function () { intro.classList.add('is-diving'); }, 2050));
  timers.push(setTimeout(finish, 2700));
})();
