/* ============================================
   POMOBORROW — Three.js 3D Hero Ring
   ============================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const wrap = canvas.parentElement;
  let width = wrap.clientWidth;
  let height = wrap.clientHeight;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 5;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Ring segments (activity data as torus arcs)
  const segments = [
    { start: 0,   end: 90,  color: 0x1E3A5F, emissive: 0x1E293B, name: 'Sleep' },
    { start: 90,  end: 110, color: 0x8B5CF6, emissive: 0x6D28D9, name: 'Commute' },
    { start: 110, end: 210, color: 0x3B82F6, emissive: 0x2563EB, name: 'Work' },
    { start: 210, end: 230, color: 0xFBBF24, emissive: 0xD97706, name: 'Lunch' },
    { start: 230, end: 270, color: 0x3B82F6, emissive: 0x2563EB, name: 'Work PM' },
    { start: 270, end: 300, color: 0xF97316, emissive: 0xEA580C, name: 'Gym' },
    { start: 300, end: 355, color: 0x10B981, emissive: 0x059669, name: 'Leisure' },
    { start: 355, end: 360, color: 0x1E3A5F, emissive: 0x1E293B, name: 'Sleep' },
  ];

  const ringGroup = new THREE.Group();

  segments.forEach(function(seg) {
    const startAngle = (seg.start * Math.PI) / 180;
    const endAngle = (seg.end * Math.PI) / 180;
    const arc = endAngle - startAngle;

    const tubeSegments = Math.max(8, Math.floor(arc * 30));
    const geometry = new THREE.TorusGeometry(1.8, 0.18, 16, tubeSegments, arc);

    const material = new THREE.MeshStandardMaterial({
      color: seg.color,
      emissive: seg.emissive,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.4,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = startAngle;
    ringGroup.add(mesh);
  });

  // Inner subtle ring
  const innerGeo = new THREE.TorusGeometry(1.4, 0.02, 8, 64);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    emissive: 0x222222,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.4,
  });
  ringGroup.add(new THREE.Mesh(innerGeo, innerMat));

  // Outer subtle ring
  const outerGeo = new THREE.TorusGeometry(2.2, 0.015, 8, 64);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    emissive: 0x1a1a1a,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.3,
  });
  ringGroup.add(new THREE.Mesh(outerGeo, outerMat));

  // Tilt the ring for a 3D perspective
  ringGroup.rotation.x = 0.5;
  scene.add(ringGroup);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x3B82F6, 1.5, 20);
  pointLight1.position.set(3, 3, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x8B5CF6, 1, 20);
  pointLight2.position.set(-3, -2, 4);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0x10B981, 0.5, 15);
  pointLight3.position.set(0, 3, 3);
  scene.add(pointLight3);

  // Mouse tracking
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0.5;
  let targetRotY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotX = 0.5 + mouseY * 0.15;
    targetRotY = mouseX * 0.15;
  });

  // Animation
  let baseRotation = 0;

  function animate() {
    requestAnimationFrame(animate);

    baseRotation += 0.003;

    // Smooth mouse follow
    ringGroup.rotation.x += (targetRotX - ringGroup.rotation.x) * 0.05;
    ringGroup.rotation.z = baseRotation;

    // Subtle y-axis tilt from mouse
    const targetTilt = targetRotY;
    ringGroup.rotation.y += (targetTilt - ringGroup.rotation.y) * 0.05;

    // Subtle breathing scale
    const breathe = 1 + Math.sin(Date.now() * 0.001) * 0.01;
    ringGroup.scale.set(breathe, breathe, breathe);

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  function onResize() {
    width = wrap.clientWidth;
    height = wrap.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize);

  // Cleanup on page hide
  document.addEventListener('visibilitychange', function () {
    // Pause/resume could be added here if needed
  });
})();
