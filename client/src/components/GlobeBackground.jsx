import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const NetworkGlobe = () => {
  const groupRef = useRef();
  
  // Create random points on a sphere
  const { points, lines } = useMemo(() => {
    const numPoints = 60;
    const pointsArray = [];
    const radius = 2.5;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      pointsArray.push(new THREE.Vector3(x, y, z));
    }

    const linesArray = [];
    // Connect points that are close to each other
    for (let i = 0; i < numPoints; i++) {
      for (let j = i + 1; j < numPoints; j++) {
        const dist = pointsArray[i].distanceTo(pointsArray[j]);
        if (dist < 1.6) {
          linesArray.push([pointsArray[i], pointsArray[j]]);
        }
      }
    }

    return { points: pointsArray, lines: linesArray };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central subtle glow sphere */}
      <Sphere args={[2.4, 32, 32]}>
        <meshBasicMaterial color="#6366f1" transparent opacity={0.05} wireframe />
      </Sphere>

      {/* Nodes */}
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Connections (Lines) */}
      {lines.map((line, i) => (
        <Line
          key={`line-${i}`}
          points={line}
          color="#6366f1"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}
    </group>
  );
};

export default function GlobeBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <fog attach="fog" args={['#020617', 5, 12]} />
        <ambientLight intensity={0.5} />
        <NetworkGlobe />
      </Canvas>
      {/* Radial gradient mask to make it fade out to the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_70%)]" />
    </div>
  );
}
