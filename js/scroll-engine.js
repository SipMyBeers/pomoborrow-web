/* ============================================
   POMOBORROW — GSAP ScrollTrigger Animations
   ============================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Fallback: use IntersectionObserver for reveals
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

  // ---- Hero entrance (text overlays) ----
  var heroLoss = document.getElementById('hero-loss');
  if (heroLoss) {
    gsap.from('#hero-loss .badge', { opacity: 0, y: 20, duration: 0.6, delay: 0.3, ease: 'power2.out' });
    gsap.from('#hero-loss h1', { opacity: 0, y: 30, duration: 0.8, delay: 0.5, ease: 'power2.out' });
    gsap.from('#hero-loss p', { opacity: 0, y: 20, duration: 0.6, delay: 0.7, ease: 'power2.out' });
  }

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

  // ---- Hero scroll handler ----
  function initHeroScroll() {
    var heroSection = document.getElementById('hero');
    if (!heroSection) return;

    var heroLoss = document.getElementById('hero-loss');
    var heroCapture = document.getElementById('hero-capture');
    var heroReveal = document.getElementById('hero-reveal');
    var lostCounter = document.getElementById('lost-counter');
    var heroCounter = document.querySelector('.hero-counter');

    window.addEventListener('scroll', function () {
      var rect = heroSection.getBoundingClientRect();
      var totalScroll = heroSection.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      var progress = Math.max(0, Math.min(1, -rect.top / totalScroll));

      // Hide all fixed hero elements once past the hero section
      var pastHero = rect.bottom < 0;
      var allHeroFixed = [heroLoss, heroCapture, heroReveal, heroCounter];
      allHeroFixed.forEach(function (el) {
        if (el) el.style.display = pastHero ? 'none' : '';
      });

      if (pastHero) return;

      if (window.heroAnimation) {
        window.heroAnimation.scrollProgress = progress;

        // If user is scrolling, take over from auto-timer
        if (progress > 0.02) {
          window.heroAnimation.resetAutoTimer();
        }

        if (progress < 0.3) {
          window.heroAnimation.setPhase('loss');

          if (heroLoss) heroLoss.style.opacity = 1;
          if (heroCapture) heroCapture.style.opacity = 0;
          if (heroReveal) heroReveal.style.opacity = 0;

          // Counter ticks up
          if (lostCounter) {
            var hours = (progress / 0.3 * 14.2).toFixed(1);
            lostCounter.textContent = hours;
          }
          if (heroCounter) heroCounter.style.opacity = 1;

        } else if (progress < 0.6) {
          window.heroAnimation.setPhase('capture');

          // Crossfade: loss out, capture in
          var captureFade = (progress - 0.3) / 0.1; // 0-1 over the transition zone
          captureFade = Math.max(0, Math.min(1, captureFade));

          if (heroLoss) heroLoss.style.opacity = 1 - captureFade;
          if (heroCapture) heroCapture.style.opacity = captureFade;
          if (heroReveal) heroReveal.style.opacity = 0;

          if (lostCounter) lostCounter.textContent = '14.2';
          if (heroCounter) heroCounter.style.opacity = Math.max(0, 1 - captureFade * 2);

        } else {
          window.heroAnimation.setPhase('reveal');

          // Crossfade: capture out, reveal in
          var revealFade = (progress - 0.6) / 0.1;
          revealFade = Math.max(0, Math.min(1, revealFade));

          if (heroLoss) heroLoss.style.opacity = 0;
          if (heroCapture) heroCapture.style.opacity = 1 - revealFade;
          if (heroReveal) {
            heroReveal.style.opacity = revealFade;
            heroReveal.style.pointerEvents = revealFade > 0.5 ? 'auto' : 'none';
          }
          if (heroCounter) heroCounter.style.opacity = 0;
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
