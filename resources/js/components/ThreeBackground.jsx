import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const ParticleField = (props) => {
    const ref = useRef();
    const sphere = useMemo(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }), []);

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#10b981"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

const FloatingShapes = () => {
    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <mesh position={[1, -0.5, -1]}>
                <icosahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color="#06b6d4" wireframe />
            </mesh>
            <mesh position={[-1, 0.5, -1]}>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial color="#10b981" wireframe />
            </mesh>
        </Float>
    );
}

const ThreeBackground = () => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ambientLight intensity={0.5} />
                <ParticleField />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;
