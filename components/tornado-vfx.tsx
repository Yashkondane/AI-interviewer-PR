"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

const BLUE = new THREE.Color("#3b82f6")

// Inline perlin noise in GLSL so no texture file is needed
const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`

// Vertex shader: parabolic twisted cylinder (matches TSL twistedCylinder)
const cylinderVert = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  uniform float uParabolStrength;
  uniform float uParabolOffset;
  uniform float uParabolAmplitude;
  varying vec2 vUv;
  varying float vEffect;

  void main() {
    vUv = uv;
    float angle = atan(position.z, position.x);
    float elevation = position.y;
    float radius = uParabolStrength * pow(elevation - uParabolOffset, 2.0) + uParabolAmplitude;
    radius += sin((elevation - uTime * 0.2) * 20.0 + angle * 2.0) * 0.05;

    vec3 twisted = vec3(cos(angle) * radius, elevation, sin(angle) * radius);

    // Noise-based alpha mask
    float t = uTime * 0.2;
    float skewU = uv.x + uv.y * (-1.0);
    vec2 nuv1 = vec2(skewU, uv.y) * vec2(2.0, 0.25) + vec2(t, -t);
    float n1 = snoise(vec3(nuv1 * 4.0, 0.5));
    n1 = smoothstep(0.45, 0.7, n1 * 0.5 + 0.5);

    vec2 nuv2 = vec2(skewU, uv.y) * vec2(5.0, 1.0) + vec2(t * 0.5, -t);
    float n2 = snoise(vec3(nuv2 * 4.0, 1.5));
    n2 = smoothstep(0.45, 0.7, n2 * 0.5 + 0.5);

    float outerFade = smoothstep(0.0, 0.1, uv.y) * smoothstep(0.0, 0.4, 1.0 - uv.y);
    vEffect = n1 * n2 * outerFade;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(twisted, 1.0);
  }
`

const cylinderFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vEffect;

  void main() {
    float a = smoothstep(0.0, 0.1, vEffect);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * 1.8, a);
  }
`

// Floor vertex / fragment
const floorVert = /* glsl */ `
  ${noiseGLSL}
  uniform float uTime;
  varying vec2 vUv;
  varying float vEffect;

  void main() {
    vUv = uv;
    float t = uTime * 0.2;
    vec2 centered = uv - 0.5;
    float dist = length(centered);
    float angle = atan(centered.y, centered.x);
    vec2 radUv = vec2((angle + 3.14159) / (2.0 * 3.14159), dist);

    vec2 nuv1 = radUv * vec2(0.5, 0.5);
    nuv1.x += t; nuv1.y += t;
    nuv1 = vec2(nuv1.x + nuv1.y * -1.0, nuv1.y) * vec2(4.0, 1.0);
    float n1 = snoise(vec3(nuv1 * 3.0, 0.3));
    n1 = smoothstep(0.45, 0.7, n1 * 0.5 + 0.5);

    vec2 nuv2 = radUv * vec2(2.0, 8.0);
    nuv2.x += t * 2.0; nuv2.y += t * 8.0;
    nuv2 = vec2(nuv2.x + nuv2.y * -0.25, nuv2.y) * vec2(2.0, 0.25);
    float n2 = snoise(vec3(nuv2 * 3.0, 1.2));
    n2 = smoothstep(0.45, 0.7, n2 * 0.5 + 0.5);

    float outerFade = smoothstep(0.5, 0.9, 1.0 - dist) * smoothstep(0.0, 0.2, dist);
    float effect = n1 * n2 * outerFade;
    float stepped = step(0.2, effect);
    vEffect = stepped * 3.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const floorFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vEffect;

  void main() {
    float a = smoothstep(0.0, 0.01, vEffect * 0.33);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * vEffect, a);
  }
`

export default function TornadoVFX() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight || 520

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    mount.appendChild(renderer.domElement)

    // Scene / Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(25, W / H, 0.1, 50)
    camera.position.set(1, 1, 3)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.y = 0.4
    controls.enableDamping = true
    controls.minDistance = 0.5
    controls.maxDistance = 10

    const colorVec = new THREE.Vector3(BLUE.r, BLUE.g, BLUE.b)

    // Shared uniforms
    const sharedUniforms = {
      uTime: { value: 0 },
      uColor: { value: colorVec },
      uParabolStrength: { value: 1.0 },
      uParabolOffset: { value: 0.3 },
      uParabolAmplitude: { value: 0.2 },
    }

    // Floor
    const floorMat = new THREE.ShaderMaterial({
      vertexShader: floorVert,
      fragmentShader: floorFrag,
      uniforms: sharedUniforms,
      transparent: true,
      depthWrite: false,
    })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 32, 32), floorMat)
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    // Cylinder geometry
    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 24, 24, true)
    cylGeo.translate(0, 0.5, 0)

    // Emissive cylinder
    const emissiveMat = new THREE.ShaderMaterial({
      vertexShader: cylinderVert,
      fragmentShader: cylinderFrag,
      uniforms: {
        ...sharedUniforms,
        uParabolAmplitude: { value: 0.15 }, // slightly inner
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    scene.add(new THREE.Mesh(cylGeo, emissiveMat))

    // Dark (outer) cylinder — subtle black ring
    const darkFrag = /* glsl */ `
      varying float vEffect;
      void main() {
        float a = smoothstep(0.0, 0.01, vEffect);
        if (a < 0.01) discard;
        gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.7);
      }
    `
    const darkMat = new THREE.ShaderMaterial({
      vertexShader: cylinderVert,
      fragmentShader: darkFrag,
      uniforms: { ...sharedUniforms },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    scene.add(new THREE.Mesh(cylGeo, darkMat))

    // Resize
    function onResize() {
      const w = mount.clientWidth
      const h = mount.clientHeight || 520
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", onResize)

    // Animate
    const clock = new THREE.Clock()
    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      sharedUniforms.uTime.value = t
      emissiveMat.uniforms.uTime.value = t
      darkMat.uniforms.uTime.value = t
      floorMat.uniforms.uTime.value = t
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="w-full"
      style={{ height: "520px", borderRadius: "1rem", overflow: "hidden" }}
      aria-hidden
    />
  )
}
