import { Scene, PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';


// 初始化场景
export const useInitScene: () => Scene = () => {
    const scene = new Scene();

    return scene;
}
// 初始化相机
export const useInitCamera: () => PerspectiveCamera = () => {
    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,1,10);
    // camera.position.y = 300;
    
    // camera.lookAt(0, 300, 0);
    camera.updateProjectionMatrix();

    return camera;
}
// 初始化渲染器
export const useInitRenderer: (canvas: HTMLCanvasElement) => WebGLRenderer = (canvas) => {
    const renderer = new WebGLRenderer({
        canvas: canvas,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor('#000', 1.0);

    return renderer;
}

export default {
    useInitScene,
    useInitCamera,
    useInitRenderer,
}