/* ==========================================================
   Transitions « PowerPoint »
   Les transitions de diapositives, traduites pour le web, là où le
   portfolio change d'endroit :
   - un lien vers une section de la même page (menu, boutons) : « Pousser » —
     la vue part vers le haut et la section visée monte du bas (l'inverse
     quand on remonte), en 0,65 s, au lieu d'un long défilement ;
   - une autre page (accueil ↔ étude de cas) : la nouvelle page arrive par la
     droite, et par la gauche quand on revient en arrière ; le passage du
     français à l'anglais reste un simple fondu.
   L'en-tête ne bouge pas pendant la transition (il porte son propre
   view-transition-name). Rien de tout cela si l'on demande moins de
   mouvement, ni dans un navigateur qui ne connaît pas les View Transitions :
   on défile alors comme avant.
   Chargé dans le <head>, sans « defer » : l'écouteur « pagereveal » doit
   être posé avant le premier affichage de la page.
   ========================================================== */
(function () {
  var html = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- d'une page à l'autre ---------- */
  function langueDe(chemin) { return /\/en(\/|$)/.test(chemin) ? 'en' : 'fr'; }
  function pageDe(chemin) { return chemin.replace(/\/en(\/|$)/, '/').replace(/index\.html$/, ''); }

  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var type = 'avant';
    try {
      var act = window.navigation && window.navigation.activation;
      if (act && act.from && act.entry) {
        var de = new URL(act.from.url), vers = new URL(act.entry.url);
        if (pageDe(de.pathname) === pageDe(vers.pathname) && langueDe(de.pathname) !== langueDe(vers.pathname)) type = 'langue';
        else if (act.navigationType === 'traverse' && act.entry.index < act.from.index) type = 'retour';
      }
    } catch (err) { /* sans Navigation API : on garde « avant » */ }
    html.setAttribute('data-vt', type);
    e.viewTransition.ready.catch(function () { /* transition interrompue : rien à signaler */ });
    e.viewTransition.finished.then(fin, fin);
  });
  function fin() { html.removeAttribute('data-vt'); }

  /* ---------- dans la page : « Pousser » ---------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (reduit.matches || typeof document.startViewTransition !== 'function') return;
    var lien = e.target.closest ? e.target.closest('a[href*="#"]') : null;
    if (!lien || lien.target === '_blank' || lien.hasAttribute('download')) return;
    if (lien.origin !== location.origin || lien.pathname !== location.pathname || lien.hash.length < 2) return;
    if (lien.closest('dialog')) return;   /* dans la fiche d'un projet : on laisse faire */
    var cible = document.getElementById(decodeURIComponent(lien.hash.slice(1)));
    if (!cible) return;
    var avant = window.scrollY;
    var haut = cible.getBoundingClientRect().top + avant;
    /* tout près : un simple défilement suffit, une transition serait de trop */
    if (Math.abs(haut - avant) < window.innerHeight * 0.6) return;
    e.preventDefault();
    html.setAttribute('data-vt', haut > avant ? 'descend' : 'monte');
    var t = document.startViewTransition(function () {
      html.style.scrollBehavior = 'auto';
      cible.scrollIntoView({ block: 'start', behavior: 'instant' });
      html.style.scrollBehavior = '';
      if (location.hash !== lien.hash) history.pushState(null, '', lien.hash);
    });
    t.ready.catch(function () { /* transition interrompue : rien à signaler */ });
    t.finished.then(fin, fin);
    /* le focus suit la section, comme après un lien d'ancre ordinaire */
    t.updateCallbackDone.then(function () {
      if (!cible.hasAttribute('tabindex')) {
        cible.setAttribute('tabindex', '-1');
        cible.addEventListener('blur', function oter() { cible.removeAttribute('tabindex'); cible.removeEventListener('blur', oter); });
      }
      try { cible.focus({ preventScroll: true }); } catch (err) { /* ancien moteur */ }
    });
  });
})();
