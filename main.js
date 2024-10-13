import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Import EffectComposer related libraries
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';




// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the composer for post-processing
const composer = new EffectComposer(renderer);

// Render pass (standard rendering)
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom pass
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.5, 0.85);
composer.addPass(bloomPass);

// Gamma correction (to correct color brightness)
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaCorrectionPass);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);
const light2 = new THREE.DirectionalLight(0xffffff, 5);
light2.position.set(-10, 10, -10);
scene.add(light2);

// Model loader setup
const loader = new GLTFLoader();

// Load Spaceship GLTF model
let spaceship;
loader.load('models/spaceship2/scene.gltf', (gltf) => {
	spaceship = gltf.scene;
	spaceship.scale.set(1.5, 1.5, 1.5); // Adjust the size of the spaceship model
	scene.add(spaceship);
	spaceship.position.z = 0; // Set initial position of the spaceship
	spaceship.position.y = -2
	spaceship.rotation.y = Math.PI
}, undefined, (error) => {
	console.error('An error occurred while loading the model', error);
});

let asteroidModel;
const asteroids = [];

// Load the asteroid model asynchronously
loader.load('models/asteroid/scene.gltf', (gltf) => {
    asteroidModel = gltf.scene;  // The base asteroid model is loaded
    asteroidModel.scale.set(2, 2, 2);  // Adjust the size of the model
    
    // Once the model is loaded, create and position multiple asteroids
    for (let i = 0; i < 10; i++) {
        // Clone the loaded asteroid model
        const asteroidClone = asteroidModel.clone();
        
        // Set a random position for each asteroid
        asteroidClone.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, -10 - Math.random() * 10);

		// Set a random orientation for each asteroid
		asteroidClone.rotation.x = Math.random() * Math.PI
		asteroidClone.rotation.y = Math.random() * Math.PI
		asteroidClone.rotation.z - Math.random() * Math.PI

		//Set a random scale
		asteroidClone.scale.set(Math.random() * 3 + 2, Math.random() * 3 + 2, Math.random() * 3 + 2)
        
        // Add the asteroid clone to the scene and store it in the array
        asteroids.push(asteroidClone);
        scene.add(asteroidClone);
    }
}, undefined, (error) => {
    console.error('An error occurred while loading the model', error);
});


// Create loops (rings)
const loopGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
const loopMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const loops = [];

for (let i = 0; i < 5; i++) {
	const loop = new THREE.Mesh(loopGeometry, loopMaterial);
	loop.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, -20 - Math.random() * 15);
	//loop.rotation.x = Math.PI / 2;
	loops.push(loop);
	scene.add(loop);
}

// Create explosion
let explosion = false
let explosionModel;
loader.load('models/explosion/scene.gltf', (gltf) => {
	explosionModel = gltf.scene;
	explosionModel.scale.set(1.5, 1.5, 1.5); // Adjust the size of the spaceship model
	 // Set initial position of the spaceship

}, undefined, (error) => {
	console.error('An error occurred while loading the model', error);
});
const explosionLight = new THREE.AmbientLight(0xFFFF00, 0)

// Camera settings
camera.position.z = 5;

//Space movement
let spaceSpeed = 0.1;

// Spaceship movement
let spaceshipSpeed = 0.05;
let movement = { up: false, down: false, left: false, right: false };

document.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'ArrowUp': movement.up = true; break;
		case 'ArrowDown': movement.down = true; break;
		case 'ArrowLeft': movement.left = true; break;
		case 'ArrowRight': movement.right = true; break;
		case 'w': movement.up = true; break;
		case 's': movement.down = true; break;
		case 'a': movement.left = true; break;
		case 'd': movement.right = true; break;
		case 'W': movement.up = true; break;
		case 'S': movement.down = true; break;
		case 'A': movement.left = true; break;
		case 'D': movement.right = true; break;
	}
});

document.addEventListener('keyup', (event) => {
	switch (event.key) {
		case 'ArrowUp': movement.up = false; break;
		case 'ArrowDown': movement.down = false; break;
		case 'ArrowLeft': movement.left = false; break;
		case 'ArrowRight': movement.right = false; break;
		case 'w': movement.up = false; break;
		case 's': movement.down = false; break;
		case 'a': movement.left = false; break;
		case 'd': movement.right = false; break;
		case 'W': movement.up = false; break;
		case 'S': movement.down = false; break;
		case 'A': movement.left = false; break;
		case 'D': movement.right = false; break;
	}
});

// SpaceShip wobble effect variables
let wobbleDuration = 50
let wobbleDirection = true

let explosionDuration = 120
let explosionSize = 0.1

let executed = false

let cameraAngle = 0; // Initial angle for revolving camera
let cameraRadius = 5; // Radius for how far the camera will revolve
const cameraSpeed = 0.02; // Speed of camera revolution

// Game loop
function animate() {
	
        requestAnimationFrame(animate);


	// Move spaceship if it's loaded
	if (spaceship) {
		if (movement.up) {
			spaceship.position.y += spaceshipSpeed;
			camera.position.y += spaceshipSpeed ;

			//spaceship.rotation.x += spaceshipSpeed/10;
			//camera.rotation.x += spaceshipSpeed/15;
		}
		if (movement.down) {
			spaceship.position.y -= spaceshipSpeed;
			camera.position.y -= spaceshipSpeed ;

			//spaceship.rotation.x -= spaceshipSpeed/10;
			//camera.rotation.x -= spaceshipSpeed/15;
		}
		if (movement.left) {
			spaceship.position.x -= spaceshipSpeed;
			camera.position.x -= spaceshipSpeed;

			spaceship.rotation.z += spaceshipSpeed/10;
			camera.rotation.z += spaceshipSpeed/10;
			
		}
		if (movement.right) {
			spaceship.position.x += spaceshipSpeed;
			camera.position.x += spaceshipSpeed;

			spaceship.rotation.z -= spaceshipSpeed/10;
			camera.rotation.z -= spaceshipSpeed/10;


		}
		//Wobble effect to spaceship
		wobbleDuration -= 1;
		if (wobbleDirection){
			spaceship.rotation.z += 0.002
		}
		else{
			spaceship.rotation.z -= 0.002
		}
		if (wobbleDuration< 0){
			wobbleDuration = 50
			wobbleDirection = !wobbleDirection
		}
	}

	// Movement after explosion
	if (explosion && explosionModel){
		explosionModel.position.z += spaceSpeed;
		spaceship.position.z += spaceSpeed;
		explosionLight.position.z += spaceSpeed;
		explosionDuration -= 1;
		explosionLight.intensity += 0.3;
		explosionSize += 0.05;
		explosionModel.scale.set(explosionSize, explosionSize, explosionSize)
		if (explosionDuration < 0){
			return;
		}
		
	 }


	// Move asteroids
	if (asteroidModel){
		asteroids.forEach(asteroid => {
			asteroid.position.z += spaceSpeed;
			if (asteroid.position.z > 5) {
				asteroid.position.z = -20;
				asteroid.position.x = Math.random() * 10 - 5;
				asteroid.position.y = Math.random() * 10 - 5;
			}
		});
	}

	// Move Loops
	loops.forEach(loop => {
		loop.position.z += spaceSpeed;
		if (loop.position.z > 5) {
			loop.position.z = -20;
			loop.position.x = Math.random() * 10 - 5;
			loop.position.y = Math.random() * 10 - 5;
		}
	});

	// Move camera
	if (explosion) {
        // Increment the angle for the camera's circular movement
        

        // Calculate the new camera position based on polar coordinates
        camera.position.x = explosionModel.position.x + cameraRadius * Math.sin(cameraAngle);
        camera.position.z = explosionModel.position.z + cameraRadius * Math.cos(cameraAngle);

		cameraAngle += cameraSpeed;

        // Keep the camera's Y position at a certain height above the explosion
        //camera.position.y = explosionModel.position.y ;

        // Make sure the camera is always looking at the center of the explosion
        camera.lookAt(explosionModel.position);
    }


	// Check for spaceship-loop collisions (unlock content)
	loops.forEach((loop, index) => {
		if (spaceship && spaceship.position.distanceTo(loop.position) < 1.5) {
			console.log("Loop passed! Unlocking tab...");
			loop.material.color.set(0x0000ff); // Change loop color when passed
		}
	});

	// Check for spaceship-astroid collisions (Game Over)
	asteroids.forEach((asteroid, index) => {
		if (spaceship && spaceship.position.distanceTo(asteroid.position) < 1.5) {
			
			// Change loop color when passed
			if (!executed) {
				console.log("Collision with asteroid");
				explosion = true
				explosionModel.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
				explosionLight.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
				scene.add(explosionModel);
				scene.add(explosionLight);
				executed = true
			}
		}
	});

	composer.render();
}

animate();



    


animate2();

// Handle window resize
window.addEventListener('resize', () => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
});