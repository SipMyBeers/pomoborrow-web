import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';

/* ===== WEBGL CHECK ===== */
function hasWebGL() {
  try {
    var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

/* ===== THREE.JS HERO ===== */
const canvas = document.getElementById('hero-canvas');
const fallback = document.getElementById('hero-fallback');

if (!hasWebGL() || !canvas) {
  if (canvas) canvas.style.display = 'none';
  if (fallback) fallback.style.display = 'flex';
} else {
  if (fallback) fallback.style.display = 'none';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.3, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.6);
  fillLight.position.set(-3, 2, -2);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xff6633, 1.0, 20);
  rimLight.position.set(0, -3, -3);
  scene.add(rimLight);

  // Model
  let hourglassModel = null;
  let crackObjects = [];
  let crackOriginalIntensities = [];
  let sandParticles = null;
  let modelBaseY = 0;

  const loader = new GLTFLoader();
  loader.load('models/hourglass.glb', (gltf) => {
    hourglassModel = gltf.scene;

    // Model is pre-centered and pre-scaled in Blender to ~3 units
    // Just position it slightly up so it's centered in viewport
    hourglassModel.position.set(0, 0, 0);
    modelBaseY = 0;

    console.log('[PomoBorrow] Model loaded successfully');

    // Configure all materials
    hourglassModel.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.side = THREE.DoubleSide;
        child.material.needsUpdate = true;
        // Store original opacity for scroll fade
        child.material._baseOpacity = child.material.opacity !== undefined ? child.material.opacity : 1;
        child.material._baseTransparent = child.material.transparent;
      }
    });

    // Traverse and configure materials
    hourglassModel.traverse((child) => {
      if (!child.isMesh) return;

      if (child.name.startsWith('Crack')) {
        crackObjects.push(child);
        if (child.material) {
          child.material = child.material.clone();
          crackOriginalIntensities.push(child.material.emissiveIntensity || 1);
        }
      }

      if (child.name.includes('Bulb') || child.name === 'Neck') {
        if (child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.35;
          child.material.depthWrite = false;
        }
      }

      // Store original opacity for scroll fade
      if (child.material) {
        child.material = child.material.clone();
        child.material._baseOpacity = child.material.opacity !== undefined ? child.material.opacity : 1;
        child.material._baseTransparent = child.material.transparent;
      }
    });

    scene.add(hourglassModel);
    createSandParticles();
    console.log('[PomoBorrow] Model added to scene');
  },
  (progress) => {
    console.log('[PomoBorrow] Loading:', Math.round((progress.loaded / progress.total) * 100) + '%');
  },
  (error) => {
    console.error('[PomoBorrow] Model load error:', error);
    // Show fallback
    if (canvas) canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'flex';
  });

  // Sand particle system
  function createSandParticles() {
    const count = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = -1.5 + Math.random() * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      velocities.push({
        x: (Math.random() - 0.5) * 0.002,
        y: -0.005 - Math.random() * 0.01,
        life: Math.random()
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xD4A843,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    sandParticles = new THREE.Points(geometry, material);
    sandParticles.userData.velocities = velocities;
    scene.add(sandParticles);
  }

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Scroll tracking
  let scrollProgress = 0;
  const heroSection = document.getElementById('hero-3d');

  function updateScrollProgress() {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const total = heroSection.offsetHeight - window.innerHeight;
    scrollProgress = Math.max(0, Math.min(1, -rect.top / total));
    updateOverlays(scrollProgress);
  }

  // Text overlay transitions
  function updateOverlays(p) {
    const o1 = document.getElementById('hero-overlay-1');
    const o2 = document.getElementById('hero-overlay-2');
    const o3 = document.getElementById('hero-overlay-3');

    if (o1) o1.style.opacity = p < 0.25 ? 1 : Math.max(0, 1 - (p - 0.25) / 0.08);
    if (o2) o2.style.opacity = p > 0.3 && p < 0.55 ? Math.min(1, (p - 0.3) / 0.08) : p >= 0.55 ? Math.max(0, 1 - (p - 0.55) / 0.08) : 0;
    if (o3) o3.style.opacity = p > 0.6 ? Math.min(1, (p - 0.6) / 0.1) : 0;
  }

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (hourglassModel) {
      // Subtle auto-rotation
      hourglassModel.rotation.y += 0.1 * dt;

      // Mouse parallax (max ~10 degrees = 0.174 rad)
      const targetRotX = mouseY * 0.15;
      const targetRotZ = -mouseX * 0.1;
      hourglassModel.rotation.x += (targetRotX - hourglassModel.rotation.x) * 0.05;
      hourglassModel.rotation.z += (targetRotZ - hourglassModel.rotation.z) * 0.05;

      // Scroll-driven tilt (30-60% scroll range)
      if (scrollProgress > 0.3 && scrollProgress < 0.6) {
        const tiltFactor = (scrollProgress - 0.3) / 0.3;
        hourglassModel.rotation.x += tiltFactor * 0.08;
      }

      // Crack pulsing (emissive intensity)
      const pulseIntensity = 3 + Math.sin(Date.now() * 0.003) * 2;
      crackObjects.forEach((crack, i) => {
        if (crack.material && crack.material.emissiveIntensity !== undefined) {
          crack.material.emissiveIntensity = pulseIntensity * (0.5 + scrollProgress * 1.5);
        }
      });

      // Scroll-driven fade out (60-100%)
      if (scrollProgress > 0.6) {
        const fade = 1 - ((scrollProgress - 0.6) / 0.4);
        hourglassModel.traverse(child => {
          if (child.material && child.material._baseOpacity !== undefined) {
            child.material.transparent = true;
            child.material.opacity = child.material._baseOpacity * Math.max(0, fade);
          }
        });
      } else {
        // Restore opacity when not fading
        hourglassModel.traverse(child => {
          if (child.material && child.material._baseOpacity !== undefined) {
            child.material.transparent = child.material._baseTransparent;
            child.material.opacity = child.material._baseOpacity;
          }
        });
      }
    }

    // Update sand particles
    if (sandParticles) {
      const positions = sandParticles.geometry.attributes.position.array;
      const vels = sandParticles.userData.velocities;
      const intensity = Math.min(1, scrollProgress * 2.5);
      sandParticles.material.opacity = intensity * 0.8;

      // Only animate particles if scroll has started
      if (scrollProgress > 0.05) {
        const activeCount = Math.floor(vels.length * intensity);
        for (let i = 0; i < vels.length; i++) {
          if (i < activeCount) {
            positions[i * 3] += vels[i].x;
            positions[i * 3 + 1] += vels[i].y * intensity;
            vels[i].life -= 0.005;

            if (positions[i * 3 + 1] < -4 || vels[i].life <= 0) {
              positions[i * 3] = (Math.random() - 0.5) * 0.3;
              positions[i * 3 + 1] = -1.5 + Math.random() * 0.3;
              positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
              vels[i].life = 0.5 + Math.random() * 0.5;
              vels[i].y = -0.005 - Math.random() * 0.01;
              vels[i].x = (Math.random() - 0.5) * 0.002;
            }
          } else {
            // Park inactive particles off-screen
            positions[i * 3 + 1] = -10;
          }
        }
        sandParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Hook into scroll
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
}


/* ===================================================================
   NON-3D SECTIONS (ring, timeline, confrontation, reveals, waitlist)
   =================================================================== */

/* ===== SECTION 4: PRODUCT RING ===== */
var ringSegments = [
  { id: 'sleep1', color: '#1e3a5f', start: 0, end: 97.5 },
  { id: 'commute1', color: '#7c3aed', start: 97.5, end: 105 },
  { id: 'work1', color: '#3b82f6', start: 105, end: 176.25 },
  { id: 'lunch', color: '#eab308', start: 176.25, end: 187.5 },
  { id: 'meeting', color: '#60a5fa', start: 187.5, end: 210 },
  { id: 'work2', color: '#3b82f6', start: 210, end: 258.75 },
  { id: 'commute2', color: '#7c3aed', start: 258.75, end: 266.25 },
  { id: 'gym', color: '#f97316', start: 266.25, end: 285 },
  { id: 'dinner', color: '#eab308', start: 285, end: 292.5 },
  { id: 'leisure', color: '#22c55e', start: 292.5, end: 345 },
  { id: 'sleep2', color: '#1e3a5f', start: 345, end: 360 }
];

function polarToCartesian(cx, cy, r, deg) {
  var rad = deg * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  var s = polarToCartesian(cx, cy, r, endAngle);
  var e = polarToCartesian(cx, cy, r, startAngle);
  var large = (endAngle - startAngle > 180) ? 1 : 0;
  return ['M', s.x, s.y, 'A', r, r, 0, large, 0, e.x, e.y].join(' ');
}

function initRing() {
  var svg = document.getElementById('ring-svg');
  if (!svg) return;
  var cx = 200, cy = 200, r = 170, sw = 28;

  var bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
  bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#1a1a1a'); bg.setAttribute('stroke-width', sw);
  svg.appendChild(bg);

  ringSegments.forEach(function (seg) {
    var path = describeArc(cx, cy, r, seg.start - 90, seg.end - 90);
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', path);
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', seg.color);
    el.setAttribute('stroke-width', sw);
    el.setAttribute('stroke-linecap', 'round');
    el.id = 'seg-' + seg.id;
    var len = el.getTotalLength ? el.getTotalLength() : Math.PI * 2 * r * ((seg.end - seg.start) / 360);
    el.setAttribute('stroke-dasharray', len);
    el.setAttribute('stroke-dashoffset', len);
    svg.appendChild(el);
  });
}

function updateRing() {
  var sec = document.getElementById('product-section');
  if (!sec) return;
  var rect = sec.getBoundingClientRect();
  var total = sec.offsetHeight - window.innerHeight;
  var raw = -rect.top / total;
  var progress = Math.max(0, Math.min(1, raw));

  var intro = sec.querySelector('.product-intro');
  if (intro) intro.classList.toggle('visible', progress > .02);

  var segProgress = progress * 1.3;
  ringSegments.forEach(function (seg, i) {
    var el = document.getElementById('seg-' + seg.id);
    if (!el) return;
    var segStart = i / ringSegments.length;
    var segEnd = (i + 1) / ringSegments.length;
    var localP = Math.max(0, Math.min(1, (segProgress - segStart) / (segEnd - segStart)));
    var len = el.getTotalLength();
    el.setAttribute('stroke-dashoffset', len * (1 - localP));

    var lbl = document.getElementById('lbl-' + seg.id);
    if (lbl) lbl.classList.toggle('visible', localP > .95);
  });

  var sub = sec.querySelector('.product-sub');
  if (sub) sub.classList.toggle('visible', progress > .75);
  var sensors = sec.querySelectorAll('.sensor-item');
  sensors.forEach(function (s, i) {
    s.classList.toggle('visible', progress > .78 + i * .03);
  });
}

/* ===== COUNTDOWN ===== */
function initCountdown() {
  var el = document.getElementById('ring-countdown');
  if (!el) return;
  function pad(n) { return n < 10 ? '0' + n : n }
  function tick() {
    var now = new Date();
    var mid = new Date(now); mid.setHours(24, 0, 0, 0);
    var rem = mid - now;
    var h = Math.floor(rem / 3600000);
    var m = Math.floor((rem % 3600000) / 60000);
    var s = Math.floor((rem % 60000) / 1000);
    el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  tick(); setInterval(tick, 1000);
}

/* ===== SECTION 5: TIMELINE ===== */
var timelineData = [
  { name: 'Sleep', start: 0, end: 6.5, color: 'var(--sleep)', det: 'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: Silent \u00b7 Devices: iPhone (charging)' },
  { name: 'Commute', start: 6.5, end: 7, color: 'var(--commute)', det: 'Location: Transit \u00b7 Motion: Vehicle \u00b7 Sound: Road noise \u00b7 Devices: iPhone + AirPods' },
  { name: 'Deep Work', start: 7, end: 11.783, color: 'var(--work)', det: 'Location: Office \u00b7 Motion: Stationary \u00b7 Sound: Keyboard typing \u00b7 Devices: MacBook + Monitor' },
  { name: 'Lunch', start: 11.783, end: 12.5, color: 'var(--lunch)', det: 'Location: Cafe nearby \u00b7 Motion: Walking then stationary \u00b7 Sound: Ambient chatter \u00b7 Devices: iPhone only' },
  { name: 'Meetings', start: 12.5, end: 14, color: 'var(--meeting)', det: 'Location: Office (conf room) \u00b7 Motion: Stationary \u00b7 Sound: Voices \u00b7 Devices: MacBook + iPhone' },
  { name: 'Deep Work', start: 14, end: 17.25, color: 'var(--work)', special: true, det: 'Location: Office \u00b7 Motion: Stationary \u00b7 Sound: Keyboard typing \u00b7 Devices: MacBook + Monitor' },
  { name: 'Commute', start: 17.25, end: 17.75, color: 'var(--commute)', det: 'Location: Transit \u00b7 Motion: Vehicle \u00b7 Sound: Road noise \u00b7 Devices: iPhone + AirPods' },
  { name: 'Gym', start: 17.75, end: 19, color: 'var(--gym)', det: 'Location: Gym \u00b7 Motion: High activity \u00b7 Sound: Music \u00b7 Devices: Apple Watch + AirPods' },
  { name: 'Dinner', start: 19, end: 19.5, color: 'var(--dinner)', det: 'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: Ambient \u00b7 Devices: iPhone' },
  { name: 'Leisure', start: 19.5, end: 23, color: 'var(--leisure)', det: 'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: TV audio \u00b7 Devices: iPhone + Apple TV' },
  { name: 'Sleep', start: 23, end: 24, color: 'var(--sleep)', det: 'Location: Home \u00b7 Motion: Stationary \u00b7 Sound: Silent \u00b7 Devices: iPhone (charging)' }
];

function formatHour(h) {
  var hr = Math.floor(h); var min = Math.round((h - hr) * 60);
  var ampm = hr >= 12 ? 'pm' : 'am'; var h12 = hr % 12 || 12;
  return h12 + ':' + (min < 10 ? '0' : '') + min + ampm;
}

function durStr(s, e) {
  var total = e - s; var hrs = Math.floor(total); var mins = Math.round((total - hrs) * 60);
  if (hrs && mins) return hrs + 'h ' + mins + 'm';
  if (hrs) return hrs + 'h';
  return mins + 'm';
}

function initTimeline() {
  var track = document.querySelector('.timeline-track');
  if (!track) return;

  timelineData.forEach(function (b) {
    var div = document.createElement('div');
    div.className = 'timeline-block';
    div.style.width = ((b.end - b.start) / 24 * 100) + '%';
    div.style.background = b.color;
    div.textContent = b.name;

    var tip = document.createElement('div');
    tip.className = 'timeline-tooltip';
    tip.innerHTML = '<div class="tt-title">' + b.name + '</div>' +
      '<div class="tt-time">' + formatHour(b.start) + ' \u2013 ' + formatHour(b.end) + '</div>' +
      '<div class="tt-dur">' + durStr(b.start, b.end) + '</div>' +
      (b.special ? '<div class="tt-special">This is what you were doing at 2pm last Tuesday.</div>' : '') +
      '<div class="tt-details">' + b.det + '</div>';
    div.appendChild(tip);

    div.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasExpanded = div.classList.contains('expanded');
      track.querySelectorAll('.expanded').forEach(function (x) { x.classList.remove('expanded') });
      if (!wasExpanded) div.classList.add('expanded');
    });

    track.appendChild(div);
  });

  document.addEventListener('click', function () {
    track.querySelectorAll('.expanded').forEach(function (x) { x.classList.remove('expanded') });
  });

  // Drag to scroll
  var outer = document.querySelector('.timeline-outer');
  var isDown = false, startX, scrollLeft;
  outer.addEventListener('mousedown', function (e) { isDown = true; startX = e.pageX - outer.offsetLeft; scrollLeft = outer.scrollLeft });
  outer.addEventListener('mouseleave', function () { isDown = false });
  outer.addEventListener('mouseup', function () { isDown = false });
  outer.addEventListener('mousemove', function (e) {
    if (!isDown) return; e.preventDefault();
    var x = e.pageX - outer.offsetLeft;
    outer.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  var hours = document.querySelector('.timeline-hours');
  if (hours) {
    for (var i = 0; i < 24; i += 3) {
      var sp = document.createElement('span');
      sp.textContent = formatHour(i);
      hours.appendChild(sp);
    }
  }
}

/* ===== SECTION 6: ANSWER REVEAL ===== */
function initAnswerObserver() {
  var lines = document.querySelectorAll('#answer .ans-line');
  if (!lines.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(function () { entry.target.classList.add('visible') }, delay);
      }
    });
  }, { threshold: .3 });
  lines.forEach(function (l) { observer.observe(l) });
}

/* ===== SECTION 7: PRIVACY COUNTERS ===== */
function animateCounter(el, target, suffix, duration) {
  var start = 0; var startTime = null;
  suffix = suffix || '';
  function step(ts) {
    if (!startTime) startTime = ts;
    var p = Math.min((ts - startTime) / duration, 1);
    var ease = 1 - Math.pow(1 - p, 3);
    var val = Math.round(start + (target - start) * ease);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initPrivacyCounters() {
  var nums = document.querySelectorAll('.privacy-num .big');
  if (!nums.length) return;
  var fired = false;
  var observer = new IntersectionObserver(function (entries) {
    if (fired) return;
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        fired = true;
        animateCounter(nums[0], 0, '', 800);
        animateCounter(nums[1], 0, '', 800);
        animateCounter(nums[2], 100, '%', 1200);
      }
    });
  }, { threshold: .5 });
  observer.observe(nums[0]);
}

/* ===== SECTION 8: LEARNS REVEAL ===== */
function initLearnsReveal() {
  var cards = document.querySelectorAll('.learns-card');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('reveal-in');
    });
  }, { threshold: .2 });
  cards.forEach(function (c) { observer.observe(c) });
}

/* ===== SECTION 3: CONFRONTATION REVEAL ===== */
function initConfrontReveal() {
  var items = document.querySelectorAll('.confront-left .quote, .confront-right .stat, .confront-bottom');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(function () { entry.target.classList.add('reveal-in') }, delay);
      }
    });
  }, { threshold: .2 });
  items.forEach(function (item) { observer.observe(item) });
}

/* ===== MASTER SCROLL HANDLER ===== */
function onScroll() {
  updateRing();
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', function () {
  initRing();
  initCountdown();
  initTimeline();
  initAnswerObserver();
  initPrivacyCounters();
  initLearnsReveal();
  initConfrontReveal();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
