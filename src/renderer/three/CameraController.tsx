import { useLayoutEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import { useUiStore } from "../../store/ui-store";

const DEFAULT_POSITION = new Vector3(6.5, 5.5, 15);
const DEFAULT_TARGET = new Vector3(0, -5.2, 0);

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraResetToken = useUiStore((state) => state.cameraResetToken);
  const { camera } = useThree();

  useLayoutEffect(() => {
    camera.position.copy(DEFAULT_POSITION);
    controlsRef.current?.target.copy(DEFAULT_TARGET);
    controlsRef.current?.update();
  }, [camera, cameraResetToken]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={36}
      maxPolarAngle={Math.PI * 0.49}
    />
  );
}
