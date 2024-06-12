Rythm Reactor is a 3d audio visualiser website that leverages Three.js to create a stunning visual experience that will leave you hypnotized whilst jamming out to your favourite tunes! 🎧🎶

This project uses an Icosahedron wireframe mesh alongside GLSL shaders to apply Perlin noise by a magnitude determined by the average frequency of the audio at any given moment. This allows the ball in the center of the screen to morph in response to music!

Additionally, the starry background was also created using Three.js; I used instanced meshes to create about 3000 randomly scattered spheres (so yes, it will create a completely unique starry background every time you refresh!). Thanks to instanced meshes in Three.js, creating and animating 3000 particles isn't too hard on the GPU, and as such, performance is not greatly hindered.

<a href="https://rythm-reactor.vercel.app/">Try it out here!</a>, simply select an audio file from your computer, and click anywhere on the page to start playing! (You can also click again to pause)

Here's a quick demo of the project:

https://github.com/zayan-sheikh/rythm-reactor/assets/115755798/4955a2c0-fa6a-47b6-a158-312d2d2feb37

