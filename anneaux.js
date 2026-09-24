/* ==========================================================
   Compétences « Anneaux » — d'après la vidéo de référence
   Des sphères arrivent en traînées depuis les côtés, puis s'assemblent en
   trois anneaux entrelacés qui tournent lentement : un anneau par famille
   de compétences (Programmation, Web & données, Réseaux & outils).
   Survoler une carte met son anneau en avant. Dessin sur <canvas>, en 3D
   simulée ; l'animation s'arrête quand la section n'est plus visible.
   ========================================================== */
(function () {
  var box = document.querySelector('[data-orbit]');
  if (!box) return;
  var canvas = box.querySelector('canvas');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-ring]'));

  /* ---------- « Le déversement » : la sculpture bascule et vide les compétences dans les cartes ---------- */
  var section = box.closest('.section');
  var puces = section ? Array.prototype.slice.call(section.querySelectorAll('.chip, .cert')) : [];
  var cartes = section ? Array.prototype.slice.call(section.querySelectorAll('.skill-group')) : [];
  if (!reduceMotion && section && puces.length) section.classList.add('pour-ready');
  var verseDebut = -1;                       // instant du basculement, en secondes

  function deverser() {
    var r = box.getBoundingClientRect();
    var ox = r.left + r.width / 2, oy = r.top + r.height * 0.47;   // le cœur de la sculpture
    var graine = 3;
    var tirage = function () { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
    cartes.forEach(function (c, i) { c.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); });
    puces.forEach(function (el, i) {
      var b = el.getBoundingClientRect();
      el.style.setProperty('--dx', Math.round(ox - (b.left + b.width / 2)) + 'px');
      el.style.setProperty('--dy', Math.round(oy - (b.top + b.height / 2)) + 'px');
      el.style.setProperty('--rot', ((tirage() - 0.5) * 90).toFixed(1) + 'deg');
      el.style.setProperty('--d', (0.05 + i * 0.045).toFixed(3) + 's');
    });
    section.classList.add('is-pouring');
  }

  // Couleurs Indigo Steel : indigo, bleu-vert, bleu clair
  var RINGS = [
    { color: '#2C3E50', light: '#6F8AA6', n: 44, tiltX: 72, tiltZ: -28 },
    { color: '#4CA1AF', light: '#A9E0E8', n: 44, tiltX: 18, tiltZ: 32 },
    { color: '#7FBAC4', light: '#E8F6F8', n: 40, tiltX: -48, tiltZ: 70 }
  ];

  // Sprite d'une sphère ombrée, par couleur (dessiné une fois, puis réutilisé)
  function sprite(c, l) {
    var s = document.createElement('canvas'), S = 64;
    s.width = s.height = S;
    var g = s.getContext('2d');
    var grd = g.createRadialGradient(S * 0.36, S * 0.32, S * 0.04, S * 0.5, S * 0.5, S * 0.5);
    grd.addColorStop(0, l); grd.addColorStop(0.45, c); grd.addColorStop(1, shade(c, -0.45));
    g.fillStyle = grd; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2); g.fill();
    return s;
  }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    function f(v) { return Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); }
    return 'rgb(' + f(r) + ',' + f(gg) + ',' + f(b) + ')';
  }
  RINGS.forEach(function (r) { r.img = sprite(r.color, r.light); });
  // en mode sombre, l'anneau indigo serait invisible sur le fond : il s'éclaircit
  var darkImg = sprite('#5D7A96', '#B7CBDD');
  function ringImg(i) { return i === 0 && document.documentElement.getAttribute('data-theme') === 'dark' ? darkImg : RINGS[i].img; }

  // Sphères : position finale sur l'anneau + point de départ en traînée
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var balls = [];
  RINGS.forEach(function (ring, ri) {
    var ax = ring.tiltX * Math.PI / 180, az = ring.tiltZ * Math.PI / 180;
    for (var i = 0; i < ring.n; i++) {
      var a = i / ring.n * Math.PI * 2;
      // cercle dans le plan XY, incliné autour de X puis de Z
      var x = Math.cos(a), y = Math.sin(a), z = 0;
      var y1 = y * Math.cos(ax) - z * Math.sin(ax), z1 = y * Math.sin(ax) + z * Math.cos(ax);
      var x2 = x * Math.cos(az) - y1 * Math.sin(az), y2 = x * Math.sin(az) + y1 * Math.cos(az);
      var side = rnd() < 0.5 ? -1 : 1;
      balls.push({
        ring: ri, tx: x2, ty: y2, tz: z1,
        sx: side * (1.3 + rnd() * 0.55), sy: (rnd() - 0.5) * 0.5, sz: (rnd() - 0.5) * 0.8,
        size: 0.075 + rnd() * 0.03,
        delay: ri * 0.12 + rnd() * 0.45
      });
    }
  });

  var W = 0, H = 0, DPR = 1, R = 1;
  function resize() {
    var r = box.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    R = Math.min(W, H) * 0.34;
  }

  var focus = -1, focusAmt = [0, 0, 0];
  groups.forEach(function (g) {
    var i = +g.getAttribute('data-ring');
    g.addEventListener('mouseenter', function () { focus = i; });
    g.addEventListener('mouseleave', function () { if (focus === i) focus = -1; });
    g.addEventListener('focusin', function () { focus = i; });
    g.addEventListener('focusout', function () { if (focus === i) focus = -1; });
  });
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  box.parentNode.addEventListener('pointermove', function (e) {
    var r = box.getBoundingClientRect();
    tmx = ((e.clientX - r.left) / r.width - 0.5); tmy = ((e.clientY - r.top) / r.height - 0.5);
  });

  function ease(x) { return x < 0 ? 0 : (x > 1 ? 1 : 1 - Math.pow(1 - x, 3)); }
  function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }

  var start = null, running = false, visible = false, raf = null, filet = null;
  function draw(now) {
    raf = null;
    if (start === null) start = now;
    var t = (now - start) / 1000;
    var build = reduceMotion ? 10 : t;               // secondes écoulées depuis l'arrivée
    var spin = reduceMotion ? 0.5 : 0.5 + t * 0.35;   // rotation de l'ensemble
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    for (var k = 0; k < 3; k++) focusAmt[k] += ((focus === k ? 1 : (focus === -1 ? 0 : -1)) - focusAmt[k]) * 0.12;

    // au moment du déversement, la sculpture s'emballe puis se penche avant de se remettre d'aplomb
    if (verseDebut < 0 && build > 1.75) { verseDebut = t; deverser(); if (filet) { clearTimeout(filet); filet = null; } }
    var v = verseDebut < 0 ? 0 : clamp01((t - verseDebut) / 1.6);
    var basc = v === 0 ? 0 : Math.sin(v * Math.PI);
    var ry = spin + mx * 0.8 + basc * 2.4, rx = -0.25 + my * 0.5 + basc * 0.5;
    var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    var f = 3.2; // distance de la caméra (en rayons)

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ombre au sol, qui se forme avec l'assemblage
    var formed = ease(build / 2.2);
    var sh = ctx.createRadialGradient(W / 2, H * 0.9, 0, W / 2, H * 0.9, R * 1.2);
    sh.addColorStop(0, 'rgba(20,30,40,' + (0.22 * formed).toFixed(3) + ')'); sh.addColorStop(1, 'rgba(20,30,40,0)');
    ctx.fillStyle = sh; ctx.save(); ctx.translate(W / 2, H * 0.9); ctx.scale(1, 0.18); ctx.translate(-W / 2, -H * 0.9);
    ctx.beginPath(); ctx.arc(W / 2, H * 0.9, R * 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    var list = [];
    balls.forEach(function (b) {
      var p = ease((build - b.delay) / 1.4);
      // trajectoire : glisse horizontalement (traînée) puis s'enroule sur l'anneau
      var bx = b.sx + (b.tx - b.sx) * p;
      var by = b.sy + (b.ty - b.sy) * p + Math.sin(p * Math.PI) * 0.25 * (b.sx > 0 ? -1 : 1);
      var bz = b.sz + (b.tz - b.sz) * p;
      // rotation de l'ensemble (seulement pour la part déjà assemblée)
      var x1 = bx * cy + bz * sy, z1 = -bx * sy + bz * cy;
      var y2 = by * cx - z1 * sx, z2 = by * sx + z1 * cx;
      var X = p * x1 + (1 - p) * bx, Y = p * y2 + (1 - p) * by, Z = p * z2 + (1 - p) * bz;
      var persp = f / (f + Z);
      var fa = focusAmt[b.ring];
      list.push({
        z: Z, x: W / 2 + X * R * persp, y: H * 0.47 + Y * R * persp,
        r: b.size * R * persp * (1 + 0.35 * Math.max(0, fa)),
        a: (build < b.delay ? 0 : Math.min(1, (build - b.delay) * 4)) * (fa < 0 ? 1 + 0.72 * fa : 1),
        img: ringImg(b.ring), p: p, dx: (b.tx - b.sx) * R * persp
      });
    });
    list.sort(function (a, b) { return b.z - a.z; });
    list.forEach(function (s) {
      if (s.a <= 0.01) return;
      // traînée pendant le vol
      if (s.p < 0.95) {
        for (var k = 3; k >= 1; k--) {
          ctx.globalAlpha = s.a * 0.12 * (4 - k) * (1 - s.p);
          var o = -Math.sign(s.dx) * k * s.r * 1.3;
          ctx.drawImage(s.img, s.x + o - s.r, s.y - s.r * 0.8, s.r * 2, s.r * 1.6);
        }
      }
      ctx.globalAlpha = s.a;
      ctx.drawImage(s.img, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    });
    ctx.globalAlpha = 1;

    if (running && !reduceMotion) raf = requestAnimationFrame(draw);
  }

  function run() {
    if (running) return;
    running = true;
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

  resize();
  window.addEventListener('resize', function () { resize(); if (!running) requestAnimationFrame(draw); });
  var io = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible) {
      box.classList.add('is-live');
      run();
      // filet : si le dessin ne démarre pas, les compétences s'affichent quand même
      if (verseDebut < 0 && !filet) filet = setTimeout(function () { if (verseDebut < 0) { verseDebut = 0; deverser(); } }, 4000);
    } else stop();
  }, { threshold: 0.25 });
  io.observe(box);
  if (reduceMotion) { box.classList.add('is-live'); requestAnimationFrame(draw); }
})();
