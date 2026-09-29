/* ==========================================================
   À propos « Éclosion »
   Un éventail de lames en relief (couleurs Indigo Steel) recouvre le titre.
   Comme dans la vidéo de référence, la séquence se joue d'elle-même quand le
   titre arrive : l'éventail tourne, puis ses lames partent l'une après l'autre
   en traînée vers le haut à droite, en se retournant, et révèlent
   « À propos de moi ». Tout ce qu'il faut savoir sur moi suit dans la même
   scène, juste en dessous. Un clic sur le titre rejoue l'éclosion.
   ========================================================== */
(function () {
  var track = document.querySelector('[data-bloom]');
  if (!track) return;
  var fan = track.querySelector('.bloom-fan');
  var stage = track.querySelector('.bloom-stage');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // tout reste visible, sans animation

  // [couleur, longueur, largeur] : grandes lames dehors, petites au cœur
  // [couleur, longueur, largeur] : des rubans, longs et effilés
  var LAMES = [
    ['#C0648B', 268, 34], ['#D6A5C0', 292, 38], ['#AB8975', 310, 42], ['#D6BFB0', 300, 40],
    ['#AB8975', 284, 36], ['#E2CAB6', 262, 32], ['#EBDACB', 240, 28],
    ['#D6A5C0', 226, 26], ['#AB8975', 248, 30], ['#AB8975', 236, 28], ['#E2CAB6', 214, 24],
    ['#C0648B', 198, 22], ['#D6BFB0', 208, 24], ['#EBDACB', 186, 20]
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
    /* Les rubans traversent toute la scène : ils ne se posent jamais sur le
       texte, ils ne font que passer devant, le temps de le découvrir. */
    var sticky = track.querySelector('.bloom-sticky');
    if (sticky) fan.style.height = Math.round(sticky.getBoundingClientRect().height) + 'px';
    var r = fan.getBoundingClientRect();
    W = r.width; H = r.height;
    K = Math.max(0.85, Math.min(2.1, Math.min(W / 520, H / 330)));
    PX = W / 2; PY = H * 0.5;
    lames.forEach(function (l) {
      var w = l.wid * K, h = l.len * K;
      l.el.style.width = w + 'px'; l.el.style.height = h + 'px';
      l.el.style.left = (PX - w / 2) + 'px'; l.el.style.top = (PY - h / 2) + 'px';
    });
  }

  function clamp(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // ordre de départ : les petites lames du cœur d'abord, puis les moyennes, puis les grandes
  var order = lames.slice().sort(function (a, b) { return b.ring - a.ring || a.base - b.base; });
  order.forEach(function (l, i) { l.start = i * 0.032; });

  /* Séquence calquée sur la vidéo (p de 0 à 1, ~2,6 s) :
     0-0,06 l'éventail ouvert apparaît · 0,04-0,3 il tourne et se resserre
     0,26-1 les lames partent l'une après l'autre sur la même courbe,
     en se retournant, et forment une traînée vers le haut à droite. */
  /* Chaque ruban entre par la droite, traverse l'écran en arc et sort en haut
     à gauche, en tournant sur lui-même. Ils se suivent à la file : c'est ce
     défilement de lames qui découvre le titre au passage. */
  function pose(p) {
    lames.forEach(function (l) {
      var u = clamp((p - l.start) / 0.5);
      var e = easeInOut(u);
      var x = W * (0.74 - 1.6 * e);
      var y = H * (0.36 - 0.95 * e) + H * 0.24 * Math.sin(e * Math.PI);
      var rot = l.base * 0.35 - 34 + 52 * e;
      var vrille = l.spin * 0.22 * e;                  // le ruban se vrille en volant
      var s = 0.92 + 0.12 * Math.sin(e * Math.PI);
      // il naît en entrant et s'efface en sortant : jamais de coupure nette
      var o = clamp(u / 0.12) * (1 - clamp((u - 0.78) / 0.22));
      l.el.style.opacity = o.toFixed(3);
      l.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) rotateY(' + vrille.toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
    });
  }

  var kids = Array.prototype.slice.call(stage.children);
  var words = Array.prototype.slice.call(stage.querySelectorAll('.bloom-words > span'));
  function stageAt(p) {
    // le titre apparaît au centre dès que l'éventail commence à se vider (comme le logo de la vidéo)
    kids.forEach(function (k, i) {
      if (k.classList.contains('bloom-words')) return;
      var t = easeOut(clamp((p - 0.42 - i * 0.05) / 0.2));
      k.style.opacity = t.toFixed(3);
      k.style.transform = 'scale(' + (0.9 + 0.1 * t).toFixed(3) + ')';
      k.style.filter = t < 1 ? 'blur(' + (6 * (1 - t)).toFixed(1) + 'px)' : 'none';
    });
    var wrap = stage.querySelector('.bloom-words');
    if (wrap) wrap.style.opacity = p > 0.56 ? 1 : 0;
    words.forEach(function (w, i) {
      var t = easeOut(clamp((p - 0.58 - i * 0.06) / 0.18));
      w.style.display = 'inline-block';
      w.style.opacity = t.toFixed(3);
      w.style.transform = 'translateY(' + (0.6 * (1 - t)).toFixed(2) + 'em) rotate(' + (6 * (1 - t)).toFixed(2) + 'deg)';
    });
  }

  /* La séquence se joue d'elle-même quand la section arrive à l'écran, comme la vidéo.
     Un clic sur la scène la rejoue. */
  var playing = false, joue = false;
  function play() {
    if (playing) return;
    playing = true;
    measure();
    var t0 = null, D = 2600;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = clamp((t - t0) / D);
      pose(p); stageAt(p);
      if (p < 1) requestAnimationFrame(frame); else { playing = false; joue = true; }
    }
    requestAnimationFrame(frame);
    /* Filet : si les images ne passent pas (onglet en arrière-plan, moteur au
       repos), on pose quand même l'état final. Le titre de la section ne doit
       pas pouvoir rester invisible. Le filet ne s'arme qu'une fois la scène à
       l'écran, donc il ne peut jamais escamoter l'éclosion. */
    setTimeout(function () { if (!joue) { pose(1); stageAt(1); joue = true; } }, 4000);
  }

  track.classList.add('is-armed');
  measure();
  pose(0.001); stageAt(0);
  /* On guette le titre, pas la piste : la scène porte désormais tout le contenu
     et dépasse l'écran, donc un seuil calculé sur elle ne serait jamais atteint. */
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      play();
    }, { threshold: 0.55 });
    io.observe(stage);
  } else {
    play();
  }
  /* Le clic rejoue l'éclosion, mais seulement sur le titre : la scène contient
     maintenant des liens et un bouton, qu'on ne veut pas transformer en gadget. */
  stage.addEventListener('click', play);
  window.addEventListener('resize', function () { if (!playing) { measure(); } });
})();
