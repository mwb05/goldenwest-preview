/* =============================================================================
   Golden West Tire Centers — "The Road"
   Motion borrowed from driving: wheels that turn with the scroll, gauges that
   sweep to their reading, and a pinned stretch of road you travel to reach the
   17 stores. GSAP is optional; everything degrades.
   ============================================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var useGsap = hasGsap && !reduced;
  var mqMobile = window.matchMedia('(max-width: 860px)');

  if (useGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------- header ---------- */
  (function header() {
    var head = document.querySelector('.site-header');
    if (!head) return;
    var last = window.scrollY, idle = null;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (!head.classList.contains('nav-open')) {
        if (y > last && y > 240) head.classList.add('hidden');
        else head.classList.remove('hidden');
        if (mqMobile.matches) {
          clearTimeout(idle);
          idle = setTimeout(function () { head.classList.remove('hidden'); }, 220);
        }
      }
      last = y;
    }, { passive: true });
  })();

  /* ---------- mobile nav ---------- */
  (function nav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.getElementById('main-nav');
    var head = document.querySelector('.site-header');
    if (!toggle || !panel) return;
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      document.body.classList.toggle('nav-lock', open);
      if (head) { head.classList.toggle('nav-open', open); if (open) head.classList.remove('hidden'); }
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    mqMobile.addEventListener('change', function (e) { if (!e.matches) setOpen(false); });
  })();

  /* ---------- reveals + gauges (one observer) ---------- */
  (function reveals() {
    var targets = document.querySelectorAll('[data-reveal], .lines, .gauge');
    if (!('IntersectionObserver' in window) || reduced) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- gauges: set the dash geometry from data-pct ---------- */
  (function gauges() {
    document.querySelectorAll('.gauge-dial').forEach(function (dial) {
      var circle = dial.querySelector('.fill');
      if (!circle) return;
      var r = Number(circle.getAttribute('r')) || 26;
      // The dial is drawn as a 270-degree sweep, so the usable arc is 3/4 of the circle.
      var circumference = 2 * Math.PI * r;
      var arc = circumference * 0.75;
      var pct = Math.max(0, Math.min(1, Number(dial.getAttribute('data-pct') || 1)));
      dial.style.setProperty('--circ', circumference);
      dial.style.setProperty('--target', (circumference - arc * pct));
      circle.style.strokeDasharray = arc + ' ' + circumference;
    });
  })();

  /* ---------- wheels turn with the scroll ---------- */
  (function wheels() {
    var wheels = document.querySelectorAll('.wheel[data-spin]');
    if (!wheels.length || reduced) return;

    // Turn per pixel the wheel travels UP THE SCREEN, not per pixel of document
    // scrolled: absolute scrollY keeps climbing behind a pinned section, so the wheels
    // would whirl through hundreds of degrees while everything else sat still.
    var TURN = 0.35;
    var ticking = false;
    function frame() {
      wheels.forEach(function (w) {
        var svg = w.querySelector('svg');
        if (!svg) return;
        var top = w.getBoundingClientRect().top;
        svg.style.transform = 'rotate(' + ((window.innerHeight - top) * TURN) + 'deg)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(frame);
    }, { passive: true });
    frame();
  })();

  /* ---------- signature: the route ---------- */
  (function route() {
    var section = document.querySelector('.route');
    if (!section) return;
    var viewport = section.querySelector('.route-viewport');
    var track = section.querySelector('.route-track');
    var centre = section.querySelector('.route-centreline');
    var bar = section.querySelector('.route-bar i');
    var read = section.querySelector('.route-hud .read b');
    if (!viewport || !track) return;

    // Where each card sits along the track, so the HUD can name the one you're at.
    var cards = [].slice.call(track.querySelectorAll('.stop'));
    var regions = { '5865': 'Bakersfield', '5826': 'Long Beach', '5837': 'Orange County',
      '5824': 'Orange County', '5841': 'Orange County', '5833': 'Huntington Beach',
      '5877': 'Inland Empire', '5303': 'The desert' };
    function regionAt(progress) {
      if (!cards.length) return '';
      var i = Math.min(cards.length - 1, Math.floor(progress * cards.length));
      var label = (cards[i].querySelector('.exit') || {}).textContent || '';
      var num = (label.match(/[0-9]{4}/) || [])[0];
      return regions[num] || (cards[i].querySelector('h3') || {}).textContent || '';
    }

    // Without GSAP (or on a phone) the same markup is a native swipe rail.
    if (!useGsap || mqMobile.matches) {
      section.classList.add('is-static');
      return;
    }

    var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

    gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: viewport,
        start: 'center center',
        end: function () { return '+=' + distance(); },
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          // The centre line travels faster than the cards, so the road reads as
          // moving underneath them rather than with them.
          if (centre) centre.style.transform = 'translate(' + (-self.progress * 62) + '%, -50%)';
          if (bar) bar.style.transform = 'scaleX(' + self.progress + ')';
          if (read) {
            var label = regionAt(self.progress);
            if (label && read.textContent !== label) read.textContent = label;
          }
        }
      }
    });
  })();

  /* ---------- reviews wall: page, filter by store, truncate long reviews ---------- */
  // Cards are a fixed height; a review too long for its card is cut to the lines that fit
  // and gets a "Read more" toggle that opens the full text in place.
  (function reviews() {
    var section = document.querySelector('.reviews');
    if (!section) return;
    var cards = [].slice.call(section.querySelectorAll('.review'));
    var tools = section.querySelector('.review-tools');
    var select = section.querySelector('#review-filter');
    var more = section.querySelector('.review-more');
    var moreBtn = more && more.querySelector('button');
    if (!cards.length) return;

    var pageSize = mqMobile.matches ? 4 : 9;
    var shown = pageSize;

    function toggleFor(card) {
      var b = card.querySelector('.review-toggle');
      if (b) return b;
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'review-toggle';
      b.textContent = 'Read more';
      b.setAttribute('aria-expanded', 'false');
      b.hidden = true;
      b.addEventListener('click', function () {
        var open = card.classList.toggle('is-open');
        b.textContent = open ? 'Read less' : 'Read more';
        b.setAttribute('aria-expanded', String(open));
      });
      card.querySelector('p').insertAdjacentElement('afterend', b);
      return b;
    }

    // Measure only visible, collapsed cards (hidden ones have no layout to measure).
    function truncate(card) {
      if (card.hidden || card.classList.contains('is-open')) return;
      var p = card.querySelector('p');
      var b = card.querySelector('.review-toggle');
      card.classList.remove('has-toggle');
      p.style.webkitLineClamp = '';
      if (b) b.hidden = true;
      if (p.scrollHeight <= p.clientHeight + 1) return;
      b = toggleFor(card);
      b.hidden = false;
      card.classList.add('has-toggle');
      var lh = parseFloat(getComputedStyle(p).lineHeight) || 24;
      p.style.webkitLineClamp = String(Math.max(1, Math.floor((p.clientHeight + 1) / lh)));
    }

    function render() {
      var loc = select ? select.value : '';
      var matches = cards.filter(function (c) { return !loc || c.getAttribute('data-loc') === loc; });
      cards.forEach(function (c) { c.hidden = true; });
      matches.forEach(function (c, i) { c.hidden = i >= shown; });
      cards.forEach(truncate);
      var visible = Math.min(shown, matches.length);
      if (more) more.hidden = visible >= matches.length;
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { cards.forEach(truncate); }, 150);
    });
    // Web fonts change line metrics; re-measure once they land.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { cards.forEach(truncate); });

    if (tools) tools.hidden = false;
    if (select) select.addEventListener('change', function () { shown = pageSize; render(); });
    if (moreBtn) moreBtn.addEventListener('click', function () {
      var loc = select ? select.value : '';
      var first = cards.filter(function (c) { return c.hidden && (!loc || c.getAttribute('data-loc') === loc); })[0];
      shown += pageSize;
      render();
      // Hand keyboard users the first new review rather than leaving them on the button.
      if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
    });
    render();
  })();
  /* ---------- current year ---------- */
  (function year() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
  })();
})();
