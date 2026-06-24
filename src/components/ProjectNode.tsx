
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useCallback, useEffect } from "react";
import { AdditiveBlending, BufferGeometry, Color, DoubleSide, Group, LineLoop, MathUtils, Mesh, MeshBasicMaterial, ShaderMaterial, SphereGeometry, Vector3 } from 'three';
import { Html, Text, Billboard } from "@react-three/drei";
import { Project } from "../data";
import { audioManager } from "../lib/audio";
import { useAppStore } from "../store";

const tempCenterLocal = new Vector3(0, 0, 0);
const tempWPos = new Vector3();
const tempVec = new Vector3();
const redshiftColor = new Color(0xff3300);
const emitRedshift = new Color(0xff2200);
const tempTargetColor = new Color();
const tempPColor = new Color();

import {
  planetVertexShader,
  planetFragmentShader,
  cloudVertexShader,
  cloudFragmentShader,
  ringVertexShader,
  ringFragmentShader
} from "../shaders";

export function ProjectNode({
  project,
  isSelected,
  selectedId,
  isTransitioning,
  onSelect,
}: {
  project: Project;
  isSelected: boolean;
  selectedId: string | null;
  isTransitioning?: boolean;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const orbitRef = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);
  const nodeGroupRef = useRef<Group>(null);
  const hudGroupRef = useRef<Group>(null);

  const orbitRotation = useRef(0);
  const targetEmissive = useRef(0.4);

  const particleGroupRef = useRef<Group>(null);
  const flashRef = useRef<Mesh>(null);
  const lastParticleEmitTime = useRef(0);
  const particleIndex = useRef(0);

  const particles = useMemo(() => {
    const meshes: Mesh[] = [];
    for (let i = 0; i < 30; i++) {
      const mat = new MeshBasicMaterial({
        color: project.color,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const geo = new SphereGeometry(project.size * 0.4, 8, 8);
      const mesh = new Mesh(geo, mat);
      mesh.visible = false;
      meshes.push(mesh);
    }
    return meshes;
  }, [project.color, project.size]);

  const hasRings = true;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color(project.color) },
      uEmissiveIntensity: { value: 0.4 },
      uHasRings: { value: hasRings ? 1.0 : 0.0 },
    }),
    [project.color, hasRings],
  );

  const targetHudOpacity = useRef(0.6);
  const hudOpacity = useRef(0.6);
  const targetHudScale = useRef(1);
  const hudScale = useRef(1);

  const handleClick = useCallback(
    (e?: any) => {
      if (e && e.stopPropagation) e.stopPropagation();
      onSelect(project.id);
    },
    [onSelect, project.id],
  );

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
      useAppStore.getState().setHoveredId(project.id);
      if (!isSelected) {
        audioManager.playBleep(3000, 0.03, 0.01);
        targetEmissive.current = 0.7;
        targetHudOpacity.current = 1.0;
        targetHudScale.current = 1.1;
      }
    },
    [isSelected, project.id],
  );

  const handlePointerOut = useCallback(
    (e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "";
      useAppStore.getState().setHoveredId(null);
      if (!isSelected) {
        targetEmissive.current = 0.4;
        targetHudOpacity.current = 0.6;
        targetHudScale.current = 1.0;
      }
    },
    [isSelected],
  );

  const orbitObject = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      points.push(
        new Vector3(
          Math.cos(theta) * project.orbitRadius,
          0,
          Math.sin(theta) * project.orbitRadius,
        ),
      );
    }
    const geom = new BufferGeometry().setFromPoints(points);

    const mat = new ShaderMaterial({
      uniforms: {
        color: { value: new Color("#1e293b") },
        glowColor: { value: new Color(project.color) },
        startAngle: { value: project.startAngle },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 glowColor;
        uniform float startAngle;
        varying vec3 vPos;
        void main() {
          float angle = atan(vPos.z, vPos.x); 
          float diff = angle - startAngle;
          diff = mod(diff + 3.14159265, 6.2831853) - 3.14159265;

          float intensity = 0.0;
          if (diff < 0.0) {
            intensity = pow(1.0 - abs(diff)/3.14159265, 3.0);
          } else {
            intensity = pow(1.0 - diff/0.2, 5.0);
          }
          intensity = clamp(intensity, 0.0, 1.0);

          vec3 finalColor = mix(color, glowColor, intensity * 0.9);
          float alpha = mix(0.15, 0.8, intensity);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const line = new LineLoop(geom, mat);
    line.raycast = () => null;
    return line;
  }, [project.orbitRadius, project.color, project.startAngle]);

  useFrame(({ clock, camera, size }, delta) => {
    const elapsedTime = clock.getElapsedTime();

    if (isTransitioning) {
      if (orbitObject) {
        orbitObject.visible = false;
      }
      if (hudGroupRef.current) {
        hudGroupRef.current.visible = false;
      }

      if (nodeGroupRef.current && orbitRef.current) {
        const currentDist =
          nodeGroupRef.current.position.distanceTo(tempCenterLocal);
        const normalizedD = Math.max(
          0,
          Math.min(1, currentDist / project.orbitRadius),
        );

        const angularAcceleration =
          3.0 + Math.pow(1.0 - normalizedD, 3.0) * 120.0;
        orbitRotation.current +=
          delta * project.orbitSpeed * angularAcceleration;

        const pullSpeed = 0.5 + Math.pow(1.0 - normalizedD, 2.0) * 8.5;
        nodeGroupRef.current.position.lerp(tempCenterLocal, delta * pullSpeed);

        if (normalizedD > 0.0) {
          nodeGroupRef.current.lookAt(
            orbitRef.current.localToWorld(tempCenterLocal.clone()),
          );

          const squish = Math.max(
            0.02,
            1.0 - Math.pow(1.0 - normalizedD, 2.0) * 0.98,
          );
          const stretch = 1.0 + Math.pow(1.0 - normalizedD, 4.0) * 60.0;
          nodeGroupRef.current.scale.set(squish, squish, stretch);
        }

        if (materialRef.current) {
          const mixFactor = Math.pow(1.0 - normalizedD, 2.5);
          tempTargetColor.set(project.color).lerp(
            redshiftColor,
            mixFactor,
          );
          materialRef.current.uniforms.uColor.value.copy(tempTargetColor);

          if (normalizedD < 0.2) {
            targetEmissive.current = normalizedD / 0.2;
          }
        }

        if (
          normalizedD < 0.6 &&
          normalizedD > 0.05 &&
          particleGroupRef.current
        ) {
          if (elapsedTime - lastParticleEmitTime.current > 0.02) {
            lastParticleEmitTime.current = elapsedTime;
            const groupChildren = particleGroupRef.current.children;
            const p = groupChildren[particleIndex.current] as Mesh;
            if (p) {
              p.visible = true;

              nodeGroupRef.current.getWorldPosition(tempWPos);
              particleGroupRef.current.worldToLocal(tempWPos);
              p.position.copy(tempWPos);

              (p.material as MeshBasicMaterial).opacity = 1.0;
              p.scale.set(1, 1, 1);

              tempPColor.set(project.color).lerp(
                emitRedshift,
                Math.pow(1.0 - normalizedD, 2.0),
              );
              (p.material as MeshBasicMaterial).color.copy(tempPColor);

              particleIndex.current =
                (particleIndex.current + 1) % groupChildren.length;
            }
          }
        }

        if (normalizedD < 0.04 && nodeGroupRef.current.visible) {
          nodeGroupRef.current.visible = false;

          if (flashRef.current) {
            flashRef.current.visible = true;
            flashRef.current.scale.set(0.1, 0.1, 0.1);
            (flashRef.current.material as MeshBasicMaterial).opacity =
              1.0;
          }
        }
      }

      if (particleGroupRef.current) {
        particleGroupRef.current.children.forEach((child) => {
          const p = child as Mesh;
          if (p.visible) {
            (p.material as MeshBasicMaterial).opacity -= delta * 3.5;
            p.scale.multiplyScalar(1.0 - delta * 2.0);
            if ((p.material as MeshBasicMaterial).opacity <= 0)
              p.visible = false;
          }
        });
      }

      if (flashRef.current && flashRef.current.visible) {
        const s = flashRef.current.scale.x;
        if (s < 1.5) {
          const expandSpeed = 25.0 * delta;
          flashRef.current.scale.set(
            s + expandSpeed,
            s + expandSpeed,
            s + expandSpeed,
          );
          (flashRef.current.material as MeshBasicMaterial).opacity =
            Math.max(0, 1.0 - s / 1.5);
        } else {
          flashRef.current.visible = false;
        }
      }

      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 15;
      }
    } else {
      const isPaused = selectedId != null || useAppStore.getState().hoveredId !== null;
      if (!isPaused) {
        orbitRotation.current += delta * project.orbitSpeed * 0.65;
      }
      if (!isPaused && meshRef.current) {
        meshRef.current.rotation.y += delta * 1.2;
      }
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y = orbitRotation.current;
    }

    if (glowRef.current && isSelected) {
      const scale = 1.2 + Math.sin(elapsedTime * 6) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }

    if (materialRef.current) {
      const targetInt = isSelected ? 0.9 : targetEmissive.current;
      materialRef.current.uniforms.uEmissiveIntensity.value =
        MathUtils.damp(
          materialRef.current.uniforms.uEmissiveIntensity.value,
          targetInt,
          8,
          delta,
        );
      materialRef.current.uniforms.uTime.value += delta;
    }

    const targetOp = isSelected ? 1.0 : targetHudOpacity.current;
    const targetSc = isSelected ? 1.1 : targetHudScale.current;

    hudOpacity.current = MathUtils.damp(
      hudOpacity.current,
      targetOp,
      8,
      delta,
    );
    hudScale.current = MathUtils.damp(
      hudScale.current,
      targetSc,
      8,
      delta,
    );

    if (hudGroupRef.current) {
      hudGroupRef.current.scale.set(
        hudScale.current,
        hudScale.current,
        hudScale.current,
      );
    }

    if (isSelected && nodeGroupRef.current) {
      nodeGroupRef.current.getWorldPosition(tempVec);
      tempVec.project(camera);

      const x0 = (tempVec.x * 0.5 + 0.5) * size.width;
      const y0 = (tempVec.y * -0.5 + 0.5) * size.height;

      const anchor = document.getElementById("dossier-anchor");
      const pathEl = document.getElementById("connector-line");

      if (anchor && pathEl) {
        const rect = anchor.getBoundingClientRect();

        if (rect.width === 0 && rect.height === 0 && rect.x === 0) return;

        const x2 = rect.left;
        const y2 = rect.top + rect.height / 2;

        const cx = size.width / 2;
        const cy = size.height / 2;

        const midX = (x0 + x2) / 2;
        const midY = (y0 + y2) / 2;
        const distToCenter = Math.sqrt((cx - midX) ** 2 + (cy - midY) ** 2);

        const dx = x2 - x0;

        const cp1x = x0 + Math.max(60, Math.abs(dx) * 0.4);
        const cp1y = y0;
        const cp2x = x2 - Math.max(60, Math.abs(dx) * 0.4);
        const cp2y = y2;

        const d = `M ${x0},${y0} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;

        pathEl.setAttribute("d", d);
      }
    }
  });

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      useAppStore.getState().setHoveredId(null);
      particles.forEach((p) => {
        if (p.geometry) p.geometry.dispose();
        if (p.material) {
          if (Array.isArray(p.material)) {
            p.material.forEach((m) => m.dispose());
          } else {
            p.material.dispose();
          }
        }
      });
      if (orbitObject) {
         if (orbitObject.geometry) orbitObject.geometry.dispose();
         if (orbitObject.material) {
            if (Array.isArray(orbitObject.material)) {
              orbitObject.material.forEach((m) => m.dispose());
            } else {
              orbitObject.material.dispose();
            }
         }
      }
    };
  }, [particles, orbitObject]);

  const x = Math.cos(project.startAngle) * project.orbitRadius;
  const z = Math.sin(project.startAngle) * project.orbitRadius;

  return (
    <group>
      <group ref={particleGroupRef}>
        {particles.map((p, i) => (
          <primitive key={i} object={p} />
        ))}
      </group>

      <group ref={orbitRef}>
        <mesh ref={flashRef} visible={false}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent={true}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <primitive object={orbitObject} />

        <group
          position={[x, 0, z]}
          ref={nodeGroupRef}
          name={`planet-${project.id}`}
        >
          <mesh
            ref={meshRef}
            onClick={(e) => {
              e.stopPropagation();
              if (e.delta <= 5) {
                handleClick();
              }
            }}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[project.size, 64, 64]} />
            <shaderMaterial
              ref={materialRef}
              uniforms={uniforms}
              vertexShader={planetVertexShader}
              fragmentShader={planetFragmentShader}
            />
          </mesh>

          {hasRings && (
            <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
              <ringGeometry
                args={[project.size * 1.5, project.size * 2.3, 64]}
              />
              <shaderMaterial
                uniforms={uniforms}
                vertexShader={ringVertexShader}
                fragmentShader={ringFragmentShader}
                transparent={true}
                depthWrite={false}
                side={DoubleSide}
                blending={AdditiveBlending}
              />
            </mesh>
          )}

          <mesh raycast={() => null}>
            <sphereGeometry args={[project.size * 1.025, 64, 64]} />
            <shaderMaterial
              uniforms={uniforms}
              vertexShader={cloudVertexShader}
              fragmentShader={cloudFragmentShader}
              transparent={true}
              depthWrite={false}
            />
          </mesh>

          <mesh raycast={() => null}>
            <sphereGeometry args={[project.size * 1.3, 32, 32]} />
            <meshBasicMaterial
              color={project.color}
              transparent
              opacity={0.1}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {isSelected && (
            <mesh ref={glowRef} raycast={() => null}>
              <sphereGeometry args={[project.size * 1.8, 32, 32]} />
              <meshBasicMaterial
                color={project.color}
                transparent
                opacity={0.4}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}

          <Billboard
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false}
            onClick={(e) => {
              e.stopPropagation();
              if (e.delta <= 5) {
                handleClick(e);
              }
            }}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <group ref={hudGroupRef}>
              <Text
                position={[-(project.size + 1.2), 0.3, 0]}
                fontSize={0.25}
                color="#ecfeff"
                anchorX="right"
                anchorY="bottom"
                letterSpacing={0.1}
                fillOpacity={isSelected ? 1.0 : 0.6}
              >
                [{project.name.toUpperCase()}]
              </Text>

              <Text
                position={[-(project.size + 1.2), 0.0, 0]}
                fontSize={0.15}
                color="#f472b6"
                anchorX="right"
                anchorY="top"
                letterSpacing={0.15}
                fillOpacity={isSelected ? 1.0 : 0.6}
              >
                {project.category.toUpperCase()}
              </Text>

              <mesh position={[-(project.size + 1), 0.15, 0]}>
                <planeGeometry args={[0.03, 0.6]} />
                <meshBasicMaterial
                  color="#06b6d4"
                  transparent
                  opacity={0.4}
                  toneMapped={false}
                  userData={{ baseOpacity: 0.4 }}
                />
              </mesh>

              <group
                position={[0, 0, 0]}
                scale={[project.size * 1.5, project.size * 1.5, 1]}
              >
                <mesh position={[-1, 1, 0]}>
                  <planeGeometry args={[0.4, 0.03]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>
                <mesh position={[-1, 1, 0]}>
                  <planeGeometry args={[0.03, 0.4]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>

                <mesh position={[1, 1, 0]}>
                  <planeGeometry args={[0.4, 0.03]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>
                <mesh position={[1, 1, 0]}>
                  <planeGeometry args={[0.03, 0.4]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>

                <mesh position={[-1, -1, 0]}>
                  <planeGeometry args={[0.4, 0.03]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>
                <mesh position={[-1, -1, 0]}>
                  <planeGeometry args={[0.03, 0.4]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>

                <mesh position={[1, -1, 0]}>
                  <planeGeometry args={[0.4, 0.03]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>
                <mesh position={[1, -1, 0]}>
                  <planeGeometry args={[0.03, 0.4]} />
                  <meshBasicMaterial
                    color={isSelected ? "#ec4899" : "#22d3ee"}
                    transparent
                    depthWrite={false}
                    userData={{ baseOpacity: 0.8 }}
                  />
                </mesh>
              </group>
            </group>
          </Billboard>

          {isSelected && (
            <Html position={[0, 0, 0]} center zIndexRange={[10, 0]}>
              <div
                id="selected-node-anchor"
                className="w-1 h-1 bg-transparent"
              />
            </Html>
          )}
        </group>
      </group>
    </group>
  );
}
