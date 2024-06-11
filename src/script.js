import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

var uniforms = {
    u_resolution: {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
    u_time: {type: 'f', value: 0.0},
    u_frequency: {type: 'f', value: 0.0}
}

var material = new THREE.ShaderMaterial ({
    uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent
});


// Canvas
const canvas = document.querySelector('canvas.webgl');


// Scene
const scene = new THREE.Scene();


// Object
const geometry = new THREE.IcosahedronGeometry(2, 20);

const mesh = new THREE.Mesh(geometry, material);

mesh.material.wireframe = true;
// Particles

// Geometry
const particlesGeo = new THREE.SphereGeometry(0.01);


// Material
const particlesMat = new THREE.PointsMaterial();

particlesMat.size = 0.002;
particlesMat.sizeAttenuation = true;
var particleCount = 6000;

const particles = new THREE.InstancedMesh(particlesGeo, particlesMat, particleCount)

scene.add(particles)

var tempCoords = new THREE.Object3D();

scene.add(mesh);

for (let i = 0; i < particleCount; i++) {
    tempCoords.position.x = Math.random() * 40 - 20;
    tempCoords.position.y = Math.random() * 40 - 20;
    tempCoords.position.z = Math.random() * 40 - 20;

    tempCoords.updateMatrix();
    particles.setMatrixAt(i, tempCoords.matrix);
}

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight);


camera.position.set(0,0,7)

scene.add(camera);

// Audio
var listener = new THREE.AudioListener();
camera.add(listener);
var audioElem = document.getElementById('audio_file');
var sound = new THREE.Audio(listener);
sound.setMediaElementSource(document.getElementById('audio_file'));
sound.hasPlaybackControl = true;

function audioToggle() {
    if (audioElem.paused) {
        audioElem.play();
    } else {
        audioElem.pause();
    };
}

var seekBar = document.querySelector('.seek_bar');
var input = document.querySelector('#audio_input');
input.addEventListener('change', ( event ) => {

    // Clear previous audio's event listener
    canvas.removeEventListener('change', audioToggle);

    var audioFile = event.target.files[0];
    $("#src").attr("src", URL.createObjectURL(audioFile));
    document.getElementById('audio_file').load();

    audioElem.onloadedmetadata = () => {
        seekBar.value = 0
        seekBar.max = audioElem.duration;
    }

    listener.context.resume();        

    // Add new event listener for updated audio
    canvas.addEventListener('click', audioToggle);
    setMusic();
    
   
    
    function setMusic() {
        // Splits file extension off of audio file title
        var split = event.target.files[0].name.split('.');
        
        let fileExtension = split.pop();

        if (fileExtension != "mp3" &&
            fileExtension != "wav" &&
            fileExtension != "m4a" &&
            fileExtension != "oog" &&
            fileExtension != "aac" &&
            fileExtension != "opus") {

                $('#instruct').html("File type not supported, please only use audio files.");
                
                $('.player_text').html("Nothing");


                $('#instruct').animate({"opacity": 1}, 200);
                setTimeout(()=>{
                $('#instruct').animate({'opacity':0});
                }, 3000)        

                
                return;
            }
        
        var title = split.join('.');
        
        document.querySelector('.player_text').innerHTML = title;

        
        setInterval(() => {
            seekBar.value = audioElem.currentTime;
        }, 300);

        seekBar.addEventListener('change', () => {
            audioElem.currentTime = seekBar.value;
        })

    // Display popup message to play
    $('#instruct').html("Audio loaded, tap anywhere to play!");
    $('#instruct').animate({"opacity": 1}, 200);
    setTimeout(()=>{
        $('#instruct').animate({'opacity':0});
    }, 3000)  
        
    }
});

    const analyser = new THREE.AudioAnalyser(sound, 32);


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000);
renderer.setPixelRatio( window.devicePixelRatio );

// ORBIT CONTROLS [DISABLED]
// const orbit = new OrbitControls(camera, renderer.domElement);

// Post-processing
renderer.outputColorSpace = THREE.SRGBColorSpace;

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.8, 0.5);

const bloomComposer = new EffectComposer(renderer);


bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const outputPass = new OutputPass();
bloomComposer.addPass(outputPass);

bloomComposer.setPixelRatio(window.devicePixelRatio);

// Animation
const clock = new THREE.Clock();
let step = 0;
let speed = 0.002;

var currDecomp = new THREE.Matrix4();

var currCoords = new THREE.Vector3();
var currRot = new THREE.Quaternion();
var currScale = new THREE.Vector3();
var factor = 0.001;

function animate() {
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    mesh.rotation.y += 0.0006;
    mesh.rotation.x += 0.0007;
    mesh.rotation.z += 0.0008;

    // PLANE ROTATION [REMOVED]
    // plane1.rotation.z += 0.0005;
    // plane2.rotation.z += 0.0005;

    step += speed;
    let freqCoeff = 0.3*(uniforms.u_frequency.value)/155;
    let val = freqCoeff + 0.5;
    mesh.scale.set(val,val,val)
    
    // renderer.render(scene, camera) [NOT COMPATIBLE WITH POST-PROCESSING YET]

    // Animate particles


    for (let i = 0; i < particleCount; i++) {
        
        

        particles.getMatrixAt(i, currDecomp);
        currDecomp.decompose(currCoords, currRot, currScale);

        tempCoords.position.x = currCoords.x +  factor* Math.cos((uniforms.u_time.value / 100) * 2) + factor*(Math.sin(uniforms.u_time.value * 1) * 2) / 100;
        tempCoords.position.y = currCoords.y +  factor*Math.sin((uniforms.u_time.value / 100) * 2) + factor*(Math.cos(uniforms.u_time.value * 2) * 2) / 100;
        tempCoords.position.z = currCoords.z + factor* Math.cos((uniforms.u_time.value / 100) * 2) + factor*(Math.sin(uniforms.u_time.value * 3) * 2) / 100;
    
        tempCoords.updateMatrix();
        particles.setMatrixAt(i, tempCoords.matrix);
    }
    
    particles.instanceMatrix.needsUpdate = true;



    bloomComposer.render();
    requestAnimationFrame(animate);
}
// renderer.setAnimationLoop(animate);
animate();


// Responsiveness
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    bloomComposer.setPixelRatio( window.devicePixelRatio );
    camera.updateProjectionMatrix();

})

// Sidebar functionality

var button = document.getElementById('hover_button');
var controller = document.getElementById('controller');

$("#controller").hover(()=>{
    $("#hover_button").hide();
},()=>{
    $("#hover_button").show();
})

