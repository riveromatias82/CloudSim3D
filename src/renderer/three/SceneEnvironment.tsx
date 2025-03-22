import { Grid } from "@react-three/drei";

export function SceneEnvironment() {
  return (
    <>
      <color attach="background" args={["#070b14"]} />
      <fog attach="fog" args={["#070b14", 18, 48]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 14, 6]} intensity={1.1} color="#dbeafe" />
      <pointLight position={[-8, 6, -4]} intensity={12} color="#22d3ee" distance={28} />
      <pointLight position={[6, -2, 8]} intensity={8} color="#818cf8" distance={24} />
      <Grid
        position={[0, -11.5, 0]}
        args={[40, 40]}
        cellSize={1.2}
        cellThickness={0.6}
        cellColor="#1e293b"
        sectionSize={4.8}
        sectionThickness={1.1}
        sectionColor="#164e63"
        fadeDistance={38}
        fadeStrength={1.4}
        infiniteGrid
      />
    </>
  );
}
