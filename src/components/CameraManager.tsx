
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useLayoutEffect } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { audioManager } from "../lib/audio";
import { useAppStore } from "../store";

const tempOrigin = new Vector3(0, 0, 0);
const tempPlanetPos = new Vector3();
const tempDir = new Vector3();
const tempCameraPos = new Vector3();

export function CameraManager({
  selectedId,
  isIntro,
  isTransitioning,
  onEnteredSingularity,
}: {
  selectedId: string | null;
  isIntro: boolean;
  isTransitioning?: boolean;
  onEnteredSingularity?: () => void;
}) {
  const { camera, controls, scene } = useThree();
  const transitionTime = useRef(0);
  const singularityTriggered = useRef(false);
  const timeRef = useRef(0);

  const isUserControlling = useRef(false);
  const userDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    userDistanceRef.current = null;
  }, [selectedId]);

  useEffect(() => {
    if (!controls) return;
    const orbitControls = controls as any;

    const onStart = () => {
      isUserControlling.current = true;
    };
    const onEnd = () => {
      isUserControlling.current = false;
      userDistanceRef.current = camera.position.distanceTo(
        orbitControls.target,
      );
    };

    orbitControls.addEventListener("start", onStart);
    orbitControls.addEventListener("end", onEnd);
    return () => {
      orbitControls.removeEventListener("start", onStart);
      orbitControls.removeEventListener("end", onEnd);
    };
  }, [controls, camera]);

  useLayoutEffect(() => {
    camera.position.set(20, 70, 120);
    if (controls) {
      (controls as any).target.set(0, 0, 0);
    }
  }, [camera, controls]);

  useFrame((_, delta) => {
    if (!controls) return;
    const orbit = controls as any;

    const isPaused = selectedId !== null || useAppStore.getState().hoveredId !== null;
    orbit.autoRotate = !isPaused;

    const warpRatio = useAppStore.getState().warpRatio;
    timeRef.current += delta;

    if (isTransitioning) {
      transitionTime.current += delta;

      orbit.target.lerp(tempOrigin, 1 - Math.exp(-3 * delta));

      if (transitionTime.current > 1.0) {
        const ease = Math.min(1, (transitionTime.current - 1.0) * 1.5);

        const targetFov = 45 + ease * 120;
        const currentFov = (camera as PerspectiveCamera).fov;
        // Apply target FOV
        if (Math.abs(currentFov - targetFov) > 0.1) {
          (camera as PerspectiveCamera).fov = MathUtils.damp(
            currentFov,
            targetFov,
            20,
            delta,
          );
          (camera as PerspectiveCamera).updateProjectionMatrix();
        }

        const currentDistance = camera.position.length();
        const newDistance = MathUtils.damp(
          currentDistance,
          0.1,
          4 + ease * 8,
          delta,
        );
        tempDir.copy(camera.position).normalize();
        camera.position.copy(tempDir.multiplyScalar(newDistance));

        if (camera.position.z < 0.5 && camera.position.length() < 1.0) {
          if (!singularityTriggered.current) {
            singularityTriggered.current = true;
            if (onEnteredSingularity) onEnteredSingularity();
          }
        }
      }
      return;
    }

    const targetFov = 45 + warpRatio * 35;
    const currentFov = (camera as PerspectiveCamera).fov;
    if (Math.abs(currentFov - targetFov) > 0.1) {
      (camera as PerspectiveCamera).fov = MathUtils.damp(
        currentFov,
        targetFov,
        12,
        delta,
      );
      (camera as PerspectiveCamera).updateProjectionMatrix();
    }

    if (isIntro) {
      orbit.target.lerp(tempOrigin, 1 - Math.exp(-1.5 * delta));

      const desiredDistance = 30;
      const currentDistance = camera.position.distanceTo(orbit.target);
      const newDistance = MathUtils.damp(
        currentDistance,
        desiredDistance,
        1.2,
        delta,
      );
      tempDir.copy(camera.position).sub(orbit.target).normalize();
      tempCameraPos.copy(orbit.target).add(tempDir.multiplyScalar(newDistance));
      camera.position.copy(tempCameraPos);
    } else {
      if (selectedId) {
        const planetNode = scene.getObjectByName(`planet-${selectedId}`);
        if (planetNode) {
          planetNode.getWorldPosition(tempPlanetPos);

          orbit.target.lerp(tempPlanetPos, 1 - Math.exp(-5 * delta));

          if (!isUserControlling.current) {
            const desiredDistance =
              userDistanceRef.current !== null ? userDistanceRef.current : 16;
            const currentDistance = camera.position.distanceTo(orbit.target);
            if (Math.abs(currentDistance - desiredDistance) > 0.05) {
              const dampFactor = warpRatio > 0.1 ? 8 : 5;
              const newDistance = MathUtils.damp(
                currentDistance,
                desiredDistance,
                dampFactor,
                delta,
              );
              tempDir.copy(camera.position).sub(orbit.target).normalize();
              tempCameraPos.copy(orbit.target).add(tempDir.multiplyScalar(newDistance));
              camera.position.copy(tempCameraPos);
            }
          }
        }
      } else {
        orbit.target.lerp(tempOrigin, 1 - Math.exp(-3 * delta));

        if (!isUserControlling.current) {
          const desiredDistance =
            userDistanceRef.current !== null ? userDistanceRef.current : 20;
          const currentDistance = camera.position.distanceTo(orbit.target);
          if (Math.abs(currentDistance - desiredDistance) > 0.05) {
            const dampFactor = warpRatio > 0.1 ? 8 : 3;
            const newDistance = MathUtils.damp(
              currentDistance,
              desiredDistance,
              dampFactor,
              delta,
            );
            tempDir.copy(camera.position).sub(orbit.target).normalize();
            tempCameraPos.copy(orbit.target).add(tempDir.multiplyScalar(newDistance));
            camera.position.copy(tempCameraPos);
          }
        }
      }
    }

    const distToCenter = camera.position.distanceTo(tempOrigin);

    const intensity = Math.max(0, Math.min(1, 1 - (distToCenter - 10) / 40));
    audioManager.setAmbientIntensity(intensity);
  });

  return null;
}