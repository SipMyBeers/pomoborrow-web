/* ============================================
   POMOBORROW — "In One Ear, Out the Other"
   Three.js 3D Head + Particle Hero Animation
   ============================================ */

(function () {
  'use strict';

  var container = document.getElementById('hero-canvas');
  if (!container || typeof THREE === 'undefined') {
    // WebGL not available — show fallback
    if (container) container.classList.add('no-webgl');
    return;
  }

  // Check WebGL support
  try {
    var testCanvas = document.createElement('canvas');
    var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      container.classList.add('no-webgl');
      return;
    }
  } catch (e) {
    container.classList.add('no-webgl');
    return;
  }

  var width = container.clientWidth;
  var height = container.clientHeight;

  // Scene
  var scene = new THREE.Scene();

  // Camera
  var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Renderer
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ---- State ----
  var phase = 'loss'; // 'loss' | 'capture' | 'reveal'
  var scrollProgress = 0;
  var autoTimer = 0;
  var autoPhaseTriggered = false;

  // Ear positions (world space)
  var leftEar = new THREE.Vector3(-1.3, 0.5, 0);
  var rightEar = new THREE.Vector3(1.3, 0.5, 0);

  // ---- Create Head ----
  var headGroup = new THREE.Group();

  var headMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });

  // Main skull
  var headGeo = new THREE.SphereGeometry(1.5, 20, 14);
  headGeo.scale(0.85, 1.0, 0.9);
  var headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.set(0, 0.3, 0);
  headGroup.add(headMesh);

  // Jaw
  var jawGeo = new THREE.SphereGeometry(1.0, 14, 10);
  jawGeo.scale(0.7, 0.5, 0.75);
  var jawMat = headMat.clone();
  var jaw = new THREE.Mesh(jawGeo, jawMat);
  jaw.position.set(0, -0.7, 0.2);
  headMesh.add(jaw);

  // Nose
  var noseGeo = new THREE.ConeGeometry(0.15, 0.6, 4);
  var noseMat = headMat.clone();
  var nose = new THREE.Mesh(noseGeo, noseMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, -0.1, 1.3);
  headMesh.add(nose);

  // Ear indicators (small rings to show entry/exit points)
  var earGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 16);
  var earMatL = new THREE.MeshBasicMaterial({ color: 0xEF4444, transparent: true, opacity: 0.3 });
  var earLeft = new THREE.Mesh(earGeo, earMatL);
  earLeft.position.copy(leftEar);
  earLeft.position.y -= 0.1;
  earLeft.rotation.y = Math.PI / 2;
  headGroup.add(earLeft);

  var earMatR = new THREE.MeshBasicMaterial({ color: 0xEF4444, transparent: true, opacity: 0.3 });
  var earRight = new THREE.Mesh(earGeo.clone(), earMatR);
  earRight.position.copy(rightEar);
  earRight.position.y -= 0.1;
  earRight.rotation.y = Math.PI / 2;
  headGroup.add(earRight);

  scene.add(headGroup);

  // ---- Create Particle System ----
  var particleCount = 350;
  var positions = new Float32Array(particleCount * 3);
  var colors = new Float32Array(particleCount * 3);
  var sizes = new Float32Array(particleCount);

  for (var i = 0; i < particleCount; i++) {
    positions[i * 3] = -15; // off-screen
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    colors[i * 3] = 0.93;
    colors[i * 3 + 1] = 0.27;
    colors[i * 3 + 2] = 0.07;
    sizes[i] = 3 + Math.random() * 4;
  }

  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  var particleMat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  var particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Particle state tracking
  var particleStates = [];
  for (var j = 0; j < particleCount; j++) {
    particleStates.push({
      active: false,
      phase: 'waiting', // waiting | entering | inside | exiting | captured | dead
      velocity: { x: 0, y: 0, z: 0 },
      life: 0,
      maxLife: 120 + Math.random() * 80,
      capturedColor: null,
      orbitAngle: Math.random() * Math.PI * 2,
    });
  }

  var nextSpawnTime = 0;

  // Activity colors
  var activityColors = [
    [0.23, 0.51, 0.96], // Work blue
    [0.98, 0.45, 0.09], // Gym orange
    [0.06, 0.73, 0.51], // Leisure green
    [0.55, 0.36, 0.96], // Commute purple
    [0.98, 0.75, 0.14], // Lunch yellow
  ];

  function spawnParticle(idx) {
    var state = particleStates[idx];
    var pos = particleGeo.attributes.position.array;
    var col = particleGeo.attributes.color.array;

    pos[idx * 3] = leftEar.x - 3.5 + Math.random() * 0.4;
    pos[idx * 3 + 1] = leftEar.y + (Math.random() - 0.5) * 0.6;
    pos[idx * 3 + 2] = (Math.random() - 0.5) * 0.4;

    // Reset to red/orange
    col[idx * 3] = 0.85 + Math.random() * 0.15;
    col[idx * 3 + 1] = 0.15 + Math.random() * 0.25;
    col[idx * 3 + 2] = 0.03 + Math.random() * 0.05;

    state.active = true;
    state.phase = 'entering';
    state.life = 0;
    state.maxLife = 120 + Math.random() * 80;
    state.capturedColor = null;
    state.velocity.x = 0.035 + Math.random() * 0.02;
    state.velocity.y = (Math.random() - 0.5) * 0.008;
    state.velocity.z = (Math.random() - 0.5) * 0.008;
    state.orbitAngle = Math.random() * Math.PI * 2;
  }

  function updateParticles() {
    var pos = particleGeo.attributes.position.array;
    var col = particleGeo.attributes.color.array;
    var now = performance.now();

    // Spawn particles
    if (now > nextSpawnTime) {
      var spawned = 0;
      for (var i = 0; i < particleCount && spawned < 2; i++) {
        if (!particleStates[i].active) {
          spawnParticle(i);
          spawned++;
        }
      }
      nextSpawnTime = now + 40 + Math.random() * 60;
    }

    for (var p = 0; p < particleCount; p++) {
      var state = particleStates[p];
      if (!state.active) continue;

      state.life++;
      var x = pos[p * 3];
      var y = pos[p * 3 + 1];
      var z = pos[p * 3 + 2];

      switch (state.phase) {
        case 'entering':
          pos[p * 3] += state.velocity.x;
          pos[p * 3 + 1] += state.velocity.y + (Math.random() - 0.5) * 0.003;
          pos[p * 3 + 2] += state.velocity.z + (Math.random() - 0.5) * 0.003;

          // Converge toward the left ear
          var dyL = leftEar.y - y;
          pos[p * 3 + 1] += dyL * 0.01;

          if (x > leftEar.x - 0.3) {
            state.phase = 'inside';
            state.velocity.x = 0.012 + Math.random() * 0.015;
            state.velocity.y = (Math.random() - 0.5) * 0.015;
            state.velocity.z = (Math.random() - 0.5) * 0.02;
          }
          break;

        case 'inside':
          // Chaotic swirl inside the head
          pos[p * 3] += state.velocity.x;
          pos[p * 3 + 1] += state.velocity.y + Math.sin(state.life * 0.08 + p) * 0.004;
          pos[p * 3 + 2] += state.velocity.z + Math.cos(state.life * 0.08 + p) * 0.004;

          // Slight turbulence
          state.velocity.y += (Math.random() - 0.5) * 0.002;
          state.velocity.z += (Math.random() - 0.5) * 0.002;

          // Dampen z to keep in a disc
          state.velocity.z *= 0.98;

          // Keep roughly within head bounds
          if (Math.abs(y - 0.3) > 1.2) {
            state.velocity.y *= -0.5;
          }
          if (Math.abs(z) > 1.0) {
            state.velocity.z *= -0.5;
          }

          if (x > rightEar.x - 0.3) {
            state.phase = 'exiting';
            state.velocity.x = 0.03 + Math.random() * 0.02;
          }
          break;

        case 'exiting':
          if (phase === 'capture' || phase === 'reveal') {
            state.phase = 'captured';
            state.capturedColor = activityColors[Math.floor(Math.random() * activityColors.length)];
            state.life = 0;
            state.maxLife = 200 + Math.random() * 150;
          } else {
            // Dissolve — the LOSS
            pos[p * 3] += state.velocity.x;
            pos[p * 3 + 1] += (Math.random() - 0.5) * 0.015;
            pos[p * 3 + 2] += (Math.random() - 0.5) * 0.01;

            // Fade color toward dark
            col[p * 3] *= 0.975;
            col[p * 3 + 1] *= 0.97;
            col[p * 3 + 2] *= 0.97;

            if (x > 6 || state.life > state.maxLife) {
              resetParticle(p);
            }
          }
          break;

        case 'captured':
          // Pull toward ring position
          var ringTarget = ring.position;
          var dxR = ringTarget.x - x;
          var dyR = ringTarget.y - y;
          var dzR = ringTarget.z - z;
          var dist = Math.sqrt(dxR * dxR + dyR * dyR + dzR * dzR);

          if (dist > 0.4) {
            pos[p * 3] += dxR * 0.06;
            pos[p * 3 + 1] += dyR * 0.06;
            pos[p * 3 + 2] += dzR * 0.06;
          } else {
            // Orbit the ring
            state.orbitAngle += 0.02 + Math.random() * 0.01;
            var orbitR = 1.8 + Math.sin(state.orbitAngle * 3) * 0.2;
            pos[p * 3] = ringTarget.x + Math.cos(state.orbitAngle) * 0.15;
            pos[p * 3 + 1] = ringTarget.y + Math.sin(state.orbitAngle) * orbitR * 0.08;
            pos[p * 3 + 2] = Math.cos(state.orbitAngle) * orbitR;
          }

          // Color transition
          if (state.capturedColor) {
            col[p * 3] += (state.capturedColor[0] - col[p * 3]) * 0.06;
            col[p * 3 + 1] += (state.capturedColor[1] - col[p * 3 + 1]) * 0.06;
            col[p * 3 + 2] += (state.capturedColor[2] - col[p * 3 + 2]) * 0.06;
          }

          if (state.life > state.maxLife) {
            resetParticle(p);
          }
          break;
      }
    }

    particleGeo.attributes.position.needsUpdate = true;
    particleGeo.attributes.color.needsUpdate = true;
  }

  function resetParticle(idx) {
    var state = particleStates[idx];
    var pos = particleGeo.attributes.position.array;
    var col = particleGeo.attributes.color.array;

    state.active = false;
    state.phase = 'waiting';
    pos[idx * 3] = -15;
    pos[idx * 3 + 1] = 0;
    pos[idx * 3 + 2] = 0;
    col[idx * 3] = 0.85 + Math.random() * 0.15;
    col[idx * 3 + 1] = 0.15 + Math.random() * 0.25;
    col[idx * 3 + 2] = 0.03 + Math.random() * 0.05;
  }

  // ---- Create Ring ----
  var ringGeo = new THREE.TorusGeometry(1.8, 0.1, 16, 64);
  var ringMat = new THREE.MeshBasicMaterial({
    color: 0x3B82F6,
    transparent: true,
    opacity: 0,
  });
  var ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(rightEar.x + 0.5, rightEar.y, 0);
  ring.rotation.y = Math.PI / 2;
  ring.scale.set(0.01, 0.01, 0.01);
  scene.add(ring);

  // Ring glow
  var glowGeo = new THREE.TorusGeometry(1.8, 0.25, 16, 64);
  var glowMat = new THREE.MeshBasicMaterial({
    color: 0x3B82F6,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  var ringGlow = new THREE.Mesh(glowGeo, glowMat);
  ringGlow.position.copy(ring.position);
  ringGlow.rotation.copy(ring.rotation);
  ringGlow.scale.set(0.01, 0.01, 0.01);
  scene.add(ringGlow);

  // Ring colored segments (arcs that fill in during capture)
  var segmentGroup = new THREE.Group();
  segmentGroup.position.copy(ring.position);
  segmentGroup.rotation.copy(ring.rotation);
  segmentGroup.scale.set(0.01, 0.01, 0.01);
  scene.add(segmentGroup);

  var segmentColors = [0x3B82F6, 0xF97316, 0x10B981, 0x8B5CF6, 0xFBBF24];
  var segmentArcs = [];
  var segmentFillProgress = 0;

  function buildSegmentArcs() {
    // Remove old
    while (segmentGroup.children.length > 0) {
      segmentGroup.remove(segmentGroup.children[0]);
    }
    segmentArcs = [];

    var anglePerSeg = (Math.PI * 2) / segmentColors.length;
    for (var s = 0; s < segmentColors.length; s++) {
      var arcAngle = anglePerSeg * Math.min(1, segmentFillProgress - s);
      if (arcAngle <= 0) continue;
      arcAngle = Math.min(arcAngle, anglePerSeg - 0.02);

      var segGeo = new THREE.TorusGeometry(1.8, 0.13, 12, Math.max(4, Math.floor(arcAngle * 16)), arcAngle);
      var segMat = new THREE.MeshBasicMaterial({
        color: segmentColors[s],
        transparent: true,
        opacity: 0.9,
      });
      var segMesh = new THREE.Mesh(segGeo, segMat);
      segMesh.rotation.z = s * anglePerSeg;
      segmentGroup.add(segMesh);
      segmentArcs.push(segMesh);
    }
  }

  // ---- Phase control ----
  function setPhase(newPhase) {
    if (newPhase === phase) return;
    phase = newPhase;

    if (phase === 'capture') {
      earMatR.color.setHex(0x3B82F6);
      earMatR.opacity = 0.6;
    }
  }

  // ---- Animation loop ----
  var headBaseOpacity = 0.12;
  var ringTargetScale = 0;
  var ringTargetOpacity = 0;
  var ringTargetX = rightEar.x + 0.5;
  var ringTargetRotY = Math.PI / 2;

  function animate() {
    requestAnimationFrame(animate);

    // Auto-phase trigger (if no scrolling happens for 5s)
    if (!autoPhaseTriggered) {
      autoTimer += 16.67; // approximate frame time
      if (autoTimer > 5000) {
        setPhase('capture');
      }
      if (autoTimer > 10000) {
        setPhase('reveal');
        autoPhaseTriggered = true;
      }
    }

    // Head rotation — gentle sway
    headGroup.rotation.y = Math.sin(performance.now() * 0.00025) * 0.08;

    // Update phase-based targets
    if (phase === 'loss') {
      ringTargetScale = 0.01;
      ringTargetOpacity = 0;
      headBaseOpacity = 0.12;
      ringTargetX = rightEar.x + 0.5;
      ringTargetRotY = Math.PI / 2;
    } else if (phase === 'capture') {
      ringTargetScale = 0.7;
      ringTargetOpacity = 0.85;
      headBaseOpacity = 0.1;
      ringTargetX = rightEar.x + 0.5;
      ringTargetRotY = Math.PI / 2;

      // Fill segments over time
      if (segmentFillProgress < segmentColors.length) {
        segmentFillProgress += 0.008;
        buildSegmentArcs();
      }
    } else if (phase === 'reveal') {
      ringTargetScale = 1.3;
      ringTargetOpacity = 1;
      headBaseOpacity = 0;
      ringTargetX = 0;
      ringTargetRotY = 0;

      // Continue filling
      if (segmentFillProgress < segmentColors.length) {
        segmentFillProgress += 0.015;
        buildSegmentArcs();
      }
    }

    // Animate ring
    var lerpSpeed = 0.025;
    var s = ring.scale.x;
    var ns = s + (ringTargetScale - s) * lerpSpeed;
    ring.scale.set(ns, ns, ns);
    ringGlow.scale.set(ns, ns, ns);
    segmentGroup.scale.set(ns, ns, ns);

    ring.material.opacity += (ringTargetOpacity - ring.material.opacity) * lerpSpeed;
    ringGlow.material.opacity += (Math.min(ringTargetOpacity * 0.25, 0.2) - ringGlow.material.opacity) * lerpSpeed;

    ring.position.x += (ringTargetX - ring.position.x) * 0.015;
    ringGlow.position.x = ring.position.x;
    segmentGroup.position.x = ring.position.x;

    ring.rotation.y += (ringTargetRotY - ring.rotation.y) * 0.015;
    ringGlow.rotation.y = ring.rotation.y;
    segmentGroup.rotation.y = ring.rotation.y;

    // Animate head opacity
    headMat.opacity += (headBaseOpacity - headMat.opacity) * 0.02;
    jawMat.opacity = headMat.opacity;
    noseMat.opacity = headMat.opacity;

    // Ear glow pulse
    var pulse = 0.3 + Math.sin(performance.now() * 0.003) * 0.1;
    earMatL.opacity = pulse;
    if (phase === 'loss') {
      earMatR.opacity = pulse;
    }

    updateParticles();

    renderer.render(scene, camera);
  }

  animate();

  // ---- Resize ----
  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize);

  // ---- Expose for scroll engine ----
  window.heroAnimation = {
    setPhase: setPhase,
    scrollProgress: 0,
    resetAutoTimer: function () {
      autoPhaseTriggered = true; // Scroll controls phases now
    },
    getPhase: function () {
      return phase;
    },
  };

})();
