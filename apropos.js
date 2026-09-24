/* ==========================================================
   À propos « Éclosion »
   Un éventail de lames en relief (couleurs Indigo Steel) recouvre le titre.
   Comme dans la vidéo de référence, la séquence se joue d'elle-même quand la
   section arrive : l'éventail tourne, puis ses lames partent l'une après
   l'autre en traînée vers le haut à droite, en se retournant, et révèlent
   « À propos de moi » au centre. Un clic sur la scène la rejoue.
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

  // ordre de départ : les petites lames du cœur d'abord, puis les moyennes, puis les grandes
  var order = lames.slice().sort(function (a, b) { return b.ring - a.ring || a.base - b.base; });
  order.forEach(function (l, i) { l.start = 0.26 + i * 0.022; });

  /* Séquence calquée sur la vidéo (p de 0 à 1, ~2,6 s) :
     0-0,06 l'éventail ouvert apparaît · 0,04-0,3 il tourne et se resserre
     0,26-1 les lames partent l'une après l'autre sur la même courbe,
     en se retournant, et forment une traînée vers le haut à droite. */
  function pose(p) {
    lames.forEach(function (l) {
      var appear = easeOut(clamp(p / 0.06));
      var turn = easeInOut(clamp((p - 0.04) / 0.26));
      var u = clamp((p - l.start) / 0.42);           // avancée de la lame sur la traînée
      var e = u * u * (3 - 2 * u);
      // courbe commune : part du centre, file à droite puis remonte (arc de spirale)
      var x = W * 0.56 * e + W * 0.04 * Math.sin(e * Math.PI);
      var y = -H * 0.52 * Math.pow(e, 1.7) + H * 0.05 * Math.sin(e * Math.PI);
      var rot = l.base + 30 * turn + (l.spin + 120) * e;
      var flip = 540 * e;                              // la lame se retourne en volant (effet 3D)
      var s = (0.85 + 0.15 * appear - 0.1 * turn) * (1 - 0.75 * e);
      var o = appear * (1 - clamp((u - 0.6) / 0.4));
      l.el.style.opacity = o.toFixed(3);
      l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) rotateY(' + l.tilt + 'deg) rotateX(' + flip.toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
    });
  }

  var kids = Array.prototype.slice.call(stage.children);
  var words = Array.prototype.slice.call(stage.querySelectorAll('.bloom-words > span'));
  function stageAt(p) {
    // le titre apparaît au centre dès que l'éventail commence à se vider (comme le logo de la vidéo)
    kids.forEach(function (k, i) {
      if (k.classList.contains('bloom-words')) return;
      var t = easeOut(clamp((p - 0.3 - i * 0.05) / 0.22));
      k.style.opacity = t.toFixed(3);
      k.style.transform = 'scale(' + (0.9 + 0.1 * t).toFixed(3) + ')';
      k.style.filter = t < 1 ? 'blur(' + (6 * (1 - t)).toFixed(1) + 'px)' : 'none';
    });
    var wrap = stage.querySelector('.bloom-words');
    if (wrap) wrap.style.opacity = p > 0.45 ? 1 : 0;
    words.forEach(function (w, i) {
      var t = easeOut(clamp((p - 0.5 - i * 0.07) / 0.2));
      w.style.display = 'inline-block';
      w.style.opacity = t.toFixed(3);
      w.style.transform = 'translateY(' + (0.6 * (1 - t)).toFixed(2) + 'em) rotate(' + (6 * (1 - t)).toFixed(2) + 'deg)';
    });
  }

  /* La séquence se joue d'elle-même quand la section arrive à l'écran, comme la vidéo.
     Un clic sur la scène la rejoue. */
  var playing = false;
  function play() {
    if (playing) return;
    playing = true;
    measure();
    var t0 = null, D = 2600;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = clamp((t - t0) / D);
      pose(p); stageAt(p);
      if (p < 1) requestAnimationFrame(frame); else playing = false;
    }
    requestAnimationFrame(frame);
  }

  track.classList.add('is-armed');
  measure();
  pose(0.001); stageAt(0);
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    play();
  }, { threshold: 0.55 });
  io.observe(track);
  track.querySelector('.bloom-sticky').addEventListener('click', play);
  window.addEventListener('resize', function () { if (!playing) { measure(); } });
})();
