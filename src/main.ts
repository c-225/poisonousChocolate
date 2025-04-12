import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GamePC } from './gamePC';

// -------------------------
// Three.js Setup and Rendering
// -------------------------

// Constants
let GRID_WIDTH = 7;
let GRID_HEIGHT = 6;
const CELL_WIDTH = 1/1.445;
const CELL_HEIGHT = 1;
const game:GamePC = new GamePC(GRID_WIDTH, GRID_HEIGHT);

// Initialize Game of Life with empty grid a revoir

// Initialize Three.js Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Dark background


// Initialize Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);


// Initialize Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Position the camera so that the entire grid is visible
camera.position.set(0, 0, 15);
// Make the camera look at the center of the grid
camera.lookAt(0, 0, 0);

// Add OrbitControls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth rotation
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI; // Prevent flipping

// Create InstancedMesh for cells
const trap_vertices = [
    // Bottom face (wider)
    -3, -0.85, -3,  // 0 - Bottom-left
     3, -0.85, -3,  // 1 - Bottom-right
     3, -0.85,  3,  // 2 - Bottom-right front
    -3, -0.85,  3,  // 3 - Bottom-left front

    // middle "face" (wider)
    -3, 0.85, -3,  // 4 - Bottom-left
     3, 0.85, -3,  // 5 - Bottom-right
     3, 0.85,  3,  // 6 - Bottom-right front
    -3, 0.85,  3,  // 7 - Bottom-left front
    // since their y coordinates are opposites, they will have the same size

    // Top face (narrower)
    -1, 2, -1,  // 8 - Top-left
     1, 2, -1,  // 9 - Top-right
     1, 2,  1,  // 10 - Top-right front
    -1, 2,  1   // 11 - Top-left front   
];
const quad_indices = [
    // Bottom face
    0, 1, 2,
    0, 2, 3,

    // Top face
    8, 9, 10,
    8, 10, 11,

    // Sides
    0, 1, 5,
    0, 5, 4,

    1, 2, 6,
    1, 6, 5,

    2, 3, 7,
    2, 7, 6,

    3, 0, 4,
    3, 4, 7,

    4, 5, 9,
    4, 9, 8,

    5, 6, 10,
    5, 10, 9,

    6, 7, 11,
    6, 11, 10,

    7, 4, 8,
    7, 8, 11,
];

const trapzeoid = new THREE.PolyhedronGeometry(trap_vertices, quad_indices, 0.5, 0);
const material = new THREE.MeshBasicMaterial({ color:0xFF0000 })
const lines = new THREE.MeshBasicMaterial({ color: 0xFFFFFF , wireframe:true})

let maxCells:number;
let instancedMesh: THREE.InstancedMesh;

// Temporary Object3D for setting instance matrices
let dummy = new THREE.Object3D();
let poison = {x:GRID_WIDTH-1, y:GRID_HEIGHT-1};

const gball = new THREE.SphereGeometry(0.05, 20, 20)
const ball = new THREE.Mesh(gball, material);
const ballMax = ball.clone();
ball.position.set(
    - GRID_WIDTH / 2 * CELL_WIDTH - CELL_WIDTH/2,
    - GRID_HEIGHT / 2 * CELL_HEIGHT - CELL_HEIGHT/2,
    0
)
ballMax.position.set(
    GRID_WIDTH * CELL_WIDTH - GRID_WIDTH / 2 * CELL_WIDTH - CELL_WIDTH/2,
    GRID_HEIGHT * CELL_HEIGHT - GRID_HEIGHT / 2 * CELL_HEIGHT - CELL_HEIGHT/2,
    0
)
scene.add(ball);
scene.add(ballMax);
// Initialize the grid and InstancedMesh
function initGrid(){    

    maxCells = GRID_WIDTH * GRID_HEIGHT;
    instancedMesh = new THREE.InstancedMesh(trapzeoid, lines, maxCells);

    // Initialize InstancedMesh positions init
    let instanceCount = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            // Center the grid around (0,0)
            dummy.position.set(
                x * CELL_WIDTH - GRID_WIDTH / 2 * CELL_WIDTH ,
                y * CELL_HEIGHT - GRID_HEIGHT / 2 * CELL_HEIGHT ,
                0
            );
            dummy.rotation.set(Math.PI/2, 0, 0)
            dummy.scale.set(1,1,1.445); // to make it more like a chocolate bar
            dummy.updateMatrix();
            if (x == poison.x && y == poison.y) {
                instancedMesh.setColorAt(instanceCount, new THREE.Color().setHex( 0xaa0000 )); // Hide the cell by setting scale to 0
            }
            
            instancedMesh.setMatrixAt(instanceCount++, dummy.matrix);
        }
    }
    scene.add(instancedMesh);
}

function cut(xcoord: number, ycoord: number, poison:{x:number, y:number}) {
    let count = 0;
    let condition:boolean;

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (xcoord > poison.x){ // we erase the cells that are on the right of the poison
                condition = (x >= xcoord);
            }
            else if (xcoord < poison.x && xcoord != -1){ // we erase the cells that are on the left of the poison
                condition = (x < xcoord);
            }
            else if (ycoord > poison.y){ // we erase the cells that are on the bottom of the poison
                condition = (y >= ycoord) 
            }
            else if (ycoord < poison.y && ycoord != -1){ // we erase the cells that are on the top of the poison
                condition = (y < ycoord)
            }
            else {
                condition = false;
            }
            if (condition) {
                dummy.scale.set(0, 0, 0); // Hide the cell by setting scale to 0
            } else {
                dummy.scale.set(1,1,1.445); // show the cell by setting scale to 1
            }
            dummy.position.set(
                x * CELL_WIDTH - (GRID_WIDTH * CELL_WIDTH) / 2 + CELL_WIDTH / 2 - count % GRID_WIDTH * 0.3,
                y * CELL_HEIGHT - (GRID_HEIGHT * CELL_HEIGHT) / 2 + CELL_HEIGHT / 2 ,
                0
            );
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(count++, dummy.matrix);
        }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
}

function handleclick(event: PointerEvent) {
    const { clientX, clientY } = event;

    // Calculate pointer position in normalized device coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector3(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
        0
    );

    // Raycast to find intersection with the grid plane
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Define a plane for intersection (XY plane)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);

    if (intersectPoint) {
        // Calculate cell coordinates
        let xCoord = -2.7294676250468943  ;
        let yCoord = Math.floor((intersectPoint.y + ((GRID_HEIGHT) / 2))) - 15;

        //largeur d'une case = 0.681 trouver un moyen de chopper la valeur minimale
        //longueur d'une case = 0.984
        
        //if (xCoord < 0 || xCoord >= GRID_WIDTH) {xCoord = -1} y 
        //if (yCoord < 0 || yCoord >= GRID_HEIGHT) {yCoord = -1}

        console.log('xCoord:', xCoord, 'yCoord:', yCoord);
        //cut(xCoord, yCoord, poison);
    }
}

function onPointerDown(event: PointerEvent){ handleclick(event); }
renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
// Start the animation loop immediately
initGrid();
animate();

//cut(2, -1, poison);
// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update camera controls
    renderer.render(scene, camera);
}

animate();