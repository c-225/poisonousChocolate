import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GamePC } from './gamePC';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


// -------------------------
// Three.js Setup and Rendering
// -------------------------

// Constants
const CELL_WIDTH = 1/1.445;
const CELL_HEIGHT = 1;

let GRID_WIDTH = 7;
let GRID_HEIGHT = 6;

const chocoTexture = new THREE.TextureLoader().load('/icone_terra.png');
chocoTexture.encoding = THREE.sRGBEncoding;
const poisonTexture = new THREE.TextureLoader().load('/poison.jpg')
poisonTexture.encoding = THREE.sRGBEncoding;

// Initialize Game of Life with empty grid a revoir
let game:GamePC = new GamePC(GRID_WIDTH, GRID_HEIGHT);

// Initialize Three.js Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x888888); // Dark background

// Initialize Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputEncoding = THREE.sRGBEncoding;
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

const trapezoid = new THREE.PolyhedronGeometry(trap_vertices, quad_indices, 0.5, 0);

// we have to assign the colors to the faces of the trapezoid
// Since each face is made of 2 triangles, we need to assign the same color for both triangles
const DarkBrown = new THREE.Color(0x531800);
const MidBrown =  new THREE.Color(0x662B00);
const Brown = new THREE.Color(0x713600);

const DarkGrey = new THREE.Color(0x333344);
const MidGrey = new THREE.Color(0x666688);
const Grey = new THREE.Color(0xAAAAFF);

const chocotop = new THREE.MeshStandardMaterial({ map:chocoTexture })
const poisontop = new THREE.MeshBasicMaterial({ map:poisonTexture })

const light = new THREE.DirectionalLight(0x784307, 5);
light.position.set(5, 5, 5);
const faceColors = [
   Brown, // Face 0 - bottom
   DarkBrown, // Face 1 - bottom
  
   MidBrown, // Face 2 - top
   MidBrown, // Face 3 - top
  
   Brown, // Face 4 - side
   Brown, // Face 5 - side
  
   Brown, // Face 6 - side
   Brown, // Face 7 - side
  
   DarkBrown, // Face 8 - side
   DarkBrown, // Face 9 - side
  
   DarkBrown, // Face 10 - side
   DarkBrown, // Face 11 - side
  
   Brown, // Face 12 - side
   Brown, // Face 13 - side
  
   Brown, // Face 14 - side
   Brown, // Face 15 - side
  
   DarkBrown, // Face 16 - side
   DarkBrown, // Face 17 - side
  
   DarkBrown, // Face 18 - side
   DarkBrown, // Face 19 - side
];

const poisonFaceColors = [
    Grey, // Face 0 - bottom
    DarkGrey, // Face 1 - bottom
   
    MidGrey, // Face 2 - top
    MidGrey, // Face 3 - top
   
    Grey, // Face 4 - side
    Grey, // Face 5 - side
   
    Grey, // Face 6 - side
    Grey, // Face 7 - side
   
    DarkGrey, // Face 8 - side
    DarkGrey, // Face 9 - side
   
    DarkGrey, // Face 10 - side
    DarkGrey, // Face 11 - side
   
    Grey, // Face 12 - side
    Grey, // Face 13 - side
   
    Grey, // Face 14 - side
    Grey, // Face 15 - side
   
    DarkGrey, // Face 16 - side
    DarkGrey, // Face 17 - side
   
    DarkGrey, // Face 18 - side
    DarkGrey, // Face 19 - side
 ];
const colors: THREE.Color = [];
const position = trapezoid.attributes.position;

const geometry = new THREE.BoxGeometry( 1, 1, 0.01 ); 

// Each face has 3 vertices
for (let i = 0; i < position.count / 3; i++) {
  const color:THREE.Color = faceColors[i] || new THREE.Color(0xffffff); // fallback white
  // Apply the same color to all 3 vertices of this face
  colors.push(color.r, color.g, color.b);
  colors.push(color.r, color.g, color.b);
  colors.push(color.r, color.g, color.b);
}

const poisonColors: THREE.Color = [];
for (let i = 0; i < position.count / 3; i++) {
    const color:THREE.Color = poisonFaceColors[i] || new THREE.Color(0xffffff); // fallback white
    // Apply the same color to all 3 vertices of this face
    poisonColors.push(color.r, color.g, color.b);
    poisonColors.push(color.r, color.g, color.b);
    poisonColors.push(color.r, color.g, color.b);
}
trapezoid.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
const poisonTrap = trapezoid.clone()

let maxCells:number;
let instancedMesh: THREE.InstancedMesh;

// Temporary Object3D for setting instance matrices
let dummy = new THREE.Object3D();
let poison

const gball = new THREE.SphereGeometry(0.15, 20, 20)
let boxes:THREE.Mesh[] = [];
let wireframes:THREE.LineSegments[] = [];

// Initialize the grid and InstancedMesh
function initGrid() {   
    // We have to add the light in the init because we are reusing it whenever we cut the chocolate
    scene.add(light); 
    poison = game.poison;

    maxCells = GRID_WIDTH * GRID_HEIGHT;
    instancedMesh = new THREE.InstancedMesh(trapezoid, material, maxCells);
    let spheres:{x:THREE.Mesh[], y:THREE.Mesh[]} = {x:[], y:[]}
    // Initialize InstancedMesh positions init
    let instanceCount = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            // Center the grid around (0,0)
            dummy.position.set(
                x * CELL_WIDTH - GRID_WIDTH / 2 * CELL_WIDTH + CELL_WIDTH / 2,
                y * CELL_HEIGHT - GRID_HEIGHT / 2 * CELL_HEIGHT + CELL_HEIGHT / 2,
                0
            );

            //create a wireframe for the trapezoid
            const wireframe = new THREE.LineSegments(
                new THREE.EdgesGeometry(trapezoid),
                new THREE.LineBasicMaterial({ color: 0x000000 })
            );
            wireframe.position.set(dummy.position.x, dummy.position.y, 0);
            wireframe.rotation.set(Math.PI/2, 0, 0);
            wireframe.scale.set(1,1,1.445); // to make it more like a chocolate bar

            scene.add(wireframe);

            dummy.rotation.set(Math.PI/2, 0, 0)
            if (x != poison.x || y != poison.y) dummy.scale.set(1,0.95,1.4); // to make it more like a chocolate bar
            else {
                dummy.scale.set(0,0,0);
                poisonTrap.setAttribute('color', new THREE.Float32BufferAttribute(poisonColors, 3));
                let poisonMesh = new THREE.Mesh(poisonTrap, material)
                poisonMesh.position.set(dummy.position.x, dummy.position.y, 0);
                poisonMesh.rotation.set(Math.PI/2, 0, 0);
                poisonMesh.scale.set(1,0.95,1.445); // to make it more like a chocolate bar
                scene.add(poisonMesh);
            }
            dummy.updateMatrix();

            const cube = new THREE.Mesh( geometry, (x == poison.x && y == poison.y) ? poisontop : chocotop ); 
            cube.position.set(dummy.position.x, dummy.position.y, 0.385);
            cube.scale.set(0.4, 0.58, 1)
            scene.add(cube);

            instancedMesh.setMatrixAt(instanceCount++, dummy.matrix);
        }
    }
    scene.add(instancedMesh);

    // Create the dots that we will interact with
    for (let y = 1; y < GRID_HEIGHT; y++) {
        const sphere = new THREE.Mesh(gball, material);
        sphere.name = {xcoord: -1, ycoord: y};
        sphere.layers.set(1);
        const sphere2 = sphere.clone();
        sphere.position.set(
            -GRID_WIDTH / 2 * CELL_WIDTH - CELL_WIDTH/2+ CELL_WIDTH/5,
            y * CELL_HEIGHT - GRID_HEIGHT / 2 * CELL_HEIGHT,
            0
        );
        spheres.y.push(sphere);
        spheres.y.push(sphere2);
        sphere2.position.set(-sphere.position.x, sphere.position.y, 0);
        scene.add(sphere);
        scene.add(sphere2);
    }
    for (let x = 1; x < GRID_WIDTH; x++) {
        const sphere = new THREE.Mesh(gball, material);
        sphere.name = {xcoord: x, ycoord: -1};
        sphere.layers.set(1);
        const sphere2 = sphere.clone();
        sphere.position.set(
            x * CELL_WIDTH - GRID_WIDTH / 2 * CELL_WIDTH,
            -GRID_HEIGHT / 2 * CELL_HEIGHT - CELL_HEIGHT/2 + CELL_WIDTH/2.5,
            0
        );
        spheres.x.push(sphere);
        spheres.x.push(sphere2);
        sphere2.position.set(sphere.position.x, -sphere.position.y, 0);
        scene.add(sphere);
        scene.add(sphere2);
    }
    camera.layers.enable(1);
}

function cut(xcoord:number, ycoord:number) {
    scene.clear()
    if (xcoord != -1 ) {
        if (poison.x >= xcoord){
            GRID_WIDTH = GRID_WIDTH - xcoord;
            poison.x -= xcoord;
        }
        else {
            GRID_WIDTH = GRID_WIDTH - (GRID_WIDTH - xcoord);
        }
    }
    else if (ycoord != -1) {
        if (poison.y >= ycoord){
            GRID_HEIGHT = GRID_HEIGHT - ycoord;
            poison.y -= ycoord;
        }
        else {
            GRID_HEIGHT = GRID_HEIGHT - (GRID_HEIGHT - ycoord);
        }
    }
    initGrid();
    instancedMesh.instanceMatrix.needsUpdate = true;
}

// 1. Set up raycaster and mouse vector
const raycaster = new THREE.Raycaster();
raycaster.layers.set(1); // Set the layer for the raycaster
const mouse = new THREE.Vector2();

// 2. Add event listener to the canvas
renderer.domElement.addEventListener('click', (event:any) => {
    // Normalize mouse coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(scene.children); // true = recursive

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        cut(clicked.name.xcoord, clicked.name.ycoord);
    }
});


// Start the animation loop immediately
initGrid();
animate();

//cut(2, -1,);
// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update camera controls
    renderer.render(scene, camera);
}

animate();