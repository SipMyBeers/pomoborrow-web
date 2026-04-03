/* ============================================
   POMOBORROW — Main Interactions
   ============================================ */

(function () {
  'use strict';

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Waitlist form ----
  var form = document.getElementById('waitlist-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('.waitlist-input');
      var btn = form.querySelector('.waitlist-submit');
      var email = input.value.trim();

      if (!email || !email.includes('@')) {
        input.style.borderColor = '#EF4444';
        setTimeout(function () { input.style.borderColor = ''; }, 2000);
        return;
      }

      // Store locally (no server)
      var waitlist = JSON.parse(localStorage.getItem('pomoborrow_waitlist') || '[]');
      waitlist.push({ email: email, time: new Date().toISOString() });
      localStorage.setItem('pomoborrow_waitlist', JSON.stringify(waitlist));

      btn.textContent = 'You\'re in!';
      btn.style.background = '#10B981';
      input.value = '';
      input.disabled = true;
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = 'Join Waitlist';
        btn.style.background = '';
        input.disabled = false;
        btn.disabled = false;
      }, 3000);
    });
  }

  // ---- Navbar scroll (fallback if no GSAP) ----
  if (typeof gsap === 'undefined') {
    var nav = document.querySelector('.nav');
    if (nav) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      });
    }
  }

  // ---- Reduce motion preference ----
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--ease-out-expo', 'ease');
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.transition = 'none';
      el.classList.add('visible');
    });
  }

  // ---- Intersection Observer for sensor cards (fallback) ----
  if (typeof gsap === 'undefined') {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.sensor-card, .reveal').forEach(function (el) {
      observer.observe(el);
    });
  }
})();
