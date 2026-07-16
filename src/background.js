// Ambient 3D backdrop: a slowly rotating DNA double helix rendered with three.js
// (vendored, no build step). Two glowing strands of base-pair nodes with rungs
// between them, drifting behind the app. The whole rig parallaxes gently toward
// the pointer for a touch of depth.
//
// Design constraints, per the project ethos and the Web Interface Guidelines:
//   • purely decorative — the canvas is aria-hidden and pointer-events:none;
//   • honours prefers-reduced-motion (renders one static frame, no loop, no
//     pointer tracking);
//   • pauses when the tab is hidden;
//   • clamps pixel ratio and uses additive sprite "glow" instead of a heavier
//     post-processing bloom chain, so nothing extra needs vendoring.

import * as THREE from '../assets/vendor/three.module.min.js';

// Brand accents (kept in sync with the CSS palette).
const CYAN = new THREE.Color('#22d3ee');   // strand A
const VIOLET = new THREE.Color('#a78bfa'); // strand B
const RUNG = new THREE.Color('#6ee7ff');

const HEIGHT = 42;   // vertical extent of the helix
const RADIUS = 3.4;  // strand radius
const TURNS = 5.5;   // full twists across the height
const NODES = 168;   // base pairs per strand
const RUNG_EVERY = 3;

// A soft radial sprite so each point renders as a round glow rather than a square.
function glowTexture() {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.75)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function initBackground(canvas) {
  if (!canvas) return null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return null; // WebGL unavailable — the CSS gradient backdrop stands in.
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070e, 0.028);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
  camera.position.set(0, 0, 15);

  const helix = new THREE.Group();
  scene.add(helix);

  // Build the two strands as one Points cloud with per-vertex colour, plus a
  // faint LineSegments rig for the base-pair rungs.
  const positions = new Float32Array(NODES * 2 * 3);
  const colors = new Float32Array(NODES * 2 * 3);
  const sizes = new Float32Array(NODES * 2);
  const rungPts = [];

  for (let i = 0; i < NODES; i++) {
    const t = i / (NODES - 1);
    const y = (t - 0.5) * HEIGHT;
    const a = t * TURNS * Math.PI * 2;

    const ax = Math.cos(a) * RADIUS, az = Math.sin(a) * RADIUS;
    const bx = Math.cos(a + Math.PI) * RADIUS, bz = Math.sin(a + Math.PI) * RADIUS;

    const iA = i * 2, iB = i * 2 + 1;
    positions.set([ax, y, az], iA * 3);
    positions.set([bx, y, bz], iB * 3);
    colors.set([CYAN.r, CYAN.g, CYAN.b], iA * 3);
    colors.set([VIOLET.r, VIOLET.g, VIOLET.b], iB * 3);
    // Nodes nearer the camera (larger z) read a touch bigger.
    sizes[iA] = 0.9 + (az + RADIUS) / (RADIUS * 2) * 0.7;
    sizes[iB] = 0.9 + (bz + RADIUS) / (RADIUS * 2) * 0.7;

    if (i % RUNG_EVERY === 0) rungPts.push(ax, y, az, bx, y, bz);
  }

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  nodeGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Points shader: additive round glows, size-attenuated by distance.
  const nodeMat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: glowTexture() }, uScale: { value: 1 } },
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float uScale;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uScale * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uTex;
      varying vec3 vColor;
      void main() {
        float a = texture2D(uTex, gl_PointCoord).a;
        if (a < 0.02) discard;
        gl_FragColor = vec4(vColor, a);
      }`,
  });
  helix.add(new THREE.Points(nodeGeo, nodeMat));

  const rungGeo = new THREE.BufferGeometry();
  rungGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rungPts), 3));
  const rungMat = new THREE.LineBasicMaterial({
    color: RUNG, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  helix.add(new THREE.LineSegments(rungGeo, rungMat));

  helix.rotation.z = 0.14; // slight lean

  // ── Sizing ──────────────────────────────────────────────────────────────
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    // Frame the helix a little tighter on narrow screens.
    camera.position.z = w < 720 ? 19 : 15;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Pointer parallax ───────────────────────────────────────────────────
  const pointer = { x: 0, y: 0 };      // target, -1..1
  const eased = { x: 0, y: 0 };        // smoothed
  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    window.addEventListener('pointerout', () => { pointer.x = 0; pointer.y = 0; });
  }

  const clock = new THREE.Clock();
  let running = true;

  function renderFrame() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    // Continuous slow spin of the helix.
    helix.rotation.y += dt * 0.18;
    helix.position.y = Math.sin(t * 0.25) * 0.6; // gentle vertical drift
    // Ease the rig + camera toward the pointer for parallax depth.
    eased.x += (pointer.x - eased.x) * 0.045;
    eased.y += (pointer.y - eased.y) * 0.045;
    helix.rotation.x = eased.y * 0.28;
    helix.rotation.z = 0.14 + eased.x * 0.18;
    camera.position.x = eased.x * 2.2;
    camera.position.y = -eased.y * 1.6;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    renderFrame();
    requestAnimationFrame(loop);
  }

  if (reduceMotion) {
    renderer.render(scene, camera); // one static frame
  } else {
    loop();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; clock.getDelta(); loop(); }
    });
  }

  return { renderer, scene };
}
