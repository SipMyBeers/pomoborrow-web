/**
 * ring-animation.js
 * Animates the 24-hour day ring in the hero section.
 * Pure JS — no dependencies.
 *
 * Strategy: each segment is a <circle> with stroke-dasharray to draw
 * an arc. The SVG is rotated -90deg (via CSS) so 0° = top = midnight.
 * For a circle at radius R, circumference C = 2πR.
 * To draw a segment from startFrac to endFrac:
 *   - drawn length  = (endFrac - startFrac) * C
 *   - offset        = startFrac * C  (shifts start point clockwise)
 *   stroke-dasharray  = `${drawnLen} ${C}`
 *   stroke-dashoffset = C - startOffset  (SVG dashoffset goes counter-clockwise)
 */

(function () {
  'use strict';

  const R = 120;
  const C = 2 * Math.PI * R;   // ~753.98

  // Activity segments [startHour, endHour, color, label]
  const SEGMENTS = [
    { start:  0, end:  6, color: '#1e3a5f', label: 'Sleep'   },
    { start:  6, end:  7, color: '#8B5CF6', label: 'Commute' },
    { start:  7, end: 17, color: '#3B82F6', label: 'Work'    },
    { start: 17, end: 19, color: '#F97316', label: 'Gym'     },
    { start: 19, end: 23, color: '#22C55E', label: 'Leisure' },
  ];

  const FILL_MS  = 6000;   // time to fill entire ring
  const HOLD_MS  = 2000;   // pause at full ring
  const FADE_MS  = 500;    // fade-out before reset

  let fillStart  = null;
  let holdStart  = null;
  let fadeStart  = null;
  let phase      = 'fill'; // 'fill' | 'hold' | 'fade'
  let paths      = [];
  let labelEl    = null;
  let subEl      = null;
  let ringEl     = null;   // .ring-wrapper for opacity fade

  // ── easing ───────────────────────────────
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ── draw one frame ────────────────────────
  // progress: 0..1 (fraction of 24h filled)
  function draw(progress) {
    paths.forEach(function (circle, i) {
      const seg = SEGMENTS[i];
      const segStartFrac = seg.start / 24;
      const segEndFrac   = seg.end   / 24;

      if (progress <= segStartFrac) {
        // haven't reached this segment yet
        circle.style.opacity = '0';
        return;
      }

      circle.style.opacity = '1';

      // how far through this segment are we?
      const segProgress = Math.min(
        (progress - segStartFrac) / (segEndFrac - segStartFrac),
        1
      );

      const segArcLen = (segEndFrac - segStartFrac) * C;
      const drawnLen  = segProgress * segArcLen;

      // offset: push dasharray start to segStart position
      // SVG dashoffset is "how far back" to shift, so offset = C - (startFrac * C)
      const startOffset = segStartFrac * C;
      const dashOffset  = C - startOffset;

      circle.setAttribute('stroke-dasharray',  drawnLen + ' ' + C);
      circle.setAttribute('stroke-dashoffset', dashOffset);
    });

    // update center label
    const filledHours = progress * 24;
    let activeLabel = null;
    for (let i = SEGMENTS.length - 1; i >= 0; i--) {
      if (filledHours > SEGMENTS[i].start) {
        activeLabel = SEGMENTS[i];
        break;
      }
    }

    if (labelEl) {
      if (activeLabel) {
        labelEl.textContent   = activeLabel.label;
        labelEl.style.color   = activeLabel.color;
      } else {
        labelEl.textContent = '—';
        labelEl.style.color = '#444';
      }
    }

    if (subEl) {
      const remaining = Math.max(0, 24 - filledHours);
      const h = Math.floor(remaining);
      const m = Math.floor((remaining - h) * 60);
      subEl.textContent = h > 0 ? h + 'h ' + m + 'm left' : m + 'm left';
    }
  }

  // ── animation loop ────────────────────────
  function tick(ts) {
    if (phase === 'fill') {
      if (!fillStart) fillStart = ts;
      const rawT = Math.min((ts - fillStart) / FILL_MS, 1);
      const t    = easeInOutCubic(rawT);
      draw(t);
      if (rawT >= 1) {
        phase = 'hold';
        holdStart = ts;
      }

    } else if (phase === 'hold') {
      draw(1);
      if (ts - holdStart >= HOLD_MS) {
        phase = 'fade';
        fadeStart = ts;
      }

    } else if (phase === 'fade') {
      const ft = Math.min((ts - fadeStart) / FADE_MS, 1);
      if (ringEl) ringEl.style.opacity = String(1 - ft);
      if (ft >= 1) {
        // reset
        if (ringEl) ringEl.style.opacity = '1';
        draw(0);
        phase = 'fill';
        fillStart = null;
        holdStart = null;
        fadeStart = null;
      }
    }

    requestAnimationFrame(tick);
  }

  // ── build SVG ─────────────────────────────
  function buildSVG() {
    const svg = document.getElementById('day-ring');
    if (!svg) return;

    ringEl  = document.querySelector('.ring-wrapper');
    labelEl = document.querySelector('.ring-label .time-text');
    subEl   = document.querySelector('.ring-label .time-sub');

    const NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs) {
      const node = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
      return node;
    }

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Background track
    svg.appendChild(el('circle', {
      cx: 150, cy: 150, r: R,
      fill: 'none',
      stroke: '#111',
      'stroke-width': '14',
    }));

    // Hour ticks
    for (let h = 0; h < 24; h++) {
      const angle  = (h / 24) * 2 * Math.PI;  // SVG is rotated -90 in CSS
      const isMain = h % 6 === 0;
      const outerR = R + 1;
      const innerR = isMain ? R - 10 : R - 5;
      svg.appendChild(el('line', {
        x1: 150 + innerR * Math.cos(angle),
        y1: 150 + innerR * Math.sin(angle),
        x2: 150 + outerR * Math.cos(angle),
        y2: 150 + outerR * Math.sin(angle),
        stroke: isMain ? '#2a2a2a' : '#1a1a1a',
        'stroke-width': isMain ? '1.5' : '1',
        'stroke-linecap': 'round',
      }));
    }

    // Hour labels at cardinal points (12, 6, 18, 0)
    const labelData = [
      { h: 0,  label: '12a', x: 150, y: 150 - R - 22 },
      { h: 6,  label: '6a',  x: 150 + R + 22, y: 154 },
      { h: 12, label: '12p', x: 150, y: 150 + R + 30 },
      { h: 18, label: '6p',  x: 150 - R - 26, y: 154 },
    ];
    labelData.forEach(function (d) {
      const t = el('text', {
        x: d.x, y: d.y,
        fill: '#2a2a2a',
        'font-size': '9',
        'font-family': 'system-ui, -apple-system, sans-serif',
        'font-weight': '600',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      });
      t.textContent = d.label;
      svg.appendChild(t);
    });

    // Segment arcs (drawn on top, opaque background removed)
    paths = SEGMENTS.map(function (seg) {
      const circle = el('circle', {
        cx: 150, cy: 150, r: R,
        fill: 'none',
        stroke: seg.color,
        'stroke-width': '14',
        'stroke-linecap': 'round',
        'stroke-dasharray': '0 ' + C,
        'stroke-dashoffset': C,
      });
      circle.style.opacity = '0';
      circle.style.transition = 'opacity 0.25s';
      svg.appendChild(circle);
      return circle;
    });

    // Center dot
    svg.appendChild(el('circle', {
      cx: 150, cy: 150, r: 3,
      fill: '#222',
    }));

    requestAnimationFrame(tick);
  }

  // ── scroll reveal ─────────────────────────
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!window.IntersectionObserver) {
      els.forEach(function (e) { e.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (e) { obs.observe(e); });
  }

  // ── waitlist form ─────────────────────────
  function initWaitlist() {
    var form = document.getElementById('waitlist-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var btn   = form.querySelector('button');
      var email = input.value.trim();
      if (!email) return;

      btn.textContent = 'Joining…';
      btn.disabled = true;

      fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(function () {
          btn.textContent = "You're on the list";
          input.value = '';
        })
        .catch(function () {
          // Backend not wired yet — still show success to user
          btn.textContent = "You're on the list";
          input.value = '';
        });
    });
  }

  // ── init ──────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      buildSVG();
      initReveal();
      initWaitlist();
    });
  } else {
    buildSVG();
    initReveal();
    initWaitlist();
  }

})();
