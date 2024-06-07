import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const uniforms = {
    u_resolution: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_time: {type: 'f', value: 0.0},
    u_frequency: {type: 'f', value: 0.0}
}

const material = new THREE.ShaderMaterial ({
    uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent
});


// Canvas
const canvas = document.querySelector('canvas.webgl');


// Scene
const scene = new THREE.Scene();


// Material
const geometry = new THREE.IcosahedronGeometry(2, 25)

const mesh = new THREE.Mesh(geometry, material);

mesh.material.wireframe = true;

scene.add(mesh);


// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height);


camera.position.set(0,0,7)

scene.add(camera);

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();

// audio_input.onchange = function() {
//     var file = this.files[0];
//     // var audioURL = URL.createObjectURL(file);
//     // audio_file.src = audioURL;
//     var reader = new FileReader();
//     var buffer = reader.readAsArrayBuffer(file);
//     var context = THREE.AudioContext.getContext();
//     context.decodeAudioData(buffer, function (audioBuffer) {
//         sound.setBuffer( audioBuffer );
        
//         window.addEventListener('click', function() {
//             if (sound.isPlaying) {
//                 sound.pause();
//             } else {
//                 sound.play();
//             }
//         });

//     })


    

    audioLoader.load("./media/fillTheVoid.mp3", function(buffer) {
        sound.setBuffer(buffer);
        window.addEventListener('click', function() {
            if (sound.isPlaying) {
                sound.pause();
            } else {
                sound.play();
            }
        });
    });

    const analyser = new THREE.AudioAnalyser(sound, 32);


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x000);


const orbit = new OrbitControls(camera, renderer.domElement);

// Post-processing
renderer.outputColorSpace = THREE.SRGBColorSpace;
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.8, 0.5);


const bloomComposer = new EffectComposer(renderer);


bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const outputPass = new OutputPass();
bloomComposer.addPass(outputPass);


// Animation
const clock = new THREE.Clock();
let step = 0;
let speed = 0.002;

function animate() {
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    mesh.rotation.y += 0.0006
    mesh.rotation.x += 0.0007
    mesh.rotation.z += 0.0008
    step += speed;
    let freqCoeff = 0.3*(uniforms.u_frequency.value)/155;
    let val = freqCoeff + 0.5;
    mesh.scale.set(val,val,val)
    
    // renderer.render(scene, camera) [NOT COMPATIBLE WITH POST-PROCESSING YET]

    bloomComposer.render();
    requestAnimationFrame(animate);
}
// renderer.setAnimationLoop(animate);
animate();


// Responsiveness
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/ window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(sizes.width, sizes.height);
})

