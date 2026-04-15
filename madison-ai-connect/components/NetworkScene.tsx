'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── 8×8 Bayer ordered-dither matrix ──────────────────────────────────────────
const BAYER = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

// ── Interest categories — each is a floating orb ─────────────────────────────
const NODES = [
  { name: 'ML Research',    tag: 'Deep Learning',  color: 0x4488FF, emit: 0x2255DD, glow: 0x5599FF },
  { name: 'Social Impact',  tag: 'Community',      color: 0xAA55FF, emit: 0x8833DD, glow: 0xBB66FF },
  { name: 'Creative AI',    tag: 'Generative',     color: 0xFF9944, emit: 0xFF6611, glow: 0xFFAA55 },
  { name: 'Systems & Web3', tag: 'Infrastructure', color: 0x44DDCC, emit: 0x22AAAA, glow: 0x55EEDD },
];

// ── Shaders ───────────────────────────────────────────────────────────────────
const FLAT_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const BG_FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  vec3 navyBase  = vec3(0.024, 0.040, 0.100); // deep navy bottom
  vec3 indigoMid = vec3(0.060, 0.090, 0.260); // indigo layer
  vec3 blueSky   = vec3(0.228, 0.478, 0.796); // electric blue mid
  vec3 purple    = vec3(0.380, 0.140, 0.640); // vivid purple accent
  vec3 darkTop   = vec3(0.015, 0.022, 0.075); // near-black top

  float hillHeight(float x, float t) {
    float left  = 0.320 * exp(-pow((x - 0.25) / 0.22, 2.0));
    float right = 0.200 * exp(-pow((x - 0.82) / 0.20, 2.0));
    float base  = max(left, right);
    base += 0.005 * sin(x * 4.0 + t * 0.30) + 0.003 * sin(x * 8.0 - t * 0.22);
    return base;
  }

  void main() {
    vec2  uv = vUv;
    float t  = uTime * 0.06;

    float hillH    = hillHeight(uv.x, t);
    float aboveHill = uv.y - hillH;

    vec3 col;
    if (aboveHill > 0.0) {
      float bandDist = aboveHill;
      float purpleAmt = exp(-bandDist * 6.0);
      float darkAmt   = exp(-bandDist * 20.0);
      col = mix(blueSky, indigoMid, smoothstep(0.6, 0.0, uv.y));
      col = mix(col, purple, purpleAmt * 0.82);
      col = mix(col, navyBase, darkAmt * 0.50);
    } else {
      col = vec3(0.018, 0.010, 0.008); // dark hill silhouette
    }

    // Aurora bloom — centered above hills
    float pulse  = 1.0 + 0.04 * sin(uTime * 0.55);
    vec2 sunPos  = vec2(0.50, hillHeight(0.50, t) + 0.08);
    vec2 delta   = uv - sunPos;
    delta.x     *= 0.72;
    float d = length(delta);

    float core  = exp(-d * 22.0);
    float inner = exp(-d *  5.0) * 0.75 * pulse;
    float outer = exp(-d *  1.6) * 0.28 * pulse;

    col += vec3(0.70, 0.90, 1.00) * core;
    col += vec3(0.40, 0.60, 1.00) * inner;
    col += vec3(0.30, 0.20, 0.90) * outer;

    // Aurora shimmer band
    float aur = 0.10 * exp(-pow((uv.y - 0.62) / 0.10, 2.0))
              * (0.5 + 0.5 * sin(uv.x * 5.0 + uTime * 0.45));
    col += vec3(0.20, 0.50, 0.95) * aur;

    vec2 vig = uv * 2.0 - 1.0;
    col *= 1.0 - dot(vig, vig) * 0.13;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

// Aurora dither palette: navy / blue / purple / white bloom
const DITHER_FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D tScene;
  uniform sampler2D tBayer;
  uniform vec2      uRes;
  uniform float     uPx;
  uniform float     uTime;

  vec3 pal(float lv) {
    if (lv < 0.5) return vec3(0.018, 0.010, 0.008);  // near-black hill silhouettes
    if (lv < 1.5) return vec3(0.228, 0.478, 0.796);  // electric blue  #3A7ACC
    if (lv < 2.5) return vec3(0.520, 0.140, 0.820);  // vivid purple   #8524D1
    return          vec3(0.920, 0.950, 1.000);        // bright aurora  #EBF2FF
  }

  void main() {
    vec2 snap = (floor(gl_FragCoord.xy / uPx) + 0.5) * uPx;
    vec4 col  = texture2D(tScene, snap / uRes);
    float lum = dot(col.rgb, vec3(0.2126, 0.7152, 0.0722));

    float px = gl_FragCoord.x / uRes.x;
    float py = gl_FragCoord.y / uRes.y;

    // Primary sweep — aurora shimmer L→R
    float s1    = mod(uTime * 0.16, 1.4) - 0.20;
    float wave1 = s1 + 0.048 * sin(py * 7.0 + uTime * 1.6)
                     + 0.020 * sin(py * 16.0 - uTime * 2.8);
    float d1 = px - wave1;
    lum += smoothstep(0.10, 0.0, abs(d1))        * 0.46
         + smoothstep(0.0, 0.18, d1) * smoothstep(0.30, 0.18, d1) * 0.20;

    // Secondary sweep
    float s2    = mod(uTime * 0.25 + 0.55, 1.4) - 0.20;
    float wave2 = s2 + 0.032 * sin(py * 10.0 - uTime * 2.2)
                     + 0.014 * sin(py * 22.0 + uTime * 3.5);
    float d2 = px - wave2;
    lum += smoothstep(0.05, 0.0, abs(d2)) * 0.30
         + smoothstep(0.0, 0.12, d2) * smoothstep(0.20, 0.12, d2) * 0.10;

    vec2  bUV = mod(floor(gl_FragCoord.xy / uPx), 8.0) / 8.0 + 0.5 / 8.0;
    float thr = texture2D(tBayer, bUV).r;

    float sc    = clamp(lum, 0.0, 0.9999) * 4.0;
    float base  = floor(sc);
    float frac  = sc - base;
    float level = min(base + step(thr, frac), 3.0);

    gl_FragColor = vec4(pal(level), 1.0);
  }
`;

const PASS_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

const CONFIGS = [
  { pos: new THREE.Vector3(-3.1,  0.10, -0.20), rotY: 0.18  },
  { pos: new THREE.Vector3(-0.9, -0.20,  0.35), rotY: 0.05  },
  { pos: new THREE.Vector3( 1.0, -0.05,  0.30), rotY: -0.10 },
  { pos: new THREE.Vector3( 3.2,  0.15, -0.18), rotY: -0.18 },
];
const PHASES  = [0, 1.6, 3.2, 4.8];
const RSPEEDS = [0.33, 0.39, 0.35, 0.41];

// Connection pairs (all-to-all)
const CONNECTIONS = [[0,1],[1,2],[2,3],[0,2],[1,3],[0,3]];

export default function NetworkScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount     = mountRef.current!;
    const labelWrap = labelRef.current!;
    let W = mount.clientWidth;
    let H = mount.clientHeight;
    if (!W || !H) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H);
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.4;
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    mount.appendChild(renderer.domElement);

    const rt = new THREE.WebGLRenderTarget(W, H, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Background scene
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT, fragmentShader: BG_FRAG,
      uniforms: { uTime: { value: 0 } },
      depthTest: false, depthWrite: false,
    });
    const bgScene = new THREE.Scene();
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    // ── 3D Scene ──────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(54, W / H, 0.1, 60);
    camera.position.set(0, 0.4, 11);
    camera.lookAt(0, 0.2, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xCCDDFF, 0.10));
    const key = new THREE.DirectionalLight(0x8AAEFF, 10.0);
    key.position.set(4, 12, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xAA66FF, 4.0);
    fill.position.set(-6, 4, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x44AAFF, 5.5);
    rim.position.set(0, -2, -9);
    scene.add(rim);

    // ── Geometry ──────────────────────────────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(0.48, 48, 48);
    const ringGeo = new THREE.TorusGeometry(0.60, 0.025, 12, 64);
    const microGeo = new THREE.SphereGeometry(0.035, 8, 8);

    interface NodeData {
      group:    THREE.Group;
      orb:      THREE.Mesh;
      orbMat:   THREE.MeshPhongMaterial;
      ringMat:  THREE.MeshPhongMaterial;
      glowPt:   THREE.PointLight;
      phase:    number;
      rotSpd:   number;
      basePos:  THREE.Vector3;
    }

    const nodes: NodeData[]        = [];
    const labelEls: HTMLDivElement[] = [];
    const projVec = new THREE.Vector3();

    NODES.forEach((n, i) => {
      const cfg = CONFIGS[i];
      const g   = new THREE.Group();
      g.position.copy(cfg.pos);
      g.rotation.y = cfg.rotY;
      g.scale.setScalar(0.70);

      // Main orb — glass-like sphere
      const orbMat = new THREE.MeshPhongMaterial({
        color:             new THREE.Color(n.color),
        emissive:          new THREE.Color(n.emit),
        emissiveIntensity: 2.8,
        shininess:         180,
        transparent:       true,
        opacity:           0.82,
        specular:          new THREE.Color(0xffffff),
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      g.add(orb);

      // Equatorial ring
      const ringMat = new THREE.MeshPhongMaterial({
        color:             new THREE.Color(n.glow),
        emissive:          new THREE.Color(n.emit),
        emissiveIntensity: 4.0,
        shininess:         240,
        transparent:       true,
        opacity:           0.60,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.45;
      g.add(ring);

      // Micro-satellites orbiting the orb
      const N_SAT = 6;
      for (let s = 0; s < N_SAT; s++) {
        const angle = (s / N_SAT) * Math.PI * 2;
        const satMat = new THREE.MeshPhongMaterial({
          color:             new THREE.Color(n.glow),
          emissive:          new THREE.Color(n.emit),
          emissiveIntensity: 3.0,
          transparent:       true,
          opacity:           0.55,
        });
        const sat = new THREE.Mesh(microGeo, satMat);
        const r = 0.72 + Math.random() * 0.20;
        sat.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 0.4, Math.sin(angle) * r);
        sat.scale.setScalar(0.5 + Math.random() * 0.8);
        g.add(sat);
      }

      // Point glow
      const gl = new THREE.PointLight(new THREE.Color(n.glow), 3.5, 6.0);
      gl.position.set(0, 0, 0);
      g.add(gl);

      scene.add(g);
      nodes.push({
        group: g, orb, orbMat, ringMat, glowPt: gl,
        phase: PHASES[i], rotSpd: RSPEEDS[i],
        basePos: cfg.pos.clone(),
      });

      // Label
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute; transform:translateX(-50%);
        display:flex; flex-direction:column; align-items:center; gap:3px;
        pointer-events:none; opacity:0.45; transition:opacity 0.5s;
      `;
      el.innerHTML = `
        <span style="
          font-family:'Courier New',monospace; font-size:10px; font-weight:700;
          letter-spacing:.18em; color:rgba(200,220,255,0.92);
          text-shadow:0 0 10px rgba(100,160,255,0.8),0 0 3px rgba(0,0,0,0.6);
        ">${n.name}</span>
        <span style="
          font-family:'Courier New',monospace; font-size:7px;
          letter-spacing:.12em; text-transform:uppercase;
          color:rgba(160,200,255,0.50);
        ">${n.tag}</span>
      `;
      labelWrap.appendChild(el);
      labelEls.push(el);
    });

    // ── Connection lines between nodes ────────────────────────────────────
    const connLines: THREE.Line[] = [];
    const connMats: THREE.LineBasicMaterial[] = [];
    CONNECTIONS.forEach(([a, b]) => {
      const mat = new THREE.LineBasicMaterial({
        color: 0x4488FF, transparent: true, opacity: 0.18,
        linewidth: 1,
      });
      const pts = [nodes[a].group.position.clone(), nodes[b].group.position.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      connLines.push(line);
      connMats.push(mat);
    });

    // ── Bayer DataTexture ─────────────────────────────────────────────────
    const bayerData = new Uint8Array(64 * 4);
    BAYER.forEach((v, i) => {
      const n = Math.round((v / 63) * 255);
      bayerData[i*4] = bayerData[i*4+1] = bayerData[i*4+2] = n;
      bayerData[i*4+3] = 255;
    });
    const bayerTex = new THREE.DataTexture(bayerData, 8, 8, THREE.RGBAFormat);
    bayerTex.magFilter = bayerTex.minFilter = THREE.NearestFilter;
    bayerTex.wrapS = bayerTex.wrapT = THREE.RepeatWrapping;
    bayerTex.needsUpdate = true;

    const ditherMat = new THREE.ShaderMaterial({
      vertexShader:   FLAT_VERT,
      fragmentShader: DITHER_FRAG,
      uniforms: {
        tScene: { value: rt.texture },
        tBayer: { value: bayerTex },
        uRes:   { value: new THREE.Vector2(W, H) },
        uPx:    { value: 2.8 },
        uTime:  { value: 0 },
      },
      depthTest: false, depthWrite: false,
    });
    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ditherMat));

    // ── Focus cycle ───────────────────────────────────────────────────────
    const FOCUS_DUR = 3.5;
    let animId: number;
    let t = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.010;

      const focusIdx = Math.floor(t / FOCUS_DUR) % NODES.length;
      bgMat.uniforms.uTime.value     = t;
      ditherMat.uniforms.uTime.value = t;

      nodes.forEach((nd, i) => {
        const focused = i === focusIdx;

        nd.group.position.y  = nd.basePos.y + Math.sin(t * 0.75 + nd.phase) * 0.10;
        nd.group.rotation.y += nd.rotSpd * 0.010;
        nd.group.rotation.x  = Math.sin(t * 0.40 + nd.phase) * 0.016;

        const base = 3.5 + 1.0 * Math.sin(t * 1.8 + nd.phase);
        nd.orbMat.emissiveIntensity  = base + (focused ? 5.5 : 0);
        nd.ringMat.emissiveIntensity = (base + 2.0) + (focused ? 8.0 : 0);
        nd.glowPt.intensity          = 3.0 + (focused ? 7.5 : 0) + 0.5 * Math.sin(t * 2.8 + nd.phase);

        labelEls[i].style.opacity = focused ? '1' : '0.35';

        nd.group.updateMatrixWorld();
        projVec.set(0, -0.5, 0).applyMatrix4(nd.group.matrixWorld);
        projVec.project(camera);
        const sx = ( projVec.x * 0.5 + 0.5) * W;
        const sy = (-projVec.y * 0.5 + 0.5) * H;
        labelEls[i].style.left = `${sx}px`;
        labelEls[i].style.top  = `${sy}px`;
      });

      // Update connection lines
      CONNECTIONS.forEach(([a, b], ci) => {
        const posA = nodes[a].group.position;
        const posB = nodes[b].group.position;
        const geo = connLines[ci].geometry as THREE.BufferGeometry;
        const posArr = new Float32Array([posA.x, posA.y, posA.z, posB.x, posB.y, posB.z]);
        geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        geo.attributes.position.needsUpdate = true;

        // Pulse connection opacity
        const bothFocused = a === Math.floor(t / FOCUS_DUR) % NODES.length
                         || b === Math.floor(t / FOCUS_DUR) % NODES.length;
        connMats[ci].opacity = bothFocused
          ? 0.55 + 0.25 * Math.sin(t * 4.0 + ci)
          : 0.12 + 0.08 * Math.sin(t * 2.0 + ci * 1.2);
      });

      camera.position.x = Math.sin(t * 0.07) * 0.38;
      camera.position.y = 0.4 + Math.sin(t * 0.055) * 0.12;
      camera.lookAt(0, 0.2, 0);

      renderer.setRenderTarget(rt);
      renderer.autoClear = true;
      renderer.render(bgScene, ortho);
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.autoClear = true;
      renderer.render(postScene, ortho);
    }
    animate();

    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      rt.setSize(W, H);
      (ditherMat.uniforms.uRes.value as THREE.Vector2).set(W, H);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      rt.dispose(); bayerTex.dispose(); renderer.dispose();
      labelEls.forEach(el => el.remove());
      connLines.forEach(l => { l.geometry.dispose(); });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position: 'absolute', inset: 0 }}>
      <div ref={labelRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }} />
    </div>
  );
}
