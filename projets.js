/* ==========================================================
   « Le dé des projets »
   Un dé dont chaque face porte un projet. Le défilement le fait tourner :
   il marque une pause sur chaque face, et le projet correspondant s'affiche
   à côté. On peut aussi cliquer une pastille ou le dé pour passer au suivant.
   ========================================================== */
(function () {
  var track = document.querySelector('[data-de-projets]');
  if (!track) return;
  var cube = track.querySelector('.pd-cube');
  var details = Array.prototype.slice.call(track.querySelectorAll('.pd-detail'));
  var dots = Array.prototype.slice.call(track.querySelectorAll('.pd-dot'));
  var faces = Array.prototype.slice.call(track.querySelectorAll('.pd-face.side'));
  var N = details.length;
  if (!cube || N < 2) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var courant = -1;
  function afficher(i) {
    if (i === courant) return;
    courant = i;
    details.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    dots.forEach(function (d, k) {
      d.classList.toggle('is-on', k === i);
      d.setAttribute('aria-selected', k === i ? 'true' : 'false');
      d.tabIndex = k === i ? 0 : -1;
    });
    faces.forEach(function (f, k) { f.classList.toggle('is-front', k === i); });
  }

  function poser(angle) {
    cube.style.transform = 'rotateX(-14deg) rotateY(' + angle.toFixed(2) + 'deg)';
  }

  function clamp(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  /* ---------- Défilement : une pause par face, puis un quart de tour ---------- */
  var ticking = false;
  function mesurer() {
    var r = track.getBoundingClientRect();
    var haut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    var course = r.height - (window.innerHeight - haut);
    var p = clamp((haut - r.top) / Math.max(1, course));
    // une tranche de défilement par face : elle marque une pause, puis fait un quart de tour
    var pas = p * N;
    var q = Math.min(N - 1, Math.floor(pas));
    var u = clamp(pas - q);
    var tourne = q === N - 1 ? 0 : ease(clamp((u - 0.45) / 0.55));  // la dernière face n'a plus à tourner
    poser(-(q + tourne) * 90);
    afficher(u < 0.75 ? q : Math.min(q + 1, N - 1));
  }
  function auDefilement() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; mesurer(); });
  }

  /* ---------- Clic : on va directement à une face ---------- */
  var anim = null;
  function allerA(i) {
    if (reduceMotion) { poser(-i * 90); afficher(i); return; }
    if (anim) cancelAnimationFrame(anim);
    var depart = courant < 0 ? 0 : courant, t0 = null;
    afficher(i);
    (function frame(t) {
      if (t0 === null) t0 = t;
      var k = clamp((t - t0) / 700);
      poser(-(depart + (i - depart) * ease(k)) * 90);
      if (k < 1) anim = requestAnimationFrame(frame);
    })(performance.now());
  }

  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      // on se replace au bon endroit du défilement : la scène suit
      var haut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      // .pd-track n'est pas positionné par rapport à la page : on prend sa position absolue
      var hautTrack = track.getBoundingClientRect().top + window.scrollY;
      var course = track.offsetHeight - (window.innerHeight - haut);
      if (course < 60) { allerA(i); return; }   // petit écran : la scène ne défile pas, on tourne le dé
      var cible = hautTrack - haut + course * (i / (N - 1));
      window.scrollTo({ top: Math.round(cible) + 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    d.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : (e.key === 'ArrowLeft' ? i - 1 : -1);
      if (j < 0 || j >= N) return;
      e.preventDefault();
      dots[j].focus(); dots[j].click();
    });
  });

  if (reduceMotion) { poser(0); afficher(0); return; }

  window.addEventListener('scroll', auDefilement, { passive: true });
  window.addEventListener('resize', auDefilement);
  mesurer();
  // le dé se pose dès que la scène touche l'écran (elle fait plusieurs hauteurs : pas de seuil en %)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { track.classList.add('is-live'); io.disconnect(); }
    }, { threshold: 0 });
    io.observe(track);
  } else {
    track.classList.add('is-live');
  }
  if (window.allerAFaceProjet === undefined) window.allerAFaceProjet = allerA;
})();
