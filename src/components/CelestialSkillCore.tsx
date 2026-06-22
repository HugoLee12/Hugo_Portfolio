import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useAppStore } from '../store';
import { enhancedSkills, SkillData } from '../data/skills';

interface WordProps {
  children: string;
  position: THREE.Vector3;
  skillData?: SkillData;
}

function Word({ children, position }: WordProps) {
  const fontProps = {
    font: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf', // Inter
    fontSize: 1.2,
    letterSpacing: -0.05,
    lineHeight: 1,
  };
  const ref = useRef<any>(null);
  const setHoveredSkill = useAppStore(state => state.setHoveredSkill);
  const hoveredSkill = useAppStore(state => state.hoveredSkill);
  const { camera } = useThree();
  
  const isHovered = hoveredSkill === children;
  const isRelated = hoveredSkill && enhancedSkills[hoveredSkill]?.relations.includes(children);

  const over = (e: any) => {
    e.stopPropagation();
    if (e.nativeEvent && e.nativeEvent.buttons !== undefined && e.nativeEvent.buttons !== 0) return;
    setHoveredSkill(children);
    document.body.style.cursor = 'pointer';
  };
  const out = (e: any) => {
    if (e.nativeEvent && e.nativeEvent.buttons !== undefined && e.nativeEvent.buttons !== 0) return;
    setHoveredSkill(null);
    document.body.style.cursor = 'auto';
  };

  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const tempCamDir = useMemo(() => new THREE.Vector3(), []);
  const currentColor = useMemo(() => new THREE.Color('#64748b'), []);
  const targetColorObj = useMemo(() => new THREE.Color(), []);
  const glowColor = useMemo(() => new THREE.Color('#88eadd'), []);
  const brightColor = useMemo(() => new THREE.Color('#ffffff'), []);

  useFrame((state) => {
    if (ref.current && ref.current.scale && typeof ref.current.scale.lerp === 'function') {
      ref.current.getWorldPosition(targetVec);
      
      // Calculate depth-based effects accurately relative to the moving camera
      tempCamDir.copy(state.camera.position).normalize();
      const distToCore = targetVec.length();
      
      // Dot product measures alignment: +1 is exactly between core and camera, -1 is behind core
      const relativeZRatio = distToCore > 0 
        ? (targetVec.x * tempCamDir.x + targetVec.y * tempCamDir.y + targetVec.z * tempCamDir.z) / distToCore 
        : 0;
        
      // Map [-1, 1] to [0, 1] for visual scaling and ambient depth
      const normalizedZ = (relativeZRatio + 1.0) / 2.0;
      
      let baseScale = 0.8 + (normalizedZ * 0.4); // 0.8 to 1.2
      let targetScale = isHovered ? baseScale * 1.6 : (isRelated ? baseScale * 1.3 : baseScale);
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

      // Depth-based opacity (ambient)
      let targetOpacity = 0.1 + (normalizedZ * 0.4); // 0.1 to 0.5
      
      let colorHex = '#64748b'; // Main text default - darker slate blue for unlit text
      if (isHovered) {
        colorHex = '#ffffff'; // Active text
        targetOpacity = 1;
      } else if (isRelated) {
        colorHex = '#88eadd'; // Accent
        targetOpacity = 0.9;
      } else if (!hoveredSkill) {
        colorHex = '#64748b';
      } else {
        colorHex = '#334155'; // Muted
        targetOpacity = 0.05 + (normalizedZ * 0.15); // Even dimmer
      }

      // Tính tương tác ánh sáng (Rim light và Backlight xuyên thấu)
      // Sử dụng relativeZRatio đã được tính chuẩn xác theo góc nhìn của Camera OrbitControls
      const zRatio = relativeZRatio; 
      
      let lightIntensity = 0;
      
      if (zRatio > 0) {
          // Text ở phía trước lõi mặt trời: Nhận ánh sáng Backlight cực gắt xuyên qua
          lightIntensity += Math.pow(zRatio, 1.2) * 2.0; 
      } else {
          // Text ở phía sau lõi mặt trời: Nhận ánh sáng chiếu trực diện nhưng có chiều sâu (giảm sắc độ)
          lightIntensity += Math.pow(Math.abs(zRatio), 1.2) * 1.0; 
      }
      
      // Hào quang viền (Rim light) tỏa ra xung quanh vành đai xích đạo
      // Mở rộng quầng sáng (giảm số mũ, ví dụ từ 5.0 xuống 2.5) giúp quá trình tính toán và nhận sáng dần dần (thời gian chuẩn bị tốt hơn, mượt hơn)
      const rim = Math.pow(1.0 - Math.abs(zRatio), 2.5);
      lightIntensity += rim * 1.5;
      
      // Apply the cinematic cyan glow (#88eadd) when illuminated
      targetColorObj.set(colorHex);
      if (!isHovered && !isRelated) {
          // Mix with neon cyan, then blow out to white if intensely lit
          targetColorObj.lerp(glowColor, Math.min(1.0, lightIntensity * 1.2));
          if (lightIntensity > 0.8) {
             targetColorObj.lerp(brightColor, (lightIntensity - 0.8) * 1.5);
          }
          
          // Boost opacity heavily when lit
          targetOpacity = Math.min(1.0, targetOpacity + lightIntensity * 0.8);
      }
      
      // Lerp speed dao động theo cường độ ánh sáng (tỉ lệ thuận) để tạo cảm giác phản ứng ngay lập tức ở vùng trung tâm mặt trời
      // Khi ở xa (rìa), lightIntensity thấp -> tốc độ chuyển màu vừa phải (~0.1) mượt mà
      // Khi quá cảnh ngang lõi, lightIntensity cao -> tốc độ chớp sáng gần như tức thì (~0.8)
      const dynamicLerpSpeed = 0.08 + Math.min(0.8, lightIntensity * 0.4);
      
      currentColor.lerp(targetColorObj, dynamicLerpSpeed);
      
      const newOpacity = THREE.MathUtils.lerp(ref.current.fillOpacity, targetOpacity, dynamicLerpSpeed);
      ref.current.fillOpacity = newOpacity;
      ref.current.color = currentColor.getHex();
    }
  });

  return (
    <Billboard position={position}>
      <mesh onPointerOver={over} onPointerOut={out}>
        <planeGeometry args={[children.length * 0.7, 1.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Text
        ref={ref}
        fillOpacity={0}
        depthWrite={false}
        {...fontProps}
      >
        {children}
      </Text>
    </Billboard>
  );
}

// Draw lines between related skills
function ConnectionLines({ positions }: { positions: Record<string, THREE.Vector3> }) {
  const hoveredSkill = useAppStore(state => state.hoveredSkill);

  const lines = useMemo(() => {
    if (!hoveredSkill) return [];
    const skillData = enhancedSkills[hoveredSkill];
    if (!skillData) return [];

    const centerPos = positions[hoveredSkill];
    if (!centerPos) return [];

    return skillData.relations.map(related => {
      const endPos = positions[related];
      if (!endPos) return null;
      return [centerPos, endPos];
    }).filter(Boolean) as [THREE.Vector3, THREE.Vector3][];

  }, [hoveredSkill, positions]);

  return (
    <group>
      {lines.map((line, i) => (
        <Line 
          key={i} 
          points={line as any} 
          color="#9BAFC3" 
          lineWidth={1.2} 
          transparent 
          opacity={0.3} 
        />
      ))}
    </group>
  );
}

function AstrolabeRings() {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ring1Ref.current) {
        ring1Ref.current.rotation.x = time * 0.05;
        ring1Ref.current.rotation.y = time * 0.1;
    }
    if (ring2Ref.current) {
        ring2Ref.current.rotation.x = time * -0.07;
        ring2Ref.current.rotation.y = time * -0.05;
    }
  });

  return (
    <group>
      {/* Outer faint ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[17.5, 0.015, 16, 100]} />
        <meshBasicMaterial color="#9BAFC3" transparent opacity={0.15} />
      </mesh>
      {/* Inner offset ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[18.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#6FD6C8" transparent opacity={0.08} />
      </mesh>
      {/* Sphere environment haze */}
      <mesh>
        <sphereGeometry args={[16, 32, 32]} />
        <meshBasicMaterial color="#9BAFC3" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const sunFragmentShader = `
  uniform float time;
  uniform float hoverState;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    float speed = time * 0.4;
    vec3 p = vPosition * 2.5; 
    
    // Multi-octave noise for rich solar surface
    float n1 = snoise(p + vec3(0.0, speed, speed));
    float n2 = snoise(p * 2.0 - vec3(speed, speed, 0.0));
    float n3 = snoise(p * 4.0 + vec3(speed * 1.5, 0.0, speed * 1.5));
    
    float noiseVal = (n1 + n2 * 0.5 + n3 * 0.25) * 0.5 + 0.5;

    // Sun colors: Deep Red, Orange, Bright Yellow, White Heat
    vec3 colorDark = vec3(0.6, 0.1, 0.0);
    vec3 colorMid = vec3(1.0, 0.4, 0.0);
    vec3 colorLight = vec3(1.0, 0.8, 0.2);
    vec3 colorWhite = vec3(1.0, 1.0, 0.8);

    vec3 color = mix(colorDark, colorMid, smoothstep(0.1, 0.4, noiseVal));
    color = mix(color, colorLight, smoothstep(0.4, 0.7, noiseVal));
    color = mix(color, colorWhite, smoothstep(0.7, 1.0, noiseVal));

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    float fresnel = dot(normal, viewDir);
    float inverseFresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    float rim = pow(inverseFresnel, 2.0);
    
    // Add rim lighting for dramatic edge glow
    color += vec3(1.0, 0.6, 0.1) * rim * 1.5;
    
    // Intensify when hovering
    color *= 1.0 + hoverState * 0.6;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const coronaFragmentShader = `
  uniform float time;
  uniform float hoverState;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    float fresnel = dot(normal, viewDir);
    float inverseFresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    
    float intensity = pow(inverseFresnel, 3.0);
    
    vec3 coronaColor = vec3(1.0, 0.7, 0.2);
    
    float pulse = 0.8 + 0.2 * sin(time * 3.0);
    float glowMultiplier = 1.0 + hoverState * 2.0;

    float alpha = intensity * pulse * glowMultiplier;
    
    // inner fade out
    float rimFade = smoothstep(0.05, 0.5, fresnel);
    alpha *= rimFade;

    gl_FragColor = vec4(coronaColor, alpha * 0.8);
  }
`;

function CoreParticle() {
  const sunRef = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const hoveredSkill = useAppStore(state => state.hoveredSkill);

  const sharedUniforms = useMemo(() => {
    return {
      time: { value: 0 },
      hoverState: { value: 0 }
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    sharedUniforms.time.value = time;
    
    const targetHover = hoveredSkill ? 1 : 0;
    sharedUniforms.hoverState.value = THREE.MathUtils.lerp(
      sharedUniforms.hoverState.value,
      targetHover,
      0.1
    );
    
    const currentHover = sharedUniforms.hoverState.value;
    
    if (lightRef.current) {
        // Pulse light intensity and color slightly
        const baseIntensity = 30;
        lightRef.current.intensity = baseIntensity + currentHover * 20 + Math.sin(time * 2.0) * 5;
    }

    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002 + currentHover * 0.01;
      sunRef.current.rotation.z += 0.001 + currentHover * 0.005;
      
      const freq = 1.5 + currentHover * 5.0; 
      const amp = 0.02 + currentHover * 0.04; 
      
      const pulse = Math.sin(time * freq);
      const scale = 1 + pulse * amp; 
      sunRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.2);
    }

    if (coronaRef.current) {
       coronaRef.current.rotation.y += 0.002 + currentHover * 0.01;
       const coronaScale = 1 + Math.sin(time * 2.0) * 0.03 + currentHover * 0.15;
       coronaRef.current.scale.lerp(new THREE.Vector3(coronaScale, coronaScale, coronaScale), 0.2);
    }
  });

  return (
    <group>
      {/* Cinematic Core Light */}
      <pointLight ref={lightRef} distance={100} intensity={30} color="#88eadd" decay={1.2} />
      
      {/* Sun Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <shaderMaterial
          uniforms={sharedUniforms}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
        />
      </mesh>
      
      {/* Sun Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <shaderMaterial
          uniforms={sharedUniforms}
          vertexShader={sunVertexShader}
          fragmentShader={coronaFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function CelestialCloud({ radius = 15, words }: { radius?: number; words: string[] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const wordPositions = useMemo(() => {
    const temp: Record<string, THREE.Vector3> = {};
    const count = words.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2; 
        const r = Math.sqrt(1 - y * y); 
        
        const theta = phi * i; 
        
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        
        temp[words[i]] = new THREE.Vector3(x * radius, y * radius, z * radius);
    }
    return temp;
  }, [words, radius]);

  useFrame((state) => {
    if (groupRef.current) {
        // Very slow ambient rotation
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group>
        <AstrolabeRings />
        <CoreParticle />
        <group ref={groupRef}>
          <ConnectionLines positions={wordPositions} />
          {Object.entries(wordPositions).map(([word, pos], index) => (
              <Word key={index} position={pos} skillData={enhancedSkills[word]}>
                 {word}
              </Word>
          ))}
        </group>
    </group>
  );
}

export function CelestialSkillCore({ words }: { words: string[] }) {
  return (
    <>
      <CelestialCloud radius={15} words={words} />
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
      </EffectComposer>
    </>
  );
}
