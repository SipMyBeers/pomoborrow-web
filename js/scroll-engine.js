/* ============================================
   POMOBORROW — GSAP ScrollTrigger Animations
   ============================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Fallback: use IntersectionObserver for reveals
    initFallbackReveals();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---- Global reveal animations ----
  var revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(function (el) {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // ---- Hero entrance ----
  var heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, delay: 0.2, ease: 'power2.out' });
    gsap.from('.hero h1', { opacity: 0, y: 30, duration: 0.8, delay: 0.4, ease: 'power2.out' });
    gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 0.6, delay: 0.6, ease: 'power2.out' });
    gsap.from('.hero-ctas', { opacity: 0, y: 20, duration: 0.6, delay: 0.8, ease: 'power2.out' });
  }

  // ---- Floating stats ----
  gsap.utils.toArray('.hero-stat').forEach(function (stat, i) {
    gsap.from(stat, {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      delay: 1 + i * 0.2,
      ease: 'back.out(1.7)',
    });

    // Floating animation
    gsap.to(stat, {
      y: '+=8',
      duration: 2 + i * 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  // ---- Problem section: timer mockup dissolve ----
  var timerMockup = document.querySelector('.timer-mockup');
  if (timerMockup) {
    ScrollTrigger.create({
      trigger: timerMockup,
      start: 'top 40%',
      onEnter: function () {
        setTimeout(function () {
          timerMockup.classList.add('dissolved');
        }, 1500);
      },
    });
  }

  // ---- Solution section: sensor cards stagger ----
  var sensorCards = gsap.utils.toArray('.sensor-card');
  sensorCards.forEach(function (card, i) {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onComplete: function () {
          card.classList.add('visible');
        },
      }
    );
  });

  // ---- Demo section entrance ----
  var demoWrap = document.querySelector('.demo-wrap');
  if (demoWrap) {
    gsap.from(demoWrap, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: demoWrap,
        start: 'top 75%',
      },
    });
  }

  // ---- Use case cards ----
  gsap.utils.toArray('.use-case-card').forEach(function (card, i) {
    gsap.from(card, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
    });
  });

  // ---- Privacy counters animation ----
  gsap.utils.toArray('.counter-number').forEach(function (counter) {
    var target = parseInt(counter.dataset.target, 10);
    var obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counter,
        start: 'top 80%',
      },
      onUpdate: function () {
        counter.textContent = Math.round(obj.val);
        if (counter.dataset.suffix) {
          counter.textContent += counter.dataset.suffix;
        }
      },
    });
  });

  // ---- ACE timeline phases ----
  gsap.utils.toArray('.ace-phase').forEach(function (phase, i) {
    gsap.from(phase, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: i * 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: phase,
        start: 'top 85%',
      },
    });
  });

  // ---- Cross-device section ----
  var devices = document.querySelector('.device-mockup-wrap');
  if (devices) {
    gsap.from('.device-phone', {
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: devices, start: 'top 75%' },
    });
    gsap.from('.device-laptop', {
      opacity: 0,
      x: 40,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: devices, start: 'top 75%' },
    });
  }

  // ---- CTA section ----
  var ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    gsap.from('.cta-content h2', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: ctaSection, start: 'top 70%' },
    });
  }

  // ---- Navbar scroll effect ----
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: function (self) {
      var nav = document.querySelector('.nav');
      if (nav) {
        if (self.progress > 0) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    },
  });

  // ---- Fallback for no GSAP ----
  function initFallbackReveals() {
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

    document.querySelectorAll('.reveal, .sensor-card').forEach(function (el) {
      observer.observe(el);
    });

    // Nav scroll
    window.addEventListener('scroll', function () {
      var nav = document.querySelector('.nav');
      if (nav) {
        if (window.scrollY > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    });
  }
})();
