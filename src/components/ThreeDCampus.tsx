import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ThreeDCampus() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create campus buildings
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.9,
    });

    // Create multiple buildings
    const buildings: THREE.Mesh[] = [];
    const buildingPositions = [
      { x: -2, y: 0, z: -2 },
      { x: 2, y: 0, z: -2 },
      { x: -2, y: 0, z: 2 },
      { x: 2, y: 0, z: 2 },
      { x: 0, y: 0, z: 0 },
    ];

    buildingPositions.forEach((pos) => {
      const building = new THREE.Mesh(geometry, material);
      building.position.set(pos.x, pos.y, pos.z);
      building.scale.y = Math.random() * 2 + 1;
      scene.add(building);
      buildings.push(building);
    });

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 8;
    camera.position.y = 3;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate buildings
      buildings.forEach((building) => {
        building.rotation.y += 0.005;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={mountRef}
      className="absolute top-1/2 right-0 -translate-y-1/2 opacity-50 pointer-events-none"
    />
  );
} 