/* ============================================
   POMOBORROW — GSAP ScrollTrigger Animations
   ============================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    initFallbackReveals();
    initHeroScroll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---- Hero scroll-driven phases ----
  initHeroScroll();

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
    if (isNaN(target)) return;
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

  // ---- Hero scroll handler (4-act hourglass) ----
  function initHeroScroll() {
    var heroSection = document.getElementById('hero');
    if (!heroSection) return;

    var textAct1 = document.getElementById('text-act1');
    var textAct2 = document.getElementById('text-act2');
    var textAct3 = document.getElementById('text-act3');
    var textAct4 = document.getElementById('text-act4');
    var hoursCounter = document.getElementById('hours-counter');
    var heroCounter = textAct1 ? textAct1.querySelector('.hero-counter') : null;
    var ringDissection = document.getElementById('ring-dissection');

    // Entrance animation for Act 1
    if (textAct1 && typeof gsap !== 'undefined') {
      gsap.from('#text-act1 h1', { opacity: 0, y: 30, duration: 0.8, delay: 0.4, ease: 'power2.out' });
      gsap.from('#text-act1 p', { opacity: 0, y: 20, duration: 0.6, delay: 0.6, ease: 'power2.out' });
      gsap.from('#text-act1 .hero-counter', { opacity: 0, y: 20, duration: 0.6, delay: 0.8, ease: 'power2.out' });
    }

    window.addEventListener('scroll', function () {
      var rect = heroSection.getBoundingClientRect();
      var totalScroll = heroSection.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      var progress = Math.max(0, Math.min(1, -rect.top / totalScroll));

      // Hide all fixed hero elements once past the hero section
      var pastHero = rect.bottom < 0;
      var allHeroFixed = [textAct1, textAct2, textAct3, textAct4, ringDissection];
      allHeroFixed.forEach(function (el) {
        if (el) el.style.display = pastHero ? 'none' : '';
      });

      if (pastHero) return;

      // Pass progress to Three.js
      if (window.heroAnimation) {
        window.heroAnimation.setProgress(progress);
      }

      // ---- ACT 1: 0.00 - 0.25 ----
      if (progress < 0.25) {
        if (textAct1) textAct1.style.opacity = 1;
        if (textAct2) textAct2.style.opacity = 0;
        if (textAct3) textAct3.style.opacity = 0;
        if (textAct4) { textAct4.style.opacity = 0; textAct4.style.pointerEvents = 'none'; }
        if (ringDissection) ringDissection.style.opacity = 0;

        // No counter in Act 1 — just the $86,400 quote
      }
      // ---- ACT 2: 0.25 - 0.50 ----
      else if (progress < 0.50) {
        var fadeIn2 = Math.min(1, (progress - 0.25) / 0.08);
        if (textAct1) textAct1.style.opacity = 1 - fadeIn2;
        if (textAct2) textAct2.style.opacity = fadeIn2;
        if (textAct3) textAct3.style.opacity = 0;
        if (textAct4) { textAct4.style.opacity = 0; textAct4.style.pointerEvents = 'none'; }
        if (ringDissection) ringDissection.style.opacity = 0;

        // Counter counts DOWN from 86,400 as sand leaks
        if (hoursCounter) {
          var subProgress = (progress - 0.25) / 0.25;
          var remaining = Math.floor(86400 - (subProgress * 86400));
          hoursCounter.textContent = remaining.toLocaleString();
        }
      }
      // ---- ACT 3: 0.50 - 0.75 ----
      else if (progress < 0.75) {
        var fadeIn3 = Math.min(1, (progress - 0.50) / 0.08);
        if (textAct1) textAct1.style.opacity = 0;
        if (textAct2) textAct2.style.opacity = 1 - fadeIn3;
        if (textAct3) textAct3.style.opacity = fadeIn3;
        if (textAct4) { textAct4.style.opacity = 0; textAct4.style.pointerEvents = 'none'; }
        if (ringDissection) ringDissection.style.opacity = 0;
      }
      // ---- ACT 4: 0.75 - 1.00 ----
      else {
        var fadeIn4 = Math.min(1, (progress - 0.75) / 0.10);
        if (textAct1) textAct1.style.opacity = 0;
        if (textAct2) textAct2.style.opacity = 0;
        if (textAct3) textAct3.style.opacity = 1 - fadeIn4;
        if (textAct4) {
          textAct4.style.opacity = fadeIn4;
          textAct4.style.pointerEvents = fadeIn4 > 0.5 ? 'auto' : 'none';
        }

        // Dissection labels
        if (ringDissection) {
          var dissectionFade = Math.min(1, Math.max(0, (progress - 0.88) / 0.08));
          ringDissection.style.opacity = dissectionFade;
        }
      }
    });
  }

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
