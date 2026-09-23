/* ==========================================================
   Maquette « Améthyste épurée » — interactions
   Thème, menu mobile, lien actif, apparition, parcours, galerie, formulaire
   ========================================================== */
(function () {
  /* ---------- Textes de l'interface, en français et en anglais ----------
     La langue vient de l'attribut lang de <html> : les pages de en/ sont en anglais. */
  var LANGUE = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr';
  var TEXTES = {
    fr: {
      themeClair: 'Passer en mode clair', themeSombre: 'Passer en mode sombre',
      reduire: 'Réduire', voirDetail: 'Voir le détail',
      reduireDetail: 'Réduire le détail : ', afficherDetail: 'Afficher le détail : ',
      fermerMenu: 'Fermer le menu', ouvrirMenu: 'Ouvrir le menu',
      mots: ['curieuse', 'rigoureuse', 'créative', 'orientée solutions'],
      erreurNom: 'Merci d’indiquer votre nom.',
      erreurEmail: 'Merci d’indiquer une adresse e-mail valide.',
      erreurMessage: 'Votre message est un peu court (10 caractères minimum).',
      envoye: 'Merci ! Votre message a bien été envoyé. Je vous réponds au plus vite.',
      secoursDebut: 'L’envoi automatique est indisponible. ',
      secoursLien: 'Ouvrez votre messagerie avec ce message déjà rempli',
      secoursFin: ', ou écrivez-moi à agoezoolimela@gmail.com.',
      sujet: 'Message depuis le portfolio', champNom: 'Nom', champEmail: 'E-mail',
      ecrans: [
        'Tableau de bord — indicateurs de stock, encaissements et tâches à traiter',
        'Statistiques — tableau de bord configurable par widgets et période',
        'Articles — liste avec seuils d’alerte, prix et niveaux de stock',
        'Mouvements — entrées, sorties, transferts et ajustements de stock',
        'Bons de commande — suivi des achats fournisseurs et de leurs statuts',
        'Livraisons — expéditions en cours et documents associés',
        'Réapprovisionnement — règles de seuil et alertes automatiques',
        'Notifications — alertes de stock critique et messagerie interne'
      ],
      ecran: 'Écran '
    },
    en: {
      themeClair: 'Switch to light mode', themeSombre: 'Switch to dark mode',
      reduire: 'Collapse', voirDetail: 'See the detail',
      reduireDetail: 'Collapse the detail: ', afficherDetail: 'Show the detail: ',
      fermerMenu: 'Close the menu', ouvrirMenu: 'Open the menu',
      mots: ['curious', 'rigorous', 'creative', 'solution-driven'],
      erreurNom: 'Please give your name.',
      erreurEmail: 'Please give a valid email address.',
      erreurMessage: 'Your message is a little short (10 characters minimum).',
      envoye: 'Thank you! Your message has been sent. I will answer shortly.',
      secoursDebut: 'Automatic sending is unavailable. ',
      secoursLien: 'Open your mail app with this message already filled in',
      secoursFin: ', or write to me at agoezoolimela@gmail.com.',
      sujet: 'Message from the portfolio', champNom: 'Name', champEmail: 'Email',
      ecrans: [
        'Dashboard — stock indicators, payments received and tasks to handle',
        'Statistics — dashboard configurable by widget and period',
        'Items — list with alert thresholds, prices and stock levels',
        'Movements — stock in, out, transfers and adjustments',
        'Purchase orders — tracking supplier orders and their status',
        'Deliveries — shipments in progress and related documents',
        'Replenishment — threshold rules and automatic alerts',
        'Notifications — low-stock alerts and internal messaging'
      ],
      ecran: 'Screen '
    }
  };
  var T = TEXTES[LANGUE];
  /* Les pages anglaises vivent dans en/ : les fichiers communs sont un cran plus haut. */
  var RACINE = LANGUE === 'en' ? '../' : '';

  'use strict';

  var doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Thème clair / sombre ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  var metaTheme = document.getElementById('meta-theme-color');
  function currentTheme() { return doc.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function applyTheme(theme, persist) {
    doc.setAttribute('data-theme', theme);
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0C1A2C' : '#FFFFFF');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
      themeToggle.setAttribute('aria-label', theme === 'dark' ? T.themeClair : T.themeSombre);
    }
    if (persist) { try { localStorage.setItem('theme', theme); } catch (e) { /* stockage indisponible */ } }
  }
  applyTheme(currentTheme(), false);
  if (themeToggle) themeToggle.addEventListener('click', function () { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true); });

  /* ---------- Compétences : cascade des puces et des certifications ---------- */
  var skills = document.getElementById('competences');
  if (skills) {
    skills.querySelectorAll('.chip').forEach(function (chip, i) { chip.style.setProperty('--i', i); });
    skills.querySelectorAll('.cert').forEach(function (cert, i) { cert.style.setProperty('--i', i); });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      skills.classList.add('is-inview');
    } else {
      var skillsObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { skills.classList.add('is-inview'); obs.disconnect(); }
        });
      }, { threshold: 0.12 });
      skillsObserver.observe(skills);
    }
  }

  /* ---------- Parcours : compteurs, mini-frise, étapes dépliables, ligne qui se remplit ---------- */
  var timeline = document.querySelector('.timeline');
  var timelineItems = timeline ? Array.prototype.slice.call(timeline.querySelectorAll('.timeline-item')) : [];
  var mapSteps = Array.prototype.slice.call(document.querySelectorAll('.map-step'));
  var LINE_TOP = 34;    // la ligne démarre 34 px au-dessus de la liste (nœud « Aujourd'hui »)
  var LINE_BOTTOM = 12; // et s'arrête 12 px avant sa fin

  function updateTimeline() {
    if (!timeline) return;
    var rect = timeline.getBoundingClientRect();
    var lineTop = rect.top - LINE_TOP;
    var lineHeight = rect.height + LINE_TOP - LINE_BOTTOM;
    var focusY = window.innerHeight * 0.6;
    var p = Math.max(0, Math.min(1, (focusY - lineTop) / lineHeight));
    var wrap = timeline.parentNode;
    timeline.style.setProperty('--p', p.toFixed(3));
    if (wrap) wrap.style.setProperty('--p', p.toFixed(3));
    var fillY = lineTop + p * lineHeight;
    var lastLit = -1;
    timelineItems.forEach(function (item, i) {
      var marker = item.querySelector('.timeline-marker');
      if (!marker) return;
      var m = marker.getBoundingClientRect();
      var lit = m.top + m.height / 2 <= fillY + 1;
      item.classList.toggle('is-lit', lit);
      if (lit) lastLit = i;
    });
    mapSteps.forEach(function (step, i) {
      step.classList.toggle('is-lit', i <= lastLit);
      step.classList.toggle('is-active', i === lastLit);
      if (i === lastLit) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
    });
  }

  function setStep(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelectorAll('[aria-expanded]').forEach(function (btn) { btn.setAttribute('aria-expanded', String(open)); });
    var toggleLabel = item.querySelector('.tl-toggle-label');
    if (toggleLabel) toggleLabel.textContent = open ? T.reduire : T.voirDetail;
    var marker = item.querySelector('.timeline-marker');
    if (marker) {
      var title = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
      marker.setAttribute('aria-label', (open ? T.reduireDetail : T.afficherDetail) + title);
    }
  }

  timelineItems.forEach(function (item) {
    item.querySelectorAll('.timeline-marker, .tl-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () { setStep(item, !item.classList.contains('is-open')); });
    });
  });

  mapSteps.forEach(function (step) {
    step.addEventListener('click', function () {
      var item = timelineItems[parseInt(step.getAttribute('data-step'), 10)];
      if (!item) return;
      setStep(item, true);
      var top = item.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - (header ? header.offsetHeight : 0) - 24;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* Compteurs qui s'incrémentent à l'arrivée sur la section */
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat-num[data-count], .figure-num[data-count]'));
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = null, duration = 1300;
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var counterObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    }
  }

  /* ---------- À propos : mot tournant ---------- */
  var rotatorWord = document.getElementById('rotator-word');
  if (rotatorWord && !reduceMotion) {
    var rotatorWords = T.mots;
    var rotatorIndex = 0;
    window.setInterval(function () {
      rotatorWord.classList.add('is-out');
      window.setTimeout(function () {
        rotatorIndex = (rotatorIndex + 1) % rotatorWords.length;
        rotatorWord.textContent = rotatorWords[rotatorIndex];
        rotatorWord.classList.remove('is-out');
        // relance l'animation d'entrée
        rotatorWord.style.animation = 'none';
        void rotatorWord.offsetWidth;
        rotatorWord.style.animation = '';
      }, 340);
    }, 2800);
  }

  /* ---------- À propos : le texte s'éclaire au fil du défilement ---------- */
  var scrollTexts = Array.prototype.slice.call(document.querySelectorAll('.scroll-text'));
  function wrapWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          frag.appendChild(span);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        wrapWords(child);
      }
    });
  }
  var scrollTextWords = [];
  scrollTexts.forEach(function (p) {
    wrapWords(p);
    scrollTextWords.push(Array.prototype.slice.call(p.querySelectorAll('.w')));
  });

  function updateScrollText() {
    if (!scrollTexts.length) return;
    var vh = window.innerHeight;
    scrollTexts.forEach(function (p, i) {
      var rect = p.getBoundingClientRect();
      var start = vh * 0.88;                 // le paragraphe commence à s'éclairer en entrant par le bas
      var end = vh * 0.6;                    // et il est entièrement lu avant d’atteindre le milieu de l’écran
      var ratio = (start - rect.top) / (rect.height + (start - end));
      ratio = Math.max(0, Math.min(1, ratio));
      var words = scrollTextWords[i];
      var lit = Math.round(ratio * words.length);
      words.forEach(function (w, k) { w.classList.toggle('lit', k < lit); });
    });
  }
  if (reduceMotion) {
    scrollTextWords.forEach(function (words) { words.forEach(function (w) { w.classList.add('lit'); }); });
    updateScrollText = function () {};
  }

  /* ---------- En-tête & bouton haut de page ---------- */
  var header = document.getElementById('topbar');
  var backToTop = document.getElementById('back-to-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
    updateActiveLink(y);
    updateTimeline();
    updateScrollText();
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? T.fermerMenu : T.ouvrirMenu);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); navToggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
    });
    var desktop = window.matchMedia('(min-width: 861px)');
    if (desktop.addEventListener) desktop.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Lien actif ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = navLinks.map(function (l) { var h = l.getAttribute('href') || ''; return h.charAt(0) === '#' ? document.querySelector(h) : null; }).filter(Boolean);

  function updateActiveLink(y) {
    if (!sections.length) return;
    var offset = (header ? header.offsetHeight : 0) + 120;
    var atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
    var current = '';
    if (atBottom) current = sections[sections.length - 1].id;
    else for (var i = 0; i < sections.length; i++) if (sections[i].offsetTop - offset <= y) current = sections[i].id;
    navLinks.forEach(function (link) {
      var on = link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Apparition au défilement ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.classList.contains('reveal')) child.style.transitionDelay = (i * 90) + 'ms';
    });
  });

  function show(el) {
    el.classList.add('is-visible');
    var done = function () {
      el.classList.remove('reveal', 'is-visible');
      el.style.transitionDelay = '';
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done);
    window.setTimeout(done, 1400);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Année ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Formulaire ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var fields = {
      name: { el: document.getElementById('name'), error: document.getElementById('name-error') },
      email: { el: document.getElementById('email'), error: document.getElementById('email-error') },
      message: { el: document.getElementById('message'), error: document.getElementById('message-error') }
    };

    function setError(field, message) {
      field.error.textContent = message || '';
      field.el.setAttribute('aria-invalid', message ? 'true' : 'false');
      field.el.closest('.field').classList.toggle('has-error', Boolean(message));
    }
    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message || '';
      status.className = 'form-status' + (type ? ' is-' + type : '');
    }
    function validate() {
      var ok = true;
      if (fields.name.el.value.trim().length < 2) { setError(fields.name, T.erreurNom); ok = false; } else setError(fields.name, '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.el.value.trim())) { setError(fields.email, T.erreurEmail); ok = false; } else setError(fields.email, '');
      if (fields.message.el.value.trim().length < 10) { setError(fields.message, T.erreurMessage); ok = false; } else setError(fields.message, '');
      return ok;
    }
    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener('input', function () { setError(fields[key], ''); });
    });

    /* Si le service d'envoi ne répond pas, le message n'est pas perdu : on prépare
       un courriel déjà rempli avec ce que la personne vient d'écrire. */
    function secours() {
      var corps = T.champNom + ' : ' + fields.name.el.value.trim()
        + '\n' + T.champEmail + ' : ' + fields.email.el.value.trim()
        + '\n\n' + fields.message.el.value.trim();
      var lien = 'mailto:agoezoolimela@gmail.com'
        + '?subject=' + encodeURIComponent(T.sujet)
        + '&body=' + encodeURIComponent(corps);
      if (!status) return;
      status.className = 'form-status is-error';
      status.textContent = '';
      var p = document.createElement('span');
      p.textContent = T.secoursDebut;
      var a = document.createElement('a');
      a.href = lien;
      a.textContent = T.secoursLien;
      var fin = document.createElement('span');
      fin.textContent = T.secoursFin;
      status.appendChild(p); status.appendChild(a); status.appendChild(fin);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      if (!validate()) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) { form.reset(); setStatus(T.envoye, 'success'); return; }

      form.classList.add('is-sending');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (response) {
          if (response.ok) { form.reset(); setStatus(T.envoye, 'success'); return; }
          return response.json().then(function (data) {
            var detail = data && data.errors ? data.errors.map(function (err) { return err.message; }).join(' ') : '';
            throw new Error(detail || 'Réponse inattendue du service.');
          });
        })
        .catch(function () { secours(); })
        .then(function () { form.classList.remove('is-sending'); });
    });
  }

  /* ---------- Galerie des écrans de STEA ---------- */
  var gallery = document.getElementById('galerie-stea');
  if (gallery && typeof gallery.showModal === 'function') {
    var screens = [
      { src: RACINE + 'assets/stea/tableau-de-bord-vue-desktop.webp', cap: T.ecrans[0] },
      { src: RACINE + 'assets/stea/statistiques-widgets-desktop.webp', cap: T.ecrans[1] },
      { src: RACINE + 'assets/stea/articles-liste-desktop.webp', cap: T.ecrans[2] },
      { src: RACINE + 'assets/stea/mouvements-liste-desktop.webp', cap: T.ecrans[3] },
      { src: RACINE + 'assets/stea/bons-de-commande-liste-desktop.webp', cap: T.ecrans[4] },
      { src: RACINE + 'assets/stea/livraisons-liste-desktop.webp', cap: T.ecrans[5] },
      { src: RACINE + 'assets/stea/reapprovisionnement-liste-desktop.webp', cap: T.ecrans[6] },
      { src: RACINE + 'assets/stea/notifications-vue-desktop.webp', cap: T.ecrans[7] }
    ];
    var gImg = document.getElementById('gallery-img');
    var gCap = document.getElementById('gallery-cap');
    var gCount = document.getElementById('gallery-count');
    var gThumbs = document.getElementById('gallery-thumbs');
    var current = 0;
    var lastTrigger = null;

    screens.forEach(function (sc, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', T.ecran + (i + 1) + ' : ' + sc.cap);
      var im = document.createElement('img');
      im.src = sc.src; im.alt = ''; im.loading = 'lazy';
      b.appendChild(im);
      b.addEventListener('click', function () { showScreen(i); });
      gThumbs.appendChild(b);
    });

    function showScreen(i) {
      current = (i + screens.length) % screens.length;
      gImg.src = screens[current].src;
      gImg.alt = screens[current].cap;
      gCap.textContent = screens[current].cap;
      gCount.textContent = (current + 1) + ' / ' + screens.length;
      Array.prototype.forEach.call(gThumbs.children, function (b, k) {
        b.classList.toggle('is-current', k === current);
        if (k === current && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    function openGallery(i, trigger) {
      lastTrigger = trigger || null;
      showScreen(i);
      gallery.showModal();
      document.body.classList.add('gallery-open');
      var closeBtn = document.getElementById('gallery-close');
      if (closeBtn) closeBtn.focus();
    }

    document.querySelectorAll('[data-gallery-open]').forEach(function (el) {
      el.addEventListener('click', function () { openGallery(parseInt(el.getAttribute('data-gallery-open'), 10) || 0, el); });
    });
    document.getElementById('gallery-close').addEventListener('click', function () { gallery.close(); });
    document.getElementById('gallery-prev').addEventListener('click', function () { showScreen(current - 1); });
    document.getElementById('gallery-next').addEventListener('click', function () { showScreen(current + 1); });
    gallery.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showScreen(current - 1);
      if (e.key === 'ArrowRight') showScreen(current + 1);
    });
    gallery.addEventListener('click', function (e) { if (e.target === gallery) gallery.close(); });
    gallery.addEventListener('close', function () {
      document.body.classList.remove('gallery-open');
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    });
  }

})();
