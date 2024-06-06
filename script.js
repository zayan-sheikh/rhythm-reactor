import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


// Canvas
const canvas = document.querySelector('canvas.webgl');


// Scene
const scene = new THREE.Scene();


// Material
const geometry = new THREE.TorusGeometry(0.5, 0.1)
const material = new THREE.MeshStandardMaterial({ color: 0x5566aa});
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);


// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height);


camera.position.set(0,0,3)

scene.add(camera);

// Lighting

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
directionalLight.position.set(0,0,2);
scene.add(directionalLight);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x0f0f0f);

renderer.render(scene, camera);

const orbit = new OrbitControls(camera, renderer.domElement);

// Animation

let step = 0;
let speed = 0.002;

function animate() {
    mesh.rotation.y += 0.001
    step += speed;
    let val = Math.pow(Math.sin(step),2) + 0.5;
    mesh.scale.set(val,val,val)
    renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate);

// Responsiveness
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/ window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})