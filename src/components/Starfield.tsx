import React, { useMemo, useRef, useEffect } from 'react';
import { AdditiveBlending, Group, MathUtils, Points, ShaderMaterial, Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';

const CONFIG = {
  bgColor: '#020205',
  flameColor: '#aee9ff',
  flameColor2: '#c79bff',
  flameAmt: 0.02,
  colorA: '#aef6cf',
  colorB: '#5fe6a0',
  colorC: '#eafff2',
  opacity: 1.0,
  pointSize: 35,
  brightness: 1.5,
  drift: 1.5,
  twinkle: 1,
  spin: 0.02,
  repelRadius: 5,
  repelStrength: 0.35,
  scrollPush: 8,
  scrollDrift: 6,
  scrollSpin: 0.1,
  parallax: 0.6,
};

const hexToVec3 = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const vertexShader = `
uniform float uTime; uniform float uSize; uniform float uDrift; uniform float uDepth; uniform float uTwinkle;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
attribute float aScale; attribute float aPhase; attribute float aPalette; attribute float aBright;
varying vec3 vColor; varying float vTwinkle;
void main() {
  vec3 pos = position;
  // Endless drift toward +Z with mod-wrap.
  pos.z = mod(pos.z + uDrift + (uDepth * 0.5), uDepth) - (uDepth * 0.5);

  float tw = sin(uTime * 1.6 + aPhase * 6.2831);
  vTwinkle = (1.0 - uTwinkle) + uTwinkle * (0.55 + 0.45 * tw);

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);

  vec3 toParticle = modelPosition.xyz - uCursor;
  float dist = length(toParticle);
  float falloff = smoothstep(uRepelRadius, 0.0, dist);
  modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / -viewPosition.z);

  vec3 base = aPalette < 0.5 ? uColorA : (aPalette < 1.5 ? uColorB : uColorC);
  vColor = base * aBright;
}
`;

const fragmentShader = `
uniform float uOpacity; uniform float uBrightness;
varying vec3 vColor; varying float vTwinkle;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float strength = pow(1.0 - d * 2.0, 4.0);
  vec3 color = mix(vec3(0.0), vColor, strength);
  gl_FragColor = vec4(color * uBrightness, strength * uOpacity * vTwinkle);
}
`;

class FlameBackgroundEffectImpl extends Effect {
  constructor(options: any = {}) {
    super('FlameBackgroundEffect', `
      uniform float iTime;
      uniform vec3 uBg;
      uniform vec3 uFlameA;
      uniform vec3 uFlameB;
      uniform float uFlameAmt;

      vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
        pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
        pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
        pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
        return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); 
      }

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
        vec2 screenUv = 2.0 * uv - 1.0;
        vec3 w = pow(warp3d(vec3(screenUv.x, sin(screenUv.y), screenUv.y), iTime*1.5), vec3(1.5));
        vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
        flame *= smoothstep(0.25, 1., abs(screenUv.y));
        float md = smoothstep(-0.7, 1., -screenUv.y*screenUv.x); flame *= md*md;
        vec3 bg = uBg * (1.0 - 0.4 * length(screenUv));
        
        outputColor = vec4(bg + flame*uFlameAmt + inputColor.rgb, 1.0);
      }
    `, {
      uniforms: new Map([
        ['iTime', new Uniform(0)],
        ['uBg', new Uniform(hexToVec3(CONFIG.bgColor))],
        ['uFlameA', new Uniform(hexToVec3(CONFIG.flameColor))],
        ['uFlameB', new Uniform(hexToVec3(CONFIG.flameColor2))],
        ['uFlameAmt', new Uniform(CONFIG.flameAmt)],
      ] as [string, Uniform][])
    });
  }

  update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime: number) {
    const time = this.uniforms.get('iTime');
    if (time) {
      time.value += deltaTime;
    }
  }
}

// React wrapper for custom effect
const FlameBackgroundEffect = React.forwardRef((props, ref) => {
  const effect = useMemo(() => new FlameBackgroundEffectImpl(), []);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

export function Starfield() {
  const pointsRef = useRef<Points>(null);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { camera, pointer, raycaster } = useThree();

  const count = 4200;
  const depth = 30;

  const { positions, scales, phases, palettes, brights } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const palettes = new Float32Array(count);
    const brights = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 24;
        positions[i3 + 1] = (Math.random() - 0.5) * 16;
        positions[i3 + 2] = (Math.random() - 0.5) * depth;
        palettes[i] = Math.floor(Math.random() * 3);
        brights[i] = 0.7 + Math.random() * 0.6;
        scales[i] = 0.5 + Math.pow(Math.random(), 1.4) * 2.5;
        phases[i] = Math.random();
    }
    return { positions, scales, phases, palettes, brights };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: CONFIG.pointSize },
    uOpacity: { value: 0 },
    uDrift: { value: 0 },
    uDepth: { value: depth },
    uTwinkle: { value: CONFIG.twinkle },
    uCursor: { value: new Vector3() },
    uRepelRadius: { value: CONFIG.repelRadius },
    uRepelStrength: { value: CONFIG.repelStrength },
    uActivity: { value: 0 },
    uColorA: { value: hexToVec3(CONFIG.colorA) },
    uColorB: { value: hexToVec3(CONFIG.colorB) },
    uColorC: { value: hexToVec3(CONFIG.colorC) },
    uBrightness: { value: CONFIG.brightness },
  }), []);

  const stateRef = useRef({
      mouseSmooth: new Vector2(),
      scrollSmooth: 0,
      scrollCurrent: 0,
      scrollCurrentTarget: 0,
      active: false,
      appearTime: 0,
  });

  const worldTarget = useRef(new Vector3());

  const scrollMax = useRef(0);

  useEffect(() => {
    stateRef.current.appearTime = performance.now() / 1000;
    
    const updateScrollMax = () => {
      scrollMax.current = document.documentElement.scrollHeight - window.innerHeight;
    };
    
    updateScrollMax();
    window.addEventListener('resize', updateScrollMax);
    
    const handleScroll = () => {
      const max = scrollMax.current;
      const progress = max > 0 ? (window.scrollY / max) : 0;
      stateRef.current.scrollCurrentTarget = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateScrollMax);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    
    // Appear fade
    if (materialRef.current) {
        const fade = Math.min(1.0, Math.max(0.0, (performance.now() / 1000 - stateRef.current.appearTime - 0.2) / 1.4));
        materialRef.current.uniforms.uOpacity.value = fade * CONFIG.opacity;
        materialRef.current.uniforms.uTime.value = t;
    }

    // Scroll smoothing
    const targetScroll = stateRef.current.scrollCurrentTarget || 0;
    stateRef.current.scrollSmooth = MathUtils.lerp(stateRef.current.scrollSmooth, targetScroll, 0.10);
    stateRef.current.scrollCurrent = MathUtils.lerp(stateRef.current.scrollCurrent, stateRef.current.scrollSmooth, 0.06);

    // Update drift
    if (materialRef.current) {
      materialRef.current.uniforms.uDrift.value += dt * (CONFIG.drift + stateRef.current.scrollCurrent * CONFIG.scrollDrift);
    }

    // group rotation
    if (groupRef.current) {
        groupRef.current.rotation.z += dt * (CONFIG.spin + stateRef.current.scrollCurrent * CONFIG.scrollSpin);
    }
    
    // Pointer check
    if (Math.abs(pointer.x) > 0.001 || Math.abs(pointer.y) > 0.001) {
        stateRef.current.active = true;
    }
    
    // Parallax
    stateRef.current.mouseSmooth.lerp(pointer, 0.06);
    
    camera.position.set(stateRef.current.mouseSmooth.x * CONFIG.parallax, stateRef.current.mouseSmooth.y * CONFIG.parallax, 5 - stateRef.current.scrollCurrent * CONFIG.scrollPush);
    camera.lookAt(stateRef.current.mouseSmooth.x * CONFIG.parallax, stateRef.current.mouseSmooth.y * CONFIG.parallax, -10);

    // Cursor void interaction
    if (stateRef.current.active && materialRef.current) {
        raycaster.setFromCamera(pointer, camera);
        raycaster.ray.at(5, worldTarget.current);
        materialRef.current.uniforms.uCursor.value.lerp(worldTarget.current, 0.1);
        materialRef.current.uniforms.uActivity.value = MathUtils.lerp(materialRef.current.uniforms.uActivity.value, 1, 0.05);
    } else if (materialRef.current) {
        materialRef.current.uniforms.uActivity.value = MathUtils.lerp(materialRef.current.uniforms.uActivity.value, 0, 0.05);
    }

  });

  return (
    <>
      <color attach="background" args={[CONFIG.bgColor]} />
      <fog attach="fog" args={[CONFIG.bgColor, 0, 15]} />
      <PerspectiveCamera makeDefault fov={45} near={0.1} far={80} position={[0, 0, 5]} />
      
      <group ref={groupRef}>
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            <bufferAttribute attach="attributes-aScale" count={count} array={scales} itemSize={1} />
            <bufferAttribute attach="attributes-aPhase" count={count} array={phases} itemSize={1} />
            <bufferAttribute attach="attributes-aPalette" count={count} array={palettes} itemSize={1} />
            <bufferAttribute attach="attributes-aBright" count={count} array={brights} itemSize={1} />
          </bufferGeometry>
          <shaderMaterial 
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.5} intensity={0.2} mipmapBlur />
        <FlameBackgroundEffect />
      </EffectComposer>
    </>
  );
}
