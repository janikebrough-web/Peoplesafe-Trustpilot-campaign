(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Header scroll state ----------
  var header = document.getElementById('siteHeader');
  var lastScrolled = false;
  function onScroll() {
    var scrolled = window.scrollY > 40;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav toggle ----------
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.getElementById('siteNav').addEventListener('click', function (e) {
    if (e.target.tagName === 'A') header.classList.remove('nav-open');
  });

  // ---------- Count-up numbers ----------
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  // ---------- Bar fills ----------
  function animateBar(el) {
    var pct = el.getAttribute('data-pct');
    requestAnimationFrame(function () {
      el.style.width = pct + '%';
    });
  }

  // ---------- Scroll reveal + trigger counters/bars ----------
  var revealEls = document.querySelectorAll('.reveal');
  var countEls = document.querySelectorAll('.count-up');
  var barEls = document.querySelectorAll('.bar__fill');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countObserver.observe(el); });

    var barObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateBar(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    barEls.forEach(function (el) { barObserver.observe(el); });
  } else {
    // Fallback: reveal everything immediately
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    countEls.forEach(animateCount);
    barEls.forEach(animateBar);
  }
})();
