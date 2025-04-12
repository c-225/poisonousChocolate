import * as THREE from 'three';

const shape = new THREE.Shape();
shape.moveTo(-1, 1);   // Top-left
shape.lineTo(1, 1);    // Top-right
shape.lineTo(1.5, -1); // Bottom-right (wider base)
shape.lineTo(-1.5, -1);// Bottom-left (wider base)
shape.lineTo(-1, 1);   // Close the shape

// Extrude settings (for depth)
const extrudeSettings = {
    depth: 2,             // Thickness of the shape
    bevelEnabled: false   // No bevel for sharp edges
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
const trapezoid = new THREE.Mesh(geometry, material);
