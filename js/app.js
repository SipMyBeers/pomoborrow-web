/* ══════════════════════════════════════════════════
   POMOBORROW — app.js
   Scroll reveals, ring, timeline, countdown, waitlist.
   Pure vanilla. Under 5KB.
   ══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Scroll Reveals ──
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ── Hero ring hover tooltips ──
  const ringTooltip = document.getElementById('ring-tooltip');
  document.querySelectorAll('.ring-hover-seg').forEach((seg) => {
    seg.addEventListener('mouseenter', () => {
      if (!ringTooltip) return;
      const activity = seg.dataset.activity;
      const time = seg.dataset.time;
      const dur = seg.dataset.dur;
      ringTooltip.innerHTML = `<span class="ring-tooltip-activity">${activity}</span><span class="ring-tooltip-time">${time}</span> · <span class="ring-tooltip-dur">${dur}</span>`;
      ringTooltip.classList.add('active');
    });
    seg.addEventListener('mouseleave', () => {
      if (ringTooltip) ringTooltip.classList.remove('active');
    });
  });

  // ── Event tick hover tooltips ──
  document.querySelectorAll('.event-tick').forEach((tick) => {
    tick.addEventListener('mouseenter', () => {
      if (!ringTooltip) return;
      const ev = tick.dataset.event;
      const when = tick.dataset.when;
      const where = tick.dataset.where;
      ringTooltip.innerHTML = `<span class="ring-tooltip-activity">${ev}</span><span class="ring-tooltip-time">${when}</span><br><span class="ring-tooltip-time">${where}</span>`;
      ringTooltip.classList.add('active');
    });
    tick.addEventListener('mouseleave', () => {
      if (ringTooltip) ringTooltip.classList.remove('active');
    });
  });

  // ── Phone screen switching ──
  window.switchScreen = function(screen) {
    const frame = document.querySelector('.phone-frame');
    if (!frame) return;
    // Hide all screens
    frame.querySelectorAll('.phone-screen').forEach(s => s.style.display = 'none');
    // Show target
    if (screen === 'today') {
      frame.querySelector('.phone-screen:not(.phone-screen-alt)').style.display = '';
    } else {
      const el = document.getElementById('screen-' + screen);
      if (el) el.style.display = '';
    }
    // Update all nav buttons across all screens
    frame.querySelectorAll('.app-nav-btn').forEach(btn => {
      btn.classList.toggle('app-nav-active', btn.dataset.screen === screen);
    });
  };

  document.querySelectorAll('.app-nav-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
  });

  // ── Mobile nav ──
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Day Ring ──
  const SEGMENTS = [
    { name: 'Sleep', hours: 7.5, color: '#5B8DEF' },
    { name: 'Commute', hours: 1, color: '#7A7A7A' },
    { name: 'Work', hours: 8, color: '#FF6B35' },
    { name: 'Gym', hours: 1.5, color: '#34D399' },
    { name: 'Errands', hours: 1, color: '#FBBF24' },
    { name: 'Downtime', hours: 3, color: '#A78BFA' },
    { name: 'Other', hours: 2, color: '#4B5563' },
  ];

  function buildRing() {
    const svg = document.getElementById('day-ring');
    if (!svg) return;

    const cx = 200, cy = 200, r = 160;
    const total = SEGMENTS.reduce((s, seg) => s + seg.hours, 0);
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    SEGMENTS.forEach((seg, i) => {
      const fraction = seg.hours / total;
      const dashLen = fraction * circumference;
      const dashOffset = -offset * circumference;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', seg.color);
      circle.setAttribute('stroke-width', '28');
      circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference - dashLen}`);
      circle.setAttribute('stroke-dashoffset', String(dashOffset));
      circle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
      circle.classList.add('segment');

      // Start hidden for scroll animation
      circle.style.strokeDashoffset = String(circumference);
      circle.dataset.target = String(dashOffset);
      circle.style.transitionDelay = `${i * 0.12}s`;

      svg.appendChild(circle);
      offset += fraction;
    });

    // Legend
    const legend = document.getElementById('ring-legend');
    if (legend) {
      SEGMENTS.forEach((seg) => {
        const item = document.createElement('div');
        item.className = 'ring-legend-item';
        item.innerHTML = `<span class="ring-legend-dot" style="background:${seg.color}"></span>${seg.name} (${seg.hours}h)`;
        legend.appendChild(item);
      });
    }

    // Scroll-trigger animation
    const ringObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            svg.querySelectorAll('.segment').forEach((c) => {
              c.style.strokeDashoffset = c.dataset.target;
            });
            ringObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    ringObserver.observe(svg);
  }

  buildRing();

  // ── Countdown to Midnight ──
  function updateCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    const el = document.getElementById('ring-countdown');
    if (el) el.textContent = `${h}:${m}:${s}`;
    const heroEl = document.getElementById('hero-countdown');
    if (heroEl) heroEl.textContent = `${h}:${m}:${s}`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── Timeline ──
  const TIMELINE_DATA = [
    { name: 'Sleep', start: '00:00', end: '07:30', color: '#5B8DEF', sensor: 'Motion + Patterns' },
    { name: 'Morning routine', start: '07:30', end: '08:15', color: '#A78BFA', sensor: 'Location + Motion' },
    { name: 'Commute', start: '08:15', end: '08:45', color: '#7A7A7A', sensor: 'Location + Motion' },
    { name: 'Work', start: '08:45', end: '12:30', color: '#FF6B35', sensor: 'Location + Devices + Sound' },
    { name: 'Lunch', start: '12:30', end: '13:15', color: '#FBBF24', sensor: 'Location + Motion' },
    { name: 'Work', start: '13:15', end: '17:30', color: '#FF6B35', sensor: 'Location + Devices + Sound' },
    { name: 'Gym', start: '17:30', end: '19:00', color: '#34D399', sensor: 'Location + Motion + Sound' },
    { name: 'Dinner', start: '19:00', end: '20:00', color: '#FBBF24', sensor: 'Location' },
    { name: 'Downtime', start: '20:00', end: '22:30', color: '#A78BFA', sensor: 'Devices + Patterns' },
    { name: 'Sleep', start: '22:30', end: '24:00', color: '#5B8DEF', sensor: 'Motion + Patterns' },
  ];

  function parseTime(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  }

  function buildTimeline() {
    const track = document.getElementById('timeline-track');
    const tooltip = document.getElementById('timeline-tooltip');
    if (!track) return;

    const totalMin = 24 * 60;

    TIMELINE_DATA.forEach((item) => {
      const startMin = parseTime(item.start);
      const endMin = parseTime(item.end);
      const duration = endMin - startMin;
      const pct = (duration / totalMin) * 100;

      const block = document.createElement('div');
      block.className = 'timeline-block';
      block.style.width = `${pct}%`;
      block.style.minWidth = `${Math.max(pct, 0.5)}%`;
      block.style.background = item.color;

      // Detail panel for click
      const detail = document.createElement('div');
      detail.className = 'detail-panel';
      detail.innerHTML = `<strong>${item.name}</strong><br>Detected by: ${item.sensor}`;
      block.appendChild(detail);

      // Hover tooltip
      block.addEventListener('mouseenter', (e) => {
        tooltip.textContent = `${item.name}  ${item.start} - ${item.end}  (${duration} min)`;
        tooltip.classList.add('active');
      });
      block.addEventListener('mousemove', (e) => {
        tooltip.style.left = `${e.clientX + 12}px`;
        tooltip.style.top = `${e.clientY - 40}px`;
      });
      block.addEventListener('mouseleave', () => {
        tooltip.classList.remove('active');
      });

      // Click expand
      block.addEventListener('click', () => {
        const wasExpanded = block.classList.contains('expanded');
        track.querySelectorAll('.timeline-block').forEach((b) => b.classList.remove('expanded'));
        if (!wasExpanded) block.classList.add('expanded');
      });

      track.appendChild(block);
    });
  }

  buildTimeline();

  // ── Waitlist Form ──
  const form = document.getElementById('waitlist-form');
  if (form) {
    // Load stored count
    const stored = localStorage.getItem('pb_waitlist');
    const countEl = document.getElementById('waitlist-count');
    if (stored && countEl) {
      countEl.innerHTML = `Join <strong>${parseInt(stored, 10)}</strong> people on the waitlist`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('waitlist-email');
      if (!email || !email.value) return;

      // Increment count
      let count = parseInt(localStorage.getItem('pb_waitlist') || '847', 10);
      count++;
      localStorage.setItem('pb_waitlist', String(count));
      localStorage.setItem('pb_waitlist_email', email.value);

      // UI feedback
      form.classList.add('success');
      email.value = '';
      email.placeholder = 'You\'re on the list!';

      if (countEl) {
        countEl.innerHTML = `Join <strong>${count}</strong> people on the waitlist`;
      }

      setTimeout(() => {
        form.classList.remove('success');
        email.placeholder = 'you@email.com';
      }, 3000);
    });
  }
})();
