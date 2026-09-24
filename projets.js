/* ==========================================================
   « Le dé lanceur »
   Un petit dé roule le long d'une piste. À chaque arrêt il se penche et
   déverse un projet : la capture et sa description apparaissent au-dessus,
   dans une lumière à la couleur du projet. On continue à faire défiler :
   le projet s'en va, le dé repart en roulant vers la gauche, et il livre
   le suivant. Tout est piloté par le défilement.
   ========================================================== */
(function () {
  var track = document.querySelector('[data-de-lanceur]');
  if (!track) return;
  var de = track.querySelector('.dl-de');
  var piste = track.querySelector('.dl-piste');
  var projets = Array.prototype.slice.call(track.querySelectorAll('.dl-projet'));
  var puces = Array.prototype.slice.call(track.querySelectorAll('.dl-puce'));
  var halo = track.querySelector('.dl-halo');
  var N = projets.length;
  if (!de || !N) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function doux(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  var courant = -2;
  function montrer(i) {
    if (i === courant) return;
    courant = i;
    projets.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    puces.forEach(function (p, k) {
      p.classList.toggle('is-on', k === i);
      p.setAttribute('aria-selected', k === i ? 'true' : 'false');
      p.tabIndex = k === i ? 0 : -1;
    });
    if (halo && i >= 0) halo.style.setProperty('--c', projets[i].getAttribute('data-c') || '#4CA1AF');
    track.classList.toggle('a-livre', i >= 0);
  }

  /* Le dé roule : il avance et fait un quart de tour par côté parcouru. */
  var rayon = track.querySelector('.dl-rayon');
  function poser(x, penche) {
    de.style.transform = 'translateX(' + x.toFixed(1) + 'px) translateY(' + (-penche * 16).toFixed(1) + 'px)';
    // le faisceau part du dé : il le suit et s'ouvre au moment où il déverse
    if (rayon) {
      rayon.style.setProperty('--x', x.toFixed(1) + 'px');
      rayon.style.setProperty('--ouvert', penche.toFixed(3));
    }
  }

  var ticking = false;
  function mesurer() {
    var r = track.getBoundingClientRect();
    var haut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    var course = r.height - (window.innerHeight - haut);
    var p = clamp((haut - r.top) / Math.max(1, course));
    var largeur = piste ? Math.max(120, piste.clientWidth - (de.offsetWidth || 74)) : 300;

    // une tranche de défilement par projet : le dé roule, livre, puis repart
    var pas = p * N;
    var i = Math.min(N - 1, Math.floor(pas));
    var u = clamp(pas - i);

    var x, penche = 0, livre = false;
    var dernier = i === N - 1;
    if (u < 0.88 || dernier) {               // il roule vers la droite pendant tout le défilement
      x = largeur * clamp(u / 0.88);
      penche = Math.sin(clamp((u - 0.1) / 0.12) * Math.PI);   // il se penche pour déverser, en chemin
      livre = u > 0.14;
    } else {                                 // dernière fraction : il repart vite vers la gauche
      x = largeur * (1 - doux(clamp((u - 0.88) / 0.12)));
    }
    poser(x, penche);
    montrer(livre ? i : -1);
    if (halo) halo.style.opacity = (livre ? 1 : 0).toFixed(2);
    if (rayon) {
      rayon.style.opacity = (livre ? 1 : 0).toFixed(2);
      if (livre) rayon.style.setProperty('--c', projets[i].getAttribute('data-c') || '#4CA1AF');
    }
  }
  function auDefilement() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; mesurer(); });
  }

  /* Les pastilles amènent directement au projet voulu. */
  puces.forEach(function (b, i) {
    b.addEventListener('click', function () {
      var haut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      var hautTrack = track.getBoundingClientRect().top + window.scrollY;
      var course = track.offsetHeight - (window.innerHeight - haut);
      if (course < 60) { montrer(i); return; }   // petit écran : la scène ne défile pas
      var cible = hautTrack - haut + course * ((i + 0.5) / N);
      window.scrollTo({ top: Math.round(cible), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    b.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : (e.key === 'ArrowLeft' ? i - 1 : -1);
      if (j < 0 || j >= N) return;
      e.preventDefault();
      puces[j].focus(); puces[j].click();
    });
  });

  if (reduceMotion) {
    projets.forEach(function (p) { p.classList.add('is-on'); });
    track.classList.add('a-livre', 'sans-animation');
    return;
  }

  window.addEventListener('scroll', auDefilement, { passive: true });
  window.addEventListener('resize', auDefilement);
  mesurer();
})();
