/* ══════════════════════════════════════════════════
   POMOBORROW — app.js
   Gradient canvas, scroll reveals, ring, timeline,
   countdown, parallax, waitlist. Under 8KB.
   ══════════════════════════════════════════════════ */

// ─── Animated Gradient Background ───
class GradientBackground {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.time = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animate() {
    this.time += 0.002;
    const { ctx, canvas } = this;
    const w = canvas.width, h = canvas.height;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // Blob 1 — indigo
    const x1 = w * (0.3 + Math.sin(this.time) * 0.2);
    const y1 = h * (0.3 + Math.cos(this.time * 0.7) * 0.2);
    const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.5);
    g1.addColorStop(0, 'rgba(99,102,241,0.08)');
    g1.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // Blob 2 — purple
    const x2 = w * (0.7 + Math.sin(this.time * 0.5) * 0.2);
    const y2 = h * (0.7 + Math.cos(this.time * 0.3) * 0.2);
    const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.4);
    g2.addColorStop(0, 'rgba(139,92,246,0.06)');
    g2.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // Blob 3 — dark blue accent
    const x3 = w * (0.5 + Math.cos(this.time * 0.8) * 0.15);
    const y3 = h * (0.2 + Math.sin(this.time * 0.4) * 0.15);
    const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, w * 0.35);
    g3.addColorStop(0, 'rgba(30,58,95,0.07)');
    g3.addColorStop(1, 'rgba(30,58,95,0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(() => this.animate());
  }
}

// ─── Scroll Reveal (IntersectionObserver) ───
function initReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── Word-by-word Hero Title Animation ───
function initHeroTitle() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  const text = title.textContent.trim();
  const words = text.split(/\s+/);
  title.innerHTML = words.map((w, i) =>
    `<span class="word" style="animation-delay:${0.3 + i * 0.1}s">${w}</span>`
  ).join(' ');
}

// ─── Ring SVG Builder ───
function buildRing() {
  const svg = document.getElementById('ring-svg');
  if (!svg) return;

  const segments = [
    { label: 'Sleep',    minutes: 443, color: '#1e3a5f' },
    { label: 'Commute',  minutes: 30,  color: '#7c3aed' },
    { label: 'Deep Work', minutes: 287, color: '#3b82f6' },
    { label: 'Lunch',    minutes: 43,  color: '#eab308' },
    { label: 'Meetings', minutes: 90,  color: '#60a5fa' },
    { label: 'Deep Work', minutes: 195, color: '#3b82f6' },
    { label: 'Commute',  minutes: 30,  color: '#7c3aed' },
    { label: 'Gym',      minutes: 75,  color: '#f97316' },
    { label: 'Dinner',   minutes: 30,  color: '#eab308' },
    { label: 'Leisure',  minutes: 210, color: '#22c55e' },
    { label: 'Sleep',    minutes: 7,   color: '#1e3a5f' },
  ];

  const total = segments.reduce((s, seg) => s + seg.minutes, 0);
  const cx = 200, cy = 200, r = 160, sw = 28;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  segments.forEach((seg, i) => {
    const frac = seg.minutes / total;
    const dash = frac * circ;
    const gap = circ - dash;
    const rotation = (offset / total) * 360 - 90;

    // Create gradient for each segment
    const gradId = `seg-grad-${i}`;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', gradId);
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', seg.color);
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', lighten(seg.color, 20));
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', `url(#${gradId})`);
    circle.setAttribute('stroke-width', sw);
    circle.setAttribute('stroke-dasharray', `${dash} ${gap}`);
    circle.setAttribute('stroke-linecap', 'butt');
    circle.setAttribute('transform', `rotate(${rotation} ${cx} ${cy})`);
    circle.classList.add('ring-seg');

    // Start hidden for scroll animation
    circle.style.strokeDasharray = `0 ${circ}`;
    circle.style.transition = `stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
    circle.dataset.targetDash = `${dash} ${gap}`;

    svg.appendChild(circle);
    offset += seg.minutes;
  });

  // Observe ring for scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        svg.querySelectorAll('.ring-seg').forEach(c => {
          c.style.strokeDasharray = c.dataset.targetDash;
        });
        // Show labels
        document.querySelectorAll('.ring-label').forEach((l, i) => {
          setTimeout(() => l.classList.add('visible'), 400 + i * 80);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(svg);
}

function lighten(hex, pct) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + pct);
  const g = Math.min(255, ((num >> 8) & 0xff) + pct);
  const b = Math.min(255, (num & 0xff) + pct);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// ─── Countdown Timer ───
function initCountdown() {
  const el = document.getElementById('ring-countdown');
  if (!el) return;

  function update() {
    const now = new Date();
    const eod = new Date(now);
    eod.setHours(23, 59, 59, 999);
    const diff = eod - now;
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }

  update();
  setInterval(update, 1000);
}

// ─── Timeline Builder ───
function buildTimeline() {
  const track = document.querySelector('.timeline-track');
  const hoursRow = document.querySelector('.timeline-hours');
  if (!track) return;

  const blocks = [
    { label: 'Sleep',     start: 0,    end: 7.38, color: '#1e3a5f', detail: 'Deep sleep cycle detected' },
    { label: 'Commute',   start: 7.38, end: 7.88, color: '#7c3aed', detail: 'GPS: Home to Office route' },
    { label: 'Deep Work',  start: 7.88, end: 12.67, color: '#3b82f6', detail: 'Xcode active, no context switches' },
    { label: 'Lunch',     start: 12.67, end: 13.38, color: '#eab308', detail: 'Location: Cafe downstairs' },
    { label: 'Deep Work',  start: 13.38, end: 15.62, color: '#3b82f6', detail: '2h 14m uninterrupted', is2pm: true },
    { label: 'Meetings',  start: 15.62, end: 17.12, color: '#60a5fa', detail: '3 back-to-back calls' },
    { label: 'Commute',   start: 17.12, end: 17.62, color: '#7c3aed', detail: 'GPS: Office to Gym' },
    { label: 'Gym',       start: 17.62, end: 18.87, color: '#f97316', detail: 'Motion: High intensity, 47min active' },
    { label: 'Dinner',    start: 18.87, end: 19.37, color: '#eab308', detail: 'Location: Home, low motion' },
    { label: 'Leisure',   start: 19.37, end: 22.87, color: '#22c55e', detail: 'Netflix, some phone browsing' },
    { label: 'Sleep',     start: 22.87, end: 24, color: '#1e3a5f', detail: 'Wind-down detected' },
  ];

  const totalH = 24;

  blocks.forEach(b => {
    const widthPct = ((b.end - b.start) / totalH) * 100;
    const div = document.createElement('div');
    div.className = 'timeline-block' + (b.is2pm ? ' block-2pm' : '');
    div.style.width = widthPct + '%';
    div.style.background = `linear-gradient(135deg, ${b.color}, ${lighten(b.color, 15)})`;
    if (widthPct > 5) div.textContent = b.label;

    const startH = Math.floor(b.start);
    const startM = Math.round((b.start - startH) * 60);
    const endH = Math.floor(b.end);
    const endM = Math.round((b.end - endH) * 60);
    const timeStr = `${startH}:${String(startM).padStart(2,'0')} - ${endH}:${String(endM).padStart(2,'0')}`;
    const durMin = Math.round((b.end - b.start) * 60);
    const durStr = durMin >= 60 ? `${Math.floor(durMin/60)}h ${durMin%60}m` : `${durMin}m`;

    div.innerHTML += `
      <div class="timeline-tooltip">
        <div class="tt-title">${b.label}</div>
        <div class="tt-time">${timeStr}</div>
        <div class="tt-dur">${durStr}</div>
        ${b.is2pm ? '<div class="tt-special">This is the 2pm block</div>' : ''}
      </div>
    `;

    track.appendChild(div);
  });

  // Hour labels
  if (hoursRow) {
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('span');
      s.textContent = i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`;
      hoursRow.appendChild(s);
    }
  }

  // Drag to scroll
  let isDrag = false, startX, scrollLeft;
  const outer = document.querySelector('.timeline-outer');
  if (outer) {
    outer.addEventListener('mousedown', e => { isDrag = true; startX = e.pageX - outer.offsetLeft; scrollLeft = outer.scrollLeft; });
    outer.addEventListener('mouseleave', () => isDrag = false);
    outer.addEventListener('mouseup', () => isDrag = false);
    outer.addEventListener('mousemove', e => {
      if (!isDrag) return;
      e.preventDefault();
      outer.scrollLeft = scrollLeft - (e.pageX - outer.offsetLeft - startX) * 1.5;
    });
  }
}

// ─── Parallax on Hourglass ───
function initParallax() {
  const img = document.querySelector('.hourglass-image-wrap');
  if (!img) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = img.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const vh = window.innerHeight;
        const offset = (center - vh / 2) * 0.08;
        img.querySelector('img').style.transform = `translateY(${offset}px) scale(${1 + Math.max(0, 1 - rect.top / vh) * 0.05})`;
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ─── Waitlist Form ───
function initWaitlist() {
  const form = document.querySelector('.waitlist-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.waitlist-input');
    const btn = form.querySelector('.btn-primary');
    if (input && input.value) {
      btn.textContent = 'You\'re in!';
      btn.style.background = '#22c55e';
      input.disabled = true;
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Joined';
      }, 1500);
    }
  });
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) new GradientBackground(canvas);

  initHeroTitle();
  initReveals();
  buildRing();
  initCountdown();
  buildTimeline();
  initParallax();
  initWaitlist();
});
