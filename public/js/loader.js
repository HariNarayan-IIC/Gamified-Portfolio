//Load models before starting the game
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//Create an instance of GLTFLoader
const loader = new GLTFLoader()


export function loadModel(model_name, callback) {
    loader.load(
        //URL to load model from
        'models/'+model_name+'/scene.gltf',
        //Callback function when model is loaded successfully
        (gltf) => {
            callback(gltf)
        },
        //Callback function when model is loading
        undefined,
        //Error handling during loading
        (error) => {
            console.error('An error occurred while loading the model', error);
        }
    )

}