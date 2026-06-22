import { useRef, useEffect, useState, useMemo } from "react";
import { motion, useAnimate } from "motion/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Project } from "../data";
import { audioManager } from "../lib/audio";
import { DossierContent } from "./DossierContent";

const planetVertexShader = `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying mat3 vNormalMatrix;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }
  float getElevation(vec3 pos, float time) {
      vec3 noisePos = pos * 2.5 + vec3(time, time * 0.5, 0.0);
      float n1 = fbm(noisePos);
      return smoothstep(0.4, 0.65, n1);
  }

  void main() {
    vPos = position;
    vNormalMatrix = normalMatrix;
    float time = uTime * 0.15;
    float elevation = getElevation(position, time);
    float displacement = elevation * 0.15;

    vec3 displacedPosition = position + normal * displacement;

    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const planetFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uEmissiveIntensity;
  uniform float uHasRings;

  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying mat3 vNormalMatrix;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  float getElevation(vec3 pos, float time) {
      vec3 noisePos = pos * 2.5 + vec3(time, time * 0.5, 0.0);
      float n1 = fbm(noisePos);
      return smoothstep(0.4, 0.65, n1);
  }

  void main() {
      float time = uTime * 0.15;
      float elevation = getElevation(vPos, time);
      float landMask = elevation;
      float e = 0.01;
      float dx = getElevation(vPos + vec3(e, 0.0, 0.0), time) - elevation;
      float dy = getElevation(vPos + vec3(0.0, e, 0.0), time) - elevation;
      float dz = getElevation(vPos + vec3(0.0, 0.0, e), time) - elevation;

      vec3 localGrad = vec3(dx, dy, dz) / e;
      vec3 localBaseNormal = normalize(vPos);

      vec3 localNormal = normalize(localBaseNormal - localGrad * 0.4);

      vec3 normal = normalize(vNormalMatrix * localNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      vec3 cloudShadowPos = (vPos + lightDir * 0.05) * 2.0 + vec3(0.0, 0.0, time * 1.5);
      float nShadow = fbm(cloudShadowPos);
      float cloudShadowMask = smoothstep(0.5, 0.9, nShadow);
      float ringShadow = 1.0;
      if (uHasRings > 0.5) {
          float tRing = -vPos.y / lightDir.y;
          if (tRing > 0.0) {
              vec3 hitPos = vPos + tRing * lightDir;
              float hitDist = length(hitPos);
              float r = length(vPos); 

              float hitMask = smoothstep(r * 1.35, r * 1.5, hitDist) * (1.0 - smoothstep(r * 2.3, r * 2.45, hitDist));
              float ringNoise = fbm(hitPos * 10.0);
              float ringDensity = hitMask * (0.4 + 0.6 * ringNoise);
              ringShadow = mix(1.0, 0.2, ringDensity);
          }
      }
      vec3 oceanColor = uColor * 0.15;
      vec3 landColor = mix(uColor * 0.8, vec3(1.0), 0.2);
      vec3 surfaceColor = mix(oceanColor, landColor, landMask);
      float diff = max(dot(normal, lightDir), 0.0);
      float ambient = 0.15;
      float shadowFactor = 1.0 - (cloudShadowMask * 0.85);
      vec3 halfVector = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfVector), 0.0), 32.0);
      float specularLight = spec * (1.0 - landMask) * 0.8;
      diff = diff * 0.8 + 0.2;
      vec3 lightedSurface = surfaceColor * (diff * shadowFactor * ringShadow + ambient) + (specularLight * shadowFactor * ringShadow * uColor);
      float nightMask = 1.0 - smoothstep(0.0, 0.25, dot(normal, lightDir));
      vec3 cityPos = vPos * 30.0;
      float cityNoise1 = fbm(cityPos);
      float cityNoise2 = fbm(cityPos * 2.0 + vec3(time * 0.1));
      float citySpot = pow(cityNoise1, 3.0) * 8.0;
      float cityPattern = clamp(citySpot * smoothstep(0.3, 0.7, cityNoise2), 0.0, 1.0);
      float cityGlow = cityPattern * landMask * nightMask * (1.0 - cloudShadowMask * 0.8);
      vec3 glowColor = mix(uColor, vec3(1.0), 0.6) * 4.0;
      lightedSurface += glowColor * cityGlow;
      float NdotL = dot(normal, lightDir);
      float terminatorGlow = smoothstep(-0.15, 0.2, NdotL) * smoothstep(0.2, -0.15, NdotL);
      vec3 sunsetColor = mix(vec3(0.9, 0.4, 0.1), uColor, 0.3);
      lightedSurface += sunsetColor * terminatorGlow * (1.0 - cloudShadowMask * 0.5) * ringShadow * 0.8;
      vec3 baseViewNormal = normalize(vNormalMatrix * localBaseNormal);
      float fresnel = dot(viewDir, baseViewNormal);
      float rimNdotL = dot(localBaseNormal, lightDir);
      float nightFade = smoothstep(-0.4, 0.1, rimNdotL);
      vec3 rimColor = mix(sunsetColor, uColor, smoothstep(-0.2, 0.5, rimNdotL));
      float atmosphereRim = smoothstep(0.0, 0.8, 1.0 - max(fresnel, 0.0));
      float edgeHalo = pow(max(1.0 - fresnel, 0.0), 3.0);
      vec3 finalColor = lightedSurface;
      finalColor += rimColor * atmosphereRim * nightFade * 0.6; 
      finalColor += mix(vec3(1.0), rimColor, 0.5) * edgeHalo * nightFade * 1.2;
      finalColor *= uEmissiveIntensity * 1.5;
      float auraGlow = pow(1.0 - max(fresnel, 0.0), 4.0);
      finalColor += uColor * auraGlow * 1.2;

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const cloudVertexShader = `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const cloudFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uEmissiveIntensity;

  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  void main() {
      float time = uTime * 0.15;
      vec3 cloudNoisePos = vPos * 2.0 + vec3(0.0, 0.0, time * 1.5);
      float n2 = fbm(cloudNoisePos);
      float cloudMask = smoothstep(0.45, 0.85, n2);

      if (cloudMask <= 0.01) discard;

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(normal, lightDir), 0.0);
      float ambient = 0.15;

      float fresnel = max(dot(viewDir, normal), 0.0);
      float thickness = mix(0.4, 1.0, fresnel);

      vec3 baseCloudColor = mix(vec3(0.9), uColor, 0.2);
      float subScatter = pow(max(dot(viewDir, lightDir), 0.0), 4.0) * 0.4;

      vec3 lightedCloud = baseCloudColor * (diff * 0.9 + ambient + subScatter) * thickness;
      lightedCloud *= uEmissiveIntensity * 1.5;


      gl_FragColor = vec4(lightedCloud, cloudMask * 0.85);
  }
`;

function IsolatedPlanetNode({ project }: { project: Project }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(project.color) },
      uEmissiveIntensity: { value: 0.8 },
      uHasRings: { value: 0.0 },
    }),
    [project.color],
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <group scale={[1.5, 1.5, 1.5]}>
      <pointLight position={[3, 3, 5]} intensity={20} color={project.color} />
      <ambientLight intensity={0.2} />

      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
        />
        <mesh>
          <sphereGeometry args={[1.02, 64, 64]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={cloudVertexShader}
            fragmentShader={cloudFragmentShader}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </mesh>
    </group>
  );
}

export function InnerDimensionFocusPanel({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCanvas(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleExit = async () => {
    if (isExiting) return;
    setIsExiting(true);

    const mainPanel = scope.current.querySelector(
      ".holo-main-panel",
    ) as HTMLElement;
    const overlay = scope.current.querySelector(".holo-overlay") as HTMLElement;
    const sliceElems = scope.current.querySelectorAll(".glitch-slice");

    audioManager.playZap();

    await animate(
      mainPanel,
      {
        filter: [
          "contrast(1) sepia(0) hue-rotate(0deg)",
          "contrast(2.5) drop-shadow(4px 0 0 cyan) drop-shadow(-4px 0 0 red) hue-rotate(90deg)",
          "contrast(3) drop-shadow(-4px 0 0 magenta) drop-shadow(4px 0 0 lime) hue-rotate(-90deg)",
          "contrast(1) sepia(0) hue-rotate(0deg)",
        ],
        x: [0, -4, 4, 0],
        skewX: [0, 1, -1, 0],
      },
      { duration: 0.15, ease: "linear" },
    );

    animate(
      mainPanel,
      { filter: ["brightness(1)", "brightness(2)", "brightness(2.5)"] },
      { duration: 0.25 },
    );

    const sliceAnims = Array.from(sliceElems).map((el) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const shiftX = Math.random() * 20 + 5;

      return animate(
        el,
        {
          transform: [
            `translateX(0%)`,
            `translateX(${shiftX * direction}%)`,
            `translateX(${shiftX * direction * 3}%)`,
          ],
          opacity: [1, Math.random() * 0.5 + 0.2, 0],
        },
        {
          duration: 0.25,
          delay: Math.random() * 0.1,
          ease: "circOut",
        },
      );
    });

    await Promise.all(sliceAnims);

    audioManager.playPowerDown();

    animate(
      overlay,
      { opacity: 0, backdropFilter: "blur(0px)" },
      { duration: 0.2 },
    );

    await animate(
      mainPanel,
      {
        scaleY: [1, 0.01, 0.01, 0],
        scaleX: [1, 1, 0.1, 0],
        filter: [
          "brightness(2)",
          "brightness(8) drop-shadow(0 0 20px cyan)",
          "brightness(10) drop-shadow(0 0 50px white)",
          "brightness(0)",
        ],
        opacity: [1, 1, 1, 0],
      },
      { duration: 0.2, times: [0, 0.3, 0.7, 1], ease: "easeIn" },
    );

    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExit();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleExit]);

  const SLICE_COUNT = 25;

  return (
    <div
      ref={scope}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
    >
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <mask
            id="hologram-mask"
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
          >
            {Array.from({ length: SLICE_COUNT }).map((_, i) => (
              <rect
                key={i}
                className="glitch-slice"
                x="0"
                y={(i / SLICE_COUNT).toFixed(4)}
                width="1"
                height={(1 / SLICE_COUNT + 0.01).toFixed(4)}
                fill="white"
              />
            ))}
          </mask>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
        className="holo-overlay absolute inset-0 bg-[#020617]/30"
        onClick={handleExit}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 250, mass: 1.2 }}
        className="holo-main-panel relative z-10 flex flex-col md:flex-row w-[90vw] max-w-[1000px] h-[80vh] md:h-[650px] backdrop-blur-md overflow-hidden rounded-sm"
        style={
          {
            "--hologram-core": project.color,
            backgroundColor:
              "color-mix(in srgb, var(--hologram-core) 5%, rgba(2, 6, 23, 0.15))",
            boxShadow: `0 0 80px color-mix(in srgb, var(--hologram-core) 25%, transparent), 
                      inset 0 0 50px color-mix(in srgb, var(--hologram-core) 15%, transparent),
                      0 0 2px 1px color-mix(in srgb, var(--hologram-core) 50%, transparent)`,
            maskImage: "url(#hologram-mask)",
            WebkitMaskImage: "url(#hologram-mask)",
          } as React.CSSProperties
        }
      >
        <div
          className="relative w-full md:w-1/2 h-1/2 md:h-full shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r"
          style={{
            borderColor:
              "color-mix(in srgb, var(--hologram-core) 20%, transparent)",
          }}
        >
          {showCanvas ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  maxDistance={12}
                  minDistance={5}
                  autoRotate={true}
                  autoRotateSpeed={0.5}
                  dampingFactor={0.05}
                />
                <IsolatedPlanetNode project={project} />
              </Canvas>
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin opacity-80"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--hologram-core) 20%, transparent)",
                  borderTopColor: "var(--hologram-core)",
                  boxShadow:
                    "0 0 15px color-mix(in srgb, var(--hologram-core) 40%, transparent)",
                }}
              />
            </div>
          )}

          <div
            className="absolute bottom-4 left-4 font-mono text-[9px] tracking-widest uppercase select-none pointer-events-none opacity-60"
            style={{ color: "var(--hologram-core)" }}
          >
            SYS_HOLO SCALE: ISOLATED_VIEW
          </div>
        </div>

        <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-transparent overflow-hidden shrink-0">
          <DossierContent project={project} onClose={handleExit} />
        </div>
      </motion.div>
    </div>
  );
}
