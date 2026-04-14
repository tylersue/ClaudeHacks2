'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

const FLAT_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Deep aurora / space gradient — blues, purples, navy
const BG_FRAG = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  vec3 colA = vec3(0.014, 0.020, 0.070); // deep navy base
  vec3 colB = vec3(0.060, 0.080, 0.240); // indigo mid
  vec3 colC = vec3(0.120, 0.200, 0.560); // electric blue band
  vec3 colD = vec3(0.340, 0.120, 0.640); // vivid purple accent
  vec3 colE = vec3(0.080, 0.320, 0.720); // sky blue upper

  vec3 gradient(float v) {
    if (v < 0.20) return mix(colA, colB, smoothstep(0.00, 0.20, v));
    if (v < 0.40) return mix(colB, colC, smoothstep(0.20, 0.40, v));
    if (v < 0.60) return mix(colC, colD, smoothstep(0.40, 0.60, v));
    if (v < 0.80) return mix(colD, colE, smoothstep(0.60, 0.80, v));
    return              mix(colE, colA, smoothstep(0.80, 1.00, v));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;

    float distort =
        0.048 * sin(uv.x * 2.5  + t * 0.40)
      + 0.028 * sin(uv.x * 5.0  - t * 0.60 + 1.0)
      + 0.016 * sin(uv.x * 9.0  + t * 0.80 + 0.5)
      + 0.008 * sin(uv.x * 18.0 - t * 1.20 + 2.0)
      + 0.006 * sin((uv.x - 0.5) * 5.0 + t * 0.35);

    float v = clamp(uv.y + distort, 0.0, 1.0);
    vec3  col = gradient(v);

    // Aurora shimmer bands
    float a1 = 0.18 * exp(-pow((uv.y - 0.65) / 0.14, 2.0))
             * (0.5 + 0.5 * sin(uv.x * 4.0 + t * 0.5));
    float a2 = 0.12 * exp(-pow((uv.y - 0.50) / 0.12, 2.0))
             * (0.5 + 0.5 * sin(uv.x * 6.5 - t * 0.38 + 1.2));
    col += vec3(0.18, 0.42, 0.95) * a1;
    col += vec3(0.55, 0.18, 0.85) * a2;

    // Purple-right warmth
    float warmRight = smoothstep(0.3, 1.0, uv.x) * 0.10;
    col = mix(col, colD, warmRight);

    vec2 vig = uv * 2.0 - 1.0;
    col *= 1.0 - dot(vig, vig) * 0.16;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

// Dither with aurora palette: navy / electric blue / purple / bright near-white
const DITHER_FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D tScene;
  uniform sampler2D tBayer;
  uniform vec2      uRes;
  uniform float     uPx;

  vec3 pal(float lv) {
    if (lv < 0.5) return vec3(0.014, 0.018, 0.065);  // near-black navy
    if (lv < 1.5) return vec3(0.120, 0.280, 0.750);  // electric blue
    if (lv < 2.5) return vec3(0.550, 0.180, 0.860);  // vivid purple
    return          vec3(0.900, 0.940, 1.000);        // bright aurora white
  }

  void main() {
    vec2 snap = (floor(gl_FragCoord.xy / uPx) + 0.5) * uPx;
    vec4 col  = texture2D(tScene, snap / uRes);
    float lum = dot(col.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec2  bUV   = mod(floor(gl_FragCoord.xy / uPx), 8.0) / 8.0 + 0.5 / 8.0;
    float thr   = texture2D(tBayer, bUV).r;
    float sc    = clamp(lum, 0.0, 0.9999) * 4.0;
    float base  = floor(sc);
    float level = min(base + step(thr, sc - base), 3.0);

    gl_FragColor = vec4(pal(level), 1.0);
  }
`;

export default function DitherBg() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    let W = mount.clientWidth;
    let H = mount.clientHeight;
    if (!W || !H) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    mount.appendChild(renderer.domElement);

    const rt = new THREE.WebGLRenderTarget(W, H, {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const bgMat = new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT, fragmentShader: BG_FRAG,
      uniforms: { uTime: { value: 0 } },
      depthTest: false, depthWrite: false,
    });
    const bgScene = new THREE.Scene();
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    const bayerData = new Uint8Array(64 * 4);
    BAYER.forEach((v, i) => {
      const n = Math.round((v / 63) * 255);
      bayerData[i*4] = bayerData[i*4+1] = bayerData[i*4+2] = n; bayerData[i*4+3] = 255;
    });
    const bayerTex = new THREE.DataTexture(bayerData, 8, 8, THREE.RGBAFormat);
    bayerTex.magFilter = bayerTex.minFilter = THREE.NearestFilter;
    bayerTex.wrapS = bayerTex.wrapT = THREE.RepeatWrapping;
    bayerTex.needsUpdate = true;

    const ditherMat = new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT, fragmentShader: DITHER_FRAG,
      uniforms: {
        tScene: { value: rt.texture },
        tBayer: { value: bayerTex },
        uRes:   { value: new THREE.Vector2(W, H) },
        uPx:    { value: 3.0 },
      },
      depthTest: false, depthWrite: false,
    });
    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ditherMat));

    let animId: number;
    let t = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.006;
      bgMat.uniforms.uTime.value = t;
      renderer.setRenderTarget(rt);
      renderer.autoClear = true;
      renderer.render(bgScene, ortho);
      renderer.setRenderTarget(null);
      renderer.autoClear = true;
      renderer.render(postScene, ortho);
    }
    animate();

    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H);
      rt.setSize(W, H);
      (ditherMat.uniforms.uRes.value as THREE.Vector2).set(W, H);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      rt.dispose(); bayerTex.dispose(); renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}
