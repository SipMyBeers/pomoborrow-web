/* ============================================
   POMOBORROW — Cracked Hourglass Hero Animation
   Three.js: Hourglass → Jar → Ring Timer
   ============================================ */

(function () {
  'use strict';

  var container = document.getElementById('hero-canvas');
  if (!container || typeof THREE === 'undefined') {
    if (container) container.classList.add('no-webgl');
    return;
  }

  // Check WebGL support
  try {
    var testCanvas = document.createElement('canvas');
    var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) { container.classList.add('no-webgl'); return; }
  } catch (e) { container.classList.add('no-webgl'); return; }

  var width = container.clientWidth;
  var height = container.clientHeight;

  // Scene
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 10);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ---- State ----
  var scrollProgress = 0;

  // ---- HOURGLASS GROUP ----
  var hourglassGroup = new THREE.Group();
  scene.add(hourglassGroup);

  // Glass material — transparent, blue-tinted
  var glassMat = new THREE.MeshBasicMaterial({
    color: 0x4488cc,
    transparent: true,
    opacity: 0.08,
    wireframe: false,
    side: THREE.DoubleSide,
  });

  var glassWireMat = new THREE.MeshBasicMaterial({
    color: 0x6699cc,
    transparent: true,
    opacity: 0.15,
    wireframe: true,
  });

  // Top chamber — frustum (wide top, narrow bottom)
  var topGeo = new THREE.CylinderGeometry(1.6, 0.2, 2.8, 24, 1, true);
  var topChamber = new THREE.Mesh(topGeo, glassMat);
  var topWire = new THREE.Mesh(topGeo.clone(), glassWireMat);
  topChamber.position.y = 1.8;
  topWire.position.y = 1.8;
  hourglassGroup.add(topChamber);
  hourglassGroup.add(topWire);

  // Bottom chamber — frustum (narrow top, wide bottom)
  var botGeo = new THREE.CylinderGeometry(0.2, 1.6, 2.8, 24, 1, true);
  var botChamber = new THREE.Mesh(botGeo, glassMat);
  var botWire = new THREE.Mesh(botGeo.clone(), glassWireMat);
  botChamber.position.y = -1.8;
  botWire.position.y = -1.8;
  hourglassGroup.add(botChamber);
  hourglassGroup.add(botWire);

  // Neck
  var neckGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16, 1, true);
  var neck = new THREE.Mesh(neckGeo, glassMat);
  var neckWire = new THREE.Mesh(neckGeo.clone(), glassWireMat);
  hourglassGroup.add(neck);
  hourglassGroup.add(neckWire);

  // Top and bottom caps (rings)
  var capGeo = new THREE.TorusGeometry(1.6, 0.06, 8, 32);
  var capMat = new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.3 });
  var topCap = new THREE.Mesh(capGeo, capMat);
  topCap.position.y = 3.2;
  topCap.rotation.x = Math.PI / 2;
  hourglassGroup.add(topCap);
  var botCap = new THREE.Mesh(capGeo.clone(), capMat.clone());
  botCap.position.y = -3.2;
  botCap.rotation.x = Math.PI / 2;
  hourglassGroup.add(botCap);

  // ---- CRACKS on bottom chamber ----
  var crackGroup = new THREE.Group();
  crackGroup.position.y = -1.8;
  hourglassGroup.add(crackGroup);

  var crackMat = new THREE.LineBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.8 });

  function makeCrack(points) {
    var geo = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(geo, crackMat.clone());
    crackGroup.add(line);
    return line;
  }

  var cracks = [];
  // Crack 1 — front-left
  cracks.push(makeCrack([
    new THREE.Vector3(-0.3, -0.5, 1.1),
    new THREE.Vector3(-0.5, -0.9, 1.2),
    new THREE.Vector3(-0.4, -1.2, 1.0),
  ]));
  // Crack 2 — front-right
  cracks.push(makeCrack([
    new THREE.Vector3(0.5, -0.3, 1.0),
    new THREE.Vector3(0.7, -0.7, 1.15),
    new THREE.Vector3(0.6, -1.0, 0.9),
    new THREE.Vector3(0.8, -1.3, 1.0),
  ]));
  // Crack 3 — bottom center
  cracks.push(makeCrack([
    new THREE.Vector3(0.0, -1.0, 1.3),
    new THREE.Vector3(0.15, -1.25, 1.2),
    new THREE.Vector3(-0.1, -1.4, 1.1),
  ]));
  // Crack 4 — side
  cracks.push(makeCrack([
    new THREE.Vector3(-0.8, -0.7, 0.7),
    new THREE.Vector3(-1.0, -1.0, 0.8),
    new THREE.Vector3(-0.9, -1.3, 0.6),
  ]));

  // ---- SAND PARTICLES ----
  var SAND_COUNT = 600;
  var sandPositions = new Float32Array(SAND_COUNT * 3);
  var sandColors = new Float32Array(SAND_COUNT * 3);

  // Gold/amber sand color
  var GOLD_R = 0.9, GOLD_G = 0.75, GOLD_B = 0.4;

  for (var i = 0; i < SAND_COUNT; i++) {
    sandPositions[i * 3] = -50;
    sandPositions[i * 3 + 1] = -50;
    sandPositions[i * 3 + 2] = 0;
    sandColors[i * 3] = GOLD_R;
    sandColors[i * 3 + 1] = GOLD_G;
    sandColors[i * 3 + 2] = GOLD_B;
  }

  var sandGeo = new THREE.BufferGeometry();
  sandGeo.setAttribute('position', new THREE.BufferAttribute(sandPositions, 3));
  sandGeo.setAttribute('color', new THREE.BufferAttribute(sandColors, 3));

  var sandMat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  var sandSystem = new THREE.Points(sandGeo, sandMat);
  scene.add(sandSystem);

  // Sand particle state
  var sandStates = [];
  for (var si = 0; si < SAND_COUNT; si++) {
    sandStates.push({
      active: false,
      phase: 'waiting', // waiting | top | falling | neck | bottom | leaking | caught | jarLayered | dead
      vx: 0, vy: 0, vz: 0,
      life: 0,
      settled: false,
      settleY: 0,
      layerColor: null,
    });
  }

  var spawnTimer = 0;

  // Activity layer colors [r, g, b]
  var layerColors = [
    [0.118, 0.161, 0.373],  // Sleep dark blue
    [0.231, 0.510, 0.965],  // Work blue
    [0.976, 0.451, 0.086],  // Gym orange
    [0.063, 0.725, 0.506],  // Leisure green
    [0.545, 0.361, 0.965],  // Commute purple
  ];

  function randomInChamber(yMin, yMax, radiusAtY) {
    var y = yMin + Math.random() * (yMax - yMin);
    var r = Math.random() * radiusAtY * 0.8;
    var angle = Math.random() * Math.PI * 2;
    return { x: Math.cos(angle) * r, y: y, z: Math.sin(angle) * r };
  }

  // Radius of hourglass at a given y (local to hourglassGroup)
  function chamberRadius(y) {
    if (y > 0.4) {
      // Top chamber: from y=0.4 (r=0.2) to y=3.2 (r=1.6)
      var t = (y - 0.4) / 2.8;
      return 0.2 + t * 1.4;
    } else if (y < -0.4) {
      // Bottom chamber: from y=-0.4 (r=0.2) to y=-3.2 (r=1.6)
      var t2 = (-0.4 - y) / 2.8;
      return 0.2 + t2 * 1.4;
    }
    return 0.2; // neck
  }

  function spawnSand(idx) {
    var s = sandStates[idx];
    var pos = sandGeo.attributes.position.array;
    var col = sandGeo.attributes.color.array;

    // Spawn at top of upper chamber
    var r = Math.random() * 1.2;
    var a = Math.random() * Math.PI * 2;
    pos[idx * 3] = Math.cos(a) * r;
    pos[idx * 3 + 1] = 2.5 + Math.random() * 0.5;
    pos[idx * 3 + 2] = Math.sin(a) * r;

    col[idx * 3] = GOLD_R + (Math.random() - 0.5) * 0.1;
    col[idx * 3 + 1] = GOLD_G + (Math.random() - 0.5) * 0.1;
    col[idx * 3 + 2] = GOLD_B + (Math.random() - 0.5) * 0.1;

    s.active = true;
    s.phase = 'top';
    s.vx = 0;
    s.vy = -0.008 - Math.random() * 0.005;
    s.vz = 0;
    s.life = 0;
    s.settled = false;
    s.layerColor = null;
  }

  // ---- JAR ----
  var jarGroup = new THREE.Group();
  jarGroup.position.set(8, -4.5, 0); // starts off-screen right
  scene.add(jarGroup);

  var jarGlassMat = new THREE.MeshBasicMaterial({
    color: 0x4488cc,
    transparent: true,
    opacity: 0.07,
    side: THREE.DoubleSide,
  });
  var jarWireMat = new THREE.MeshBasicMaterial({
    color: 0x6699cc,
    transparent: true,
    opacity: 0.12,
    wireframe: true,
  });

  // Jar body — cylinder with slightly wider bottom
  var jarBodyGeo = new THREE.CylinderGeometry(1.0, 1.1, 2.8, 20, 1, true);
  var jarBody = new THREE.Mesh(jarBodyGeo, jarGlassMat);
  var jarBodyWire = new THREE.Mesh(jarBodyGeo.clone(), jarWireMat);
  jarGroup.add(jarBody);
  jarGroup.add(jarBodyWire);

  // Jar bottom (closed)
  var jarBotGeo = new THREE.CircleGeometry(1.1, 20);
  var jarBot = new THREE.Mesh(jarBotGeo, jarGlassMat.clone());
  jarBot.rotation.x = -Math.PI / 2;
  jarBot.position.y = -1.4;
  jarGroup.add(jarBot);

  // Jar rim
  var jarRimGeo = new THREE.TorusGeometry(1.0, 0.04, 8, 24);
  var jarRim = new THREE.Mesh(jarRimGeo, new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.3 }));
  jarRim.rotation.x = Math.PI / 2;
  jarRim.position.y = 1.4;
  jarGroup.add(jarRim);

  // ---- RING (PomoBorrow timer) ----
  var ringGroup = new THREE.Group();
  ringGroup.position.set(0, -4.5, 0);
  ringGroup.scale.set(0.01, 0.01, 0.01);
  scene.add(ringGroup);

  // Build ring segments
  var ringSegments = [];
  var segColors = [0x1E293B, 0x3B82F6, 0xF97316, 0x10B981, 0x8B5CF6, 0xFBBF24];
  var segAngles = [0.30, 0.18, 0.06, 0.16, 0.04, 0.04]; // proportions (sum ~0.78, rest is gaps)
  var segStart = -Math.PI / 2; // start at 12 o'clock
  var totalUsed = 0;
  for (var rs = 0; rs < segColors.length; rs++) {
    totalUsed += segAngles[rs];
  }
  // Normalize to 2PI with small gaps
  var gapAngle = 0.03;
  var totalGaps = segColors.length * gapAngle;
  var scaleFactor = (Math.PI * 2 - totalGaps) / totalUsed;

  var currentAngle = segStart;
  for (var rsi = 0; rsi < segColors.length; rsi++) {
    var arcLen = segAngles[rsi] * scaleFactor;
    var sGeo = new THREE.TorusGeometry(2.0, 0.15, 12, Math.max(8, Math.floor(arcLen * 20)), arcLen);
    var sMat = new THREE.MeshBasicMaterial({ color: segColors[rsi], transparent: true, opacity: 0.9 });
    var sMesh = new THREE.Mesh(sGeo, sMat);
    sMesh.rotation.z = currentAngle;
    ringGroup.add(sMesh);
    ringSegments.push(sMesh);
    currentAngle += arcLen + gapAngle;
  }

  // Ring outer glow
  var ringGlowGeo = new THREE.TorusGeometry(2.0, 0.3, 12, 48);
  var ringGlowMat = new THREE.MeshBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
  var ringGlowMesh = new THREE.Mesh(ringGlowGeo, ringGlowMat);
  ringGroup.add(ringGlowMesh);

  // Needle
  var needleGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 1.7, 0),
    new THREE.Vector3(0, 2.3, 0),
  ]);
  var needleMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  var needle = new THREE.Line(needleGeo, needleMat);
  ringGroup.add(needle);

  // Center dot
  var centerGeo = new THREE.CircleGeometry(0.08, 16);
  var centerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var centerDot = new THREE.Mesh(centerGeo, centerMat);
  ringGroup.add(centerDot);

  // ---- ANIMATION VARIABLES ----
  var jarTargetX = 8;
  var jarSlideProgress = 0;
  var hourglassOpacity = 1;
  var hourglassTilt = 0;
  var additionalCracksShown = 0;
  var ringRevealProgress = 0;

  // ---- UPDATE SAND ----
  function updateSand() {
    var pos = sandGeo.attributes.position.array;
    var col = sandGeo.attributes.color.array;
    var now = performance.now();

    // Spawn rate depends on scroll phase
    var spawnRate = 60;
    if (scrollProgress > 0.25) spawnRate = 30; // faster in act 2

    if (now > spawnTimer) {
      var spawned = 0;
      var maxSpawn = scrollProgress > 0.25 ? 3 : 2;
      for (var i = 0; i < SAND_COUNT && spawned < maxSpawn; i++) {
        if (!sandStates[i].active) {
          spawnSand(i);
          spawned++;
        }
      }
      spawnTimer = now + spawnRate + Math.random() * 40;
    }

    // Jar world position
    var jarWorldY = jarGroup.position.y;
    var jarWorldX = jarGroup.position.x;
    var jarCatching = scrollProgress >= 0.50;

    // How many sand settled in jar layers
    var jarFillLevel = 0;
    for (var jf = 0; jf < SAND_COUNT; jf++) {
      if (sandStates[jf].phase === 'jarLayered') jarFillLevel++;
    }

    for (var p = 0; p < SAND_COUNT; p++) {
      var s = sandStates[p];
      if (!s.active) continue;
      s.life++;

      var x = pos[p * 3];
      var y = pos[p * 3 + 1];
      var z = pos[p * 3 + 2];

      switch (s.phase) {
        case 'top':
          // Fall within top chamber
          s.vy -= 0.0003; // gravity
          pos[p * 3] += s.vx;
          pos[p * 3 + 1] += s.vy;
          pos[p * 3 + 2] += s.vz;

          // Constrain to chamber walls
          var dist = Math.sqrt(x * x + z * z);
          var maxR = chamberRadius(y) * 0.9;
          if (dist > maxR && maxR > 0) {
            var scale = maxR / dist;
            pos[p * 3] *= scale;
            pos[p * 3 + 2] *= scale;
          }

          // Converge toward neck
          if (y < 1.5) {
            pos[p * 3] *= 0.97;
            pos[p * 3 + 2] *= 0.97;
          }

          // Enter neck
          if (y < 0.4) {
            s.phase = 'neck';
            s.vx = 0;
            s.vz = 0;
            s.vy = -0.015 - Math.random() * 0.005;
          }
          break;

        case 'neck':
          pos[p * 3 + 1] += s.vy;
          // Tight stream
          pos[p * 3] *= 0.9;
          pos[p * 3 + 2] *= 0.9;

          if (y < -0.4) {
            // Decide: leak or settle
            var leakChance = 0.35 + scrollProgress * 0.3; // more leaking as we scroll
            if (Math.random() < leakChance) {
              s.phase = 'leaking';
              s.vy = -0.012 - Math.random() * 0.008;
              s.vx = (Math.random() - 0.5) * 0.01;
              s.vz = (Math.random() - 0.5) * 0.01;
            } else {
              s.phase = 'bottom';
              s.vy = -0.01;
              s.vx = (Math.random() - 0.5) * 0.005;
              s.vz = (Math.random() - 0.5) * 0.005;
            }
          }
          break;

        case 'bottom':
          // Fall and settle in bottom chamber
          s.vy -= 0.0002;
          pos[p * 3] += s.vx;
          pos[p * 3 + 1] += s.vy;
          pos[p * 3 + 2] += s.vz;

          // Constrain to bottom chamber
          var distB = Math.sqrt(x * x + z * z);
          var maxRB = chamberRadius(y) * 0.85;
          if (distB > maxRB && maxRB > 0) {
            var scaleB = maxRB / distB;
            pos[p * 3] *= scaleB;
            pos[p * 3 + 2] *= scaleB;
          }

          // Settle at bottom
          if (y < -2.8 || s.life > 200) {
            s.settled = true;
            s.settleY = Math.max(y, -3.0);
            pos[p * 3 + 1] = s.settleY;
            s.vx = 0; s.vy = 0; s.vz = 0;
            // Eventually recycle
            if (s.life > 400) {
              resetSand(p);
            }
          }
          break;

        case 'leaking':
          // Sand falling through cracks
          s.vy -= 0.0004;
          pos[p * 3] += s.vx;
          pos[p * 3 + 1] += s.vy;
          pos[p * 3 + 2] += s.vz;

          // Below the hourglass
          if (y < -3.5) {
            if (jarCatching && Math.abs(x - jarWorldX) < 1.2) {
              // Caught by jar!
              s.phase = 'caught';
              s.vy = -0.005;
              // Assign a layer color based on fill level
              var layerIdx = Math.floor((jarFillLevel / 30)) % layerColors.length;
              s.layerColor = layerColors[layerIdx];
            } else {
              // Dissolve into void
              col[p * 3] *= 0.96;
              col[p * 3 + 1] *= 0.95;
              col[p * 3 + 2] *= 0.94;

              if (y < -7 || s.life > 300) {
                resetSand(p);
              }
            }
          }
          break;

        case 'caught':
          // Fall into jar, then settle as layer
          pos[p * 3 + 1] += s.vy;

          // Pull toward jar center x
          pos[p * 3] += (jarWorldX - x) * 0.05;
          pos[p * 3 + 2] *= 0.95;

          // Settle in jar
          var jarBottomY = jarWorldY - 1.2;
          if (y < jarBottomY + (jarFillLevel * 0.005)) {
            s.phase = 'jarLayered';
            pos[p * 3 + 1] = jarBottomY + Math.random() * Math.min(jarFillLevel * 0.005, 2.4);
            s.vy = 0;

            // Spread within jar radius
            var jr = Math.random() * 0.9;
            var ja = Math.random() * Math.PI * 2;
            pos[p * 3] = jarWorldX + Math.cos(ja) * jr;
            pos[p * 3 + 2] = Math.sin(ja) * jr;
          }

          // Transition color to layer color
          if (s.layerColor) {
            col[p * 3] += (s.layerColor[0] - col[p * 3]) * 0.08;
            col[p * 3 + 1] += (s.layerColor[1] - col[p * 3 + 1]) * 0.08;
            col[p * 3 + 2] += (s.layerColor[2] - col[p * 3 + 2]) * 0.08;
          }
          break;

        case 'jarLayered':
          // Stay put, but color keeps transitioning
          if (s.layerColor) {
            col[p * 3] += (s.layerColor[0] - col[p * 3]) * 0.04;
            col[p * 3 + 1] += (s.layerColor[1] - col[p * 3 + 1]) * 0.04;
            col[p * 3 + 2] += (s.layerColor[2] - col[p * 3 + 2]) * 0.04;
          }

          // In act 4, pull toward ring position
          if (scrollProgress > 0.78) {
            var ringX = ringGroup.position.x;
            var ringY = ringGroup.position.y;
            var pullStrength = (scrollProgress - 0.78) / 0.22;
            pullStrength = Math.min(1, pullStrength) * 0.03;

            // Pull toward ring orbit
            var angle = Math.atan2(y - ringY, x - ringX) + 0.02;
            var targetR = 2.0 * ringGroup.scale.x;
            var tgtX = ringX + Math.cos(angle) * targetR;
            var tgtY = ringY + Math.sin(angle) * targetR;

            pos[p * 3] += (tgtX - x) * pullStrength;
            pos[p * 3 + 1] += (tgtY - y) * pullStrength;
            pos[p * 3 + 2] *= (1 - pullStrength);
          }

          if (s.life > 800) {
            resetSand(p);
          }
          break;
      }
    }

    sandGeo.attributes.position.needsUpdate = true;
    sandGeo.attributes.color.needsUpdate = true;
  }

  function resetSand(idx) {
    var s = sandStates[idx];
    var pos = sandGeo.attributes.position.array;
    var col = sandGeo.attributes.color.array;
    s.active = false;
    s.phase = 'waiting';
    s.life = 0;
    s.settled = false;
    pos[idx * 3] = -50;
    pos[idx * 3 + 1] = -50;
    pos[idx * 3 + 2] = 0;
    col[idx * 3] = GOLD_R;
    col[idx * 3 + 1] = GOLD_G;
    col[idx * 3 + 2] = GOLD_B;
  }

  // ---- ANIMATE ----
  function animate() {
    requestAnimationFrame(animate);
    var t = performance.now();

    // ---- ACT 1 (0-0.25): Hourglass pouring, sand leaking ----
    // ---- ACT 2 (0.25-0.50): More cracks, tilt, faster leak ----
    // ---- ACT 3 (0.50-0.75): Jar slides in, catches sand ----
    // ---- ACT 4 (0.75-1.00): Jar → ring transformation ----

    // Hourglass gentle sway
    hourglassGroup.rotation.y = Math.sin(t * 0.0003) * 0.06;

    // Act 2: tilt hourglass slightly
    var targetTilt = 0;
    if (scrollProgress > 0.25 && scrollProgress < 0.75) {
      targetTilt = Math.min((scrollProgress - 0.25) * 0.2, 0.08);
    }
    hourglassTilt += (targetTilt - hourglassTilt) * 0.02;
    hourglassGroup.rotation.z = hourglassTilt;

    // Crack glow pulsation
    var pulseVal = 0.5 + Math.sin(t * 0.004) * 0.3;
    for (var ci = 0; ci < cracks.length; ci++) {
      cracks[ci].material.opacity = pulseVal;
      // Show more cracks in act 2
      if (ci < 2) {
        cracks[ci].visible = true;
      } else {
        cracks[ci].visible = scrollProgress > 0.20;
      }
    }

    // Hourglass opacity (fade out in act 4)
    var targetHgOpacity = 1;
    if (scrollProgress > 0.75) {
      targetHgOpacity = Math.max(0, 1 - (scrollProgress - 0.75) / 0.15);
    }
    hourglassOpacity += (targetHgOpacity - hourglassOpacity) * 0.03;
    glassMat.opacity = 0.08 * hourglassOpacity;
    glassWireMat.opacity = 0.15 * hourglassOpacity;
    capMat.opacity = 0.3 * hourglassOpacity;
    crackMat.opacity = pulseVal * hourglassOpacity;
    topCap.material.opacity = 0.3 * hourglassOpacity;
    botCap.material.opacity = 0.3 * hourglassOpacity;

    // ---- JAR SLIDE ----
    if (scrollProgress >= 0.45) {
      var slideT = Math.min(1, (scrollProgress - 0.45) / 0.12);
      // Ease out with slight bounce
      var eased = slideT < 1 ? 1 - Math.pow(1 - slideT, 3) : 1;
      // Bounce
      if (slideT > 0.85 && slideT < 1) {
        eased += Math.sin((slideT - 0.85) / 0.15 * Math.PI) * 0.03;
      }
      jarTargetX = 8 - eased * 8; // from 8 to 0
    } else {
      jarTargetX = 8;
    }
    jarGroup.position.x += (jarTargetX - jarGroup.position.x) * 0.06;

    // Jar opacity
    var jarOpacity = scrollProgress >= 0.45 ? Math.min(1, (scrollProgress - 0.45) / 0.1) : 0;
    // Fade jar in act 4
    if (scrollProgress > 0.80) {
      jarOpacity *= Math.max(0, 1 - (scrollProgress - 0.80) / 0.12);
    }
    jarGlassMat.opacity = 0.07 * jarOpacity;
    jarWireMat.opacity = 0.12 * jarOpacity;
    jarRim.material.opacity = 0.3 * jarOpacity;
    jarBot.material.opacity = 0.07 * jarOpacity;

    // ---- RING REVEAL ----
    if (scrollProgress > 0.72) {
      ringRevealProgress = Math.min(1, (scrollProgress - 0.72) / 0.25);
    } else {
      ringRevealProgress = 0;
    }

    var ringScale = ringRevealProgress * 1.2;
    ringGroup.scale.set(ringScale, ringScale, ringScale);
    ringGroup.position.y = -4.5 + ringRevealProgress * 4.5; // rise to center
    ringGroup.rotation.z = (1 - ringRevealProgress) * Math.PI * 0.5; // rotation in

    // Ring glow
    ringGlowMat.opacity = ringRevealProgress * 0.15;

    // Needle rotation
    needle.rotation.z = t * 0.001;

    // Update sand particles
    updateSand();

    renderer.render(scene, camera);
  }

  animate();

  // ---- RESIZE ----
  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  // ---- EXPOSE FOR SCROLL ENGINE ----
  window.heroAnimation = {
    setProgress: function (p) { scrollProgress = p; },
    getProgress: function () { return scrollProgress; },
  };

})();
