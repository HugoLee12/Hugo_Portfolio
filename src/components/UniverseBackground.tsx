import { AdditiveBlending, BackSide, Color, Mesh, Points, ShaderMaterial } from 'three';
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function UniverseBackground() {
  const starsRef = useRef<Points>(null!);
  const nebulaRef = useRef<Points>(null!);
  const glowRef = useRef<Mesh>(null!);

  const {
    starPos,
    starCol,
    starSize,
    starPhase,
    nebulaPos,
    nebulaCol,
    nebulaSize,
  } = useMemo(() => {
    const sCount = 8000;
    const sPos = new Float32Array(sCount * 3);
    const sCol = new Float32Array(sCount * 3);
    const sSize = new Float32Array(sCount);
    const sPhase = new Float32Array(sCount);

    const sColors = [
      new Color("#ffffff"),
      new Color("#e2e8f0"),
      new Color("#93c5fd"),
      new Color("#fca5a5"),
      new Color("#fde047"),
    ];

    for (let i = 0; i < sCount; i++) {
      const r = 40 + Math.pow(Math.random(), 2) * 100;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      sPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      sPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      sPos[i * 3 + 2] = r * Math.cos(phi);

      sSize[i] = 1.0 + Math.random() * 2.5;

      const c = sColors[Math.floor(Math.random() * sColors.length)];
      const intensity = 0.4 + Math.random() * 0.6;
      sCol[i * 3] = c.r * intensity;
      sCol[i * 3 + 1] = c.g * intensity;
      sCol[i * 3 + 2] = c.b * intensity;

      sPhase[i] = Math.random() * Math.PI * 2;
    }

    const nCount = 1200;
    const nPos = new Float32Array(nCount * 3);
    const nCol = new Float32Array(nCount * 3);
    const nSize = new Float32Array(nCount);

    const nColors = [
      new Color("#0ea5e9"),
      new Color("#6366f1"),
      new Color("#a855f7"),
      new Color("#ec4899"),
      new Color("#1e1b4b"),
    ];

    for (let i = 0; i < nCount; i++) {
      const r = 25 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;

      nPos[i * 3] = r * Math.cos(theta);

      nPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      nPos[i * 3 + 2] = r * Math.sin(theta);

      nSize[i] = 40 + Math.random() * 60;

      const c = nColors[Math.floor(Math.random() * nColors.length)];

      const mixRatio = r / 105;
      const brightness = 0.02 + Math.random() * 0.05 * (1 - mixRatio);
      nCol[i * 3] = c.r * brightness;
      nCol[i * 3 + 1] = c.g * brightness;
      nCol[i * 3 + 2] = c.b * brightness;
    }

    return {
      starPos: sPos,
      starCol: sCol,
      starSize: sSize,
      starPhase: sPhase,
      nebulaPos: nPos,
      nebulaCol: nCol,
      nebulaSize: nSize,
    };
  }, []);

  const starShader = useMemo(
    () => ({
      uniforms: { time: { value: 0 } },
      vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 customColor;
      attribute float phase;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = customColor;
        vAlpha = 0.2 + 0.8 * sin(time * 1.5 + phase);
        vAlpha = clamp(vAlpha, 0.1, 1.0);

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if(ll > 0.5) discard;
        // Soft round star with slight glow edge
        float intensity = pow(1.0 - (ll * 2.0), 1.5);
        gl_FragColor = vec4(vColor, vAlpha * intensity);
      }
    `,
    }),
    [],
  );

  const nebulaShader = useMemo(
    () => ({
      uniforms: { time: { value: 0 } },
      vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if(ll > 0.5) discard;
        // Super soft falloff for cloud-like appearance
        float intensity = pow(1.0 - (ll * 2.0), 3.0);
        gl_FragColor = vec4(vColor, intensity);
      }
    `,
    }),
    [],
  );

  useFrame((state) => {
    if (starsRef.current) {
      (starsRef.current.material as ShaderMaterial).uniforms.time.value =
        state.clock.elapsedTime;
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }

    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });

  return (
    <group raycast={() => null} renderOrder={-5}>
      <mesh ref={glowRef} raycast={() => null} renderOrder={-10}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial
          color="#02030a"
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      <points ref={nebulaRef} renderOrder={-4}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nebulaPos.length / 3}
            array={nebulaPos}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-customColor"
            count={nebulaCol.length / 3}
            array={nebulaCol}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={nebulaSize.length}
            array={nebulaSize}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          args={[nebulaShader]}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      <points ref={starsRef} renderOrder={-3}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPos.length / 3}
            array={starPos}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-customColor"
            count={starCol.length / 3}
            array={starCol}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starSize.length}
            array={starSize}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-phase"
            count={starPhase.length}
            array={starPhase}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          args={[starShader]}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
