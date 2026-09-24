/* ==========================================================
   À propos « Éclosion »
   Un éventail de lames en relief (couleurs Indigo Steel) recouvre le titre.
   Sur ordinateur, c'est le défilement qui joue l'animation, comme une vidéo :
   l'éventail s'ouvre, tourne, puis ses lames s'envolent en spirale vers le
   haut à droite et révèlent « À propos de moi ».
   Sur téléphone, la même séquence se joue d'elle-même à l'arrivée.
   ========================================================== */
(function () {
  var track = document.querySelector('[data-bloom]');
  if (!track) return;
  var fan = track.querySelector('.bloom-fan');
  var stage = track.querySelector('.bloom-stage');
  var hint = track.querySelector('.bloom-hint');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // tout reste visible, sans animation

  // [couleur, longueur, largeur] : grandes lames dehors, petites au cœur
  var LAMES = [
    ['#2C3E50', 150, 64], ['#34495E', 156, 66], ['#3A6B7A', 160, 68], ['#4CA1AF', 164, 70], ['#3A6B7A', 158, 66], ['#2C3E50', 150, 62],
    ['#7FBAC4', 112, 46], ['#A9D3D9', 116, 48], ['#4CA1AF', 118, 48], ['#A9D3D9', 112, 46], ['#7FBAC4', 106, 44],
    ['#C2D3D8', 74, 30], ['#FFFFFF', 78, 32], ['#C2D3D8', 72, 30], ['#E2F0F2', 66, 28]
  ];

  // graine fixe : les trajectoires sont les mêmes à chaque visite
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var lames = LAMES.map(function (l, i) {
    var el = document.createElement('span');
    el.className = 'eclat-lame';
    el.style.setProperty('--c', l[0]);
    fan.appendChild(el);
    var ring = i < 6 ? 0 : (i < 11 ? 1 : 2);
    var idx = ring === 0 ? i : (ring === 1 ? i - 6 : i - 11);
    var n = ring === 0 ? 6 : (ring === 1 ? 5 : 4);
    return {
      el: el, len: l[1], wid: l[2], ring: ring,
      base: -70 + idx * (140 / (n - 1)) + ring * 6,
      tilt: 18 + ring * 14,
      dx: 0.45 + rnd() * 0.45, dy: 0.35 + rnd() * 0.4, spin: 280 + rnd() * 320,
      lag: (2 - ring) * 0.035 + idx * 0.018 // les petites lames partent en premier
    };
  });

  var W = 0, H = 0, K = 1, PX = 0, PY = 0;
  function measure() {
    var r = fan.getBoundingClientRect();
    W = r.width; H = r.height;
    K = Math.max(0.85, Math.min(2.1, Math.min(W / 520, H / 330)));
    PX = W / 2; PY = H * 0.62;
    lames.forEach(function (l) {
      var w = l.wid * K, h = l.len * K;
      l.el.style.width = w + 'px'; l.el.style.height = h + 'px';
      l.el.style.left = (PX - w / 2) + 'px'; l.el.style.top = (PY - h) + 'px';
    });
  }

  function clamp(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // p de 0 à 1 : 0-0,22 ouverture · 0,22-0,42 rotation · 0,42-0,85 envol
  function pose(p) {
    lames.forEach(function (l) {
      var open = easeOut(clamp(p / 0.22));
      var turn = easeInOut(clamp((p - 0.22) / 0.2));
      var fly = clamp((p - 0.42 - l.lag) / 0.36);
      var f = fly * fly;
      var rot = l.base - 40 * (1 - open) + 35 * turn + l.spin * fly;
      var x = W * l.dx * f, y = -H * l.dy * (fly * 0.35 + f * 0.65);
      var s = (0.3 + 0.7 * open) * (1 - 0.8 * fly);
      var o = (0.4 + 0.6 * open) * (1 - f);
      l.el.style.opacity = o.toFixed(3);
      l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) rotateY(' + l.tilt + 'deg) scale(' + s.toFixed(3) + ')';
    });
  }

  var kids = Array.prototype.slice.call(stage.children);
  var words = Array.prototype.slice.call(stage.querySelectorAll('.bloom-words > span'));
  function stageAt(p) {
    kids.forEach(function (k, i) {
      if (k.classList.contains('bloom-words')) return;
      var t = easeOut(clamp((p - 0.5 - i * 0.05) / 0.18));
      k.style.opacity = t.toFixed(3);
      k.style.transform = 'translateY(' + (24 * (1 - t)).toFixed(1) + 'px) scale(' + (0.94 + 0.06 * t).toFixed(3) + ')';
    });
    var wrap = stage.querySelector('.bloom-words');
    if (wrap) { wrap.style.opacity = p > 0.6 ? 1 : 0; wrap.style.transform = 'none'; }
    words.forEach(function (w, i) {
      var t = easeOut(clamp((p - 0.62 - i * 0.05) / 0.14));
      w.style.display = 'inline-block';
      w.style.opacity = t.toFixed(3);
      w.style.transform = 'translateY(' + (0.6 * (1 - t)).toFixed(2) + 'em) rotate(' + (6 * (1 - t)).toFixed(2) + 'deg)';
    });
    if (hint) hint.style.opacity = (1 - clamp(p / 0.08)).toFixed(3);
  }

  var desktop = window.matchMedia('(min-width: 861px)');

  /* ----- Ordinateur : le défilement joue la séquence ----- */
  function scrollMode() {
    track.classList.add('is-scroll');
    measure();
    var ticking = false;
    function update() {
      ticking = false;
      var r = track.getBoundingClientRect();
      var span = r.height - (window.innerHeight - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72));
      var p = clamp(-r.top / Math.max(1, span * 0.92));
      pose(p); stageAt(p);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); });
    update();
  }

  /* ----- Téléphone : la séquence se joue seule à l'arrivée ----- */
  function timeMode() {
    track.classList.add('is-armed');
    measure();
    pose(0);
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, D = 2300;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = clamp((t - t0) / D);
        pose(p);
        if (p > 0.5 && !track.classList.contains('is-open')) track.classList.add('is-open');
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, { threshold: 0.45 });
    io.observe(track);
    window.addEventListener('resize', measure);
  }

  if (desktop.matches) scrollMode(); else timeMode();
})();
