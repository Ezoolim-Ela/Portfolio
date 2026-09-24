/* ==========================================================
   « Éclat » — ouverture de la section À propos
   Quand la section arrive à l'écran, un éventail de lames en relief
   (couleurs Indigo Steel) se déploie sur le titre, tourne sur lui-même
   puis s'envole en spirale vers le haut à droite, et le titre apparaît
   à la place qu'il libère.
   ========================================================== */
(function () {
  var head = document.querySelector('[data-eclat]');
  if (!head) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window) || !Element.prototype.animate) {
    head.classList.add('is-revealed');
    return;
  }

  // [couleur, longueur, largeur] : grandes lames dehors, petites dedans (comme un bouquet)
  var LAMES = [
    ['#2C3E50', 150, 64], ['#34495E', 156, 66], ['#3A6B7A', 160, 68], ['#4CA1AF', 164, 70], ['#3A6B7A', 158, 66], ['#2C3E50', 150, 62],
    ['#7FBAC4', 112, 46], ['#A9D3D9', 116, 48], ['#4CA1AF', 118, 48], ['#A9D3D9', 112, 46], ['#7FBAC4', 106, 44],
    ['#C2D3D8', 74, 30], ['#FFFFFF', 78, 32], ['#C2D3D8', 72, 30], ['#E2F0F2', 66, 28]
  ];

  function jouer() {
    var h2 = head.querySelector('h2') || head;
    var r = h2.getBoundingClientRect();
    // pivot de l'éventail : sous le centre du titre, qu'il recouvre avant de s'envoler
    var k = Math.min(1.35, Math.max(0.8, r.width / 320));
    var px = r.left + r.width / 2, py = r.top + r.height * 1.1;

    var layer = document.createElement('div');
    layer.className = 'eclat-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    var total = LAMES.length, fin = 0;
    LAMES.forEach(function (l, i) {
      var b = document.createElement('span');
      b.className = 'eclat-lame';
      b.style.cssText = '--c:' + l[0] + ';width:' + l[2] + 'px;height:' + l[1] + 'px;left:' + (px - l[2] / 2) + 'px;top:' + (py - l[1]) + 'px';
      b.style.width = (l[2] * k) + 'px'; b.style.height = (l[1] * k) + 'px';
      b.style.left = (px - l[2] * k / 2) + 'px'; b.style.top = (py - l[1] * k) + 'px';
      layer.appendChild(b);

      // position dans l'éventail : trois couronnes, de -70° à +70°
      var ring = i < 6 ? 0 : (i < 11 ? 1 : 2);
      var idx = ring === 0 ? i : (ring === 1 ? i - 6 : i - 11);
      var n = ring === 0 ? 6 : (ring === 1 ? 5 : 4);
      var base = -70 + idx * (140 / (n - 1)) + ring * 6;
      var tilt = 18 + ring * 14;
      // trajectoire : spirale vers le haut à droite, les petites lames partent en premier
      var dx = window.innerWidth * (0.35 + Math.random() * 0.4);
      var dy = -window.innerHeight * (0.25 + Math.random() * 0.35);
      var spin = 300 + Math.random() * 300;
      var pose = function (t, rot, s) { return 'translate(' + t + ') rotate(' + rot + 'deg) rotateY(' + tilt + 'deg) scale(' + s + ')'; };
      var anim = b.animate([
        { transform: pose('0,0', base - 40, 0.2), opacity: 0, offset: 0 },
        { transform: pose('0,0', base, 1), opacity: 1, offset: 0.2 },
        { transform: pose('0,0', base + 35, 1), opacity: 1, offset: 0.42 },
        { transform: pose((dx * 0.35) + 'px,' + (dy * 0.15) + 'px', base + 35 + spin * 0.4, 0.8), opacity: 1, offset: 0.66 },
        { transform: pose(dx + 'px,' + dy + 'px', base + 35 + spin, 0.18), opacity: 0, offset: 1 }
      ], {
        duration: 2000, delay: (2 - ring) * 90 + idx * 35,
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'both'
      });
      anim.onfinish = function () { if (++fin === total && layer.parentNode) layer.parentNode.removeChild(layer); };
    });
    // le titre apparaît quand l'éventail commence à s'envoler
    setTimeout(function () { head.classList.add('is-revealed'); }, 1050);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.disconnect();
      jouer();
    });
  }, { rootMargin: '0px 0px -30% 0px', threshold: 0.6 });
  io.observe(head);
})();
