"use client";
import { useEffect, useRef, useState } from "react";
import {
    WheelEvent
} from 'react';
// 引入3d内容
import useInit3D from '@app/hooks/useInit3D';
import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial,
    AxesHelper,
    GridHelper,
    AmbientLight,
    Vector3,
    Group,
    DirectionalLight,
    DirectionalLightHelper,
    BufferGeometry,
    BufferAttribute,
    TextureLoader,
    PointsMaterial,
    Points,
    SpriteMaterial,
    Sprite,
    Color,
    Float32BufferAttribute,
    EquirectangularReflectionMapping,
    Fog,
    HemisphereLight,
    VideoTexture,
    SRGBColorSpace,
    MeshLambertMaterial,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MathUtils
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import Stats from 'three/addons/libs/stats.module.js';
import * as TWEEN from '@tweenjs/tween.js';
// 后期处理
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
// utils
import { getRandomColor } from '@app/utils/color';
import { EffectComposer } from "three/examples/jsm/Addons.js";
// components
import VideoPageComponent,{ VideoHandle } from '@app/components/VideoPage';
// enum
import { InterstellarEnum } from '@model/enum/Interstellar'

type eventInfo = {
    [x: string]: (e: any) => void
}

export default function InterstellarComponent() {
  const { useInitScene } = useInit3D;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<VideoHandle | null>(null);
  let [scene, setScene] = useState<Scene>(useInitScene());
  let camera: PerspectiveCamera, renderer: WebGLRenderer;

  useEffect(() => {
    if(!canvasRef.current) return;
    // 设置全屏
    canvasRef.current.style.width = `${window.innerWidth}px`;
    canvasRef.current.style.height = `${window.innerHeight}px`;

    const { useInitCamera, useInitRenderer } = useInit3D;
    camera = useInitCamera();
    // 初始化3D场景
    renderer = useInitRenderer(canvasRef.current);
    const textureLoader = new TextureLoader();

    // scene.fog = new Fog(0xffffff, 10, 50);
    /* ======================== 辅助工具 start ======================== */
    const gui = new GUI();

    // const stats = new Stats();
    // const container = document.getElementById( 'canvasDiv' );
    // container?.appendChild( stats.dom );

    // 添加坐标轴线
    const axes = new AxesHelper(50);

    // 添加网格辅助对象
    const gridHelper = new GridHelper(50, 50);
    gridHelper.position.x = 0.1;
    gridHelper.position.z = 0.1;

    // 轨道控制器
    // const controls = new OrbitControls(camera, canvasRef.current);
    // controls.enableDamping = true;
    // controls.addEventListener('change', () => {
    //     // console.log(3333,camera.position)
    // })

    scene.add(axes);
    scene.add( gridHelper );
    /* ======================== 辅助工具 end ======================== */


    /* ======================== 模型模块 start ======================== */
    // 永恒号模块
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const positionV = new Vector3(-1.1, 0.5, 4.8);
    dracoLoader.setDecoderPath('model/Interstellar');
    loader.setDRACOLoader(dracoLoader);
    loader.load('model/Interstellar/Eternity.glb', (gltf) => {
        const eternity = gltf.scene;
        eternity.name = InterstellarEnum.ETERNITY;

        eternity.scale.set(0.07, 0.07, 0.07);
        eternity.position.set(positionV.x, positionV.y, positionV.z)
        eternity.rotation.x = 180 * (Math.PI / 180);
        eternity.rotation.y = 30 * (Math.PI / 180);
        
        const eternityGui = gui.addFolder(InterstellarEnum.ETERNITY);
        eternityGui.add(eternity.position, 'x', -10, 10)
        eternityGui.add(eternity.position, 'y', -10, 10)
        eternityGui.add(eternity.position, 'z', -10, 10)
        eternityGui.close()

        scene.add(eternity)
    })

    // 黑洞模型
    loader.load('model/Interstellar/BlackHole.glb', (gltf) => {
        const backHole = gltf.scene;
        backHole.name = InterstellarEnum.BACKHOLE;

        backHole.scale.set(5, 5, 5);
        backHole.position.set(35, 0, -50)
        // backHole.position.set(35, 0, -50)
        backHole.rotation.z = 15 * (Math.PI / 180);
        // backHole.rotation.x = -45 * (Math.PI / 180);
        // backHole.rotation.y = -15 * (Math.PI / 180);

        const backHoleGui = gui.addFolder(InterstellarEnum.BACKHOLE);
        backHoleGui.add(backHole.position, 'x', -50, 50).step(1)
        backHoleGui.add(backHole.position, 'y', -50, 50).step(1)
        backHoleGui.add(backHole.position, 'z', -50, 50).step(1)
        backHoleGui.close()
        
        scene.add(backHole)
    })

    // 星球模型
    const planetGroup = new Group();
    planetGroup.position.set(-10, 0, -2)
    loader.load('model/Interstellar/Planet.glb', (gltf) => {
        const planet = gltf.scene;
        planet.name = InterstellarEnum.PLANETGROUP;

        planet.scale.set(6,6,6)
        
        const planetGroupGui = gui.addFolder(InterstellarEnum.PLANETGROUP);
        planetGroupGui.add(planetGroup.position, 'x', -50, 50).step(1)
        planetGroupGui.add(planetGroup.position, 'y', -50, 50).step(1)
        planetGroupGui.add(planetGroup.position, 'z', -50, 50).step(1)
        planetGroupGui.close()
        
        planetGroup.add(planet);
        scene.add(planetGroup)
    })

    // 粒子模块
    const mapDot = textureLoader.load('model/Interstellar/gradient.png');
    for (let i = 0; i < 10; i++) {
        const randomColor = getRandomColor([228, 152, 195], [255, 255, 255]);

        const particleGeometry = new BufferGeometry();
        const particleMaterial = new PointsMaterial({ 
            size: Math.random() * 0.5 + 0.1, 
            color: randomColor, 
            map: mapDot,
            transparent: true,
        });

        let veticsFloat32Array = []
        for (let j = 0; j < 100; j++) {
            let x = (Math.random() * 220 - 100) + 25;
            let y = Math.random() * 220 - 100;
            let z = Math.random() * 100 - 150;
            veticsFloat32Array.push(x, y, z);
        }
        const vertices = new Float32BufferAttribute(veticsFloat32Array, 3);
        particleGeometry.attributes.position = vertices;

        const particles = new Points(particleGeometry, particleMaterial);
        scene.add(particles);

        const particleTween = new TWEEN.Tween(particles.position)
        .to({x: -75, y: -2, z: 75}, (Math.random() * 5 + 2) * 1000) // 目标值，毫秒数
        .repeat(Infinity)
        .start()
        particleTween.easing(TWEEN.Easing.Quadratic.In);
    }

    const geometry1 = new BufferGeometry();
    const vertices1 = [];

    for ( let i = 0; i < 10000; i ++ ) {
        vertices1.push( MathUtils.randFloatSpread( 2000 ) ); // x
        vertices1.push( MathUtils.randFloatSpread( 2000 ) ); // y
        vertices1.push( MathUtils.randFloatSpread( 2000 ) ); // z
    }
    geometry1.setAttribute( 'position', new Float32BufferAttribute( vertices1, 3 ) );

    const particles = new Points( geometry1, new PointsMaterial( { color: 0x888888, map: mapDot, transparent: true } ) );
    scene.add( particles );
    /* ======================== 模型模块 end ======================== */


    /* ======================== 灯光模块 start ======================== */
    // 半球光
    // const hemisphereLight = new HemisphereLight(0xaaaaaa, 0x000000, .9);
    // scene.add(hemisphereLight);

    // 添加环境光
    const ambientLight = new AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    // 星球灯光
    const pointLight = new DirectionalLight('#ae506b', 5);
    pointLight.position.set(20, 2, 0);
    planetGroup.add(pointLight);
    /* ======================== 灯光模块 end ======================== */


    /* ======================== 后期处理 start ======================== */
    // const composer = new EffectComposer(renderer);
    // composer.addPass(new RenderPass(scene, camera))

    // // 星球模糊效果
    // const hBlur = new ShaderPass(HorizontalBlurShader)
    // const vBlur = new ShaderPass(VerticalBlurShader);

    // hBlur.uniforms['h'].value = 1 / window.innerWidth;
    // vBlur.uniforms['v'].value = 1 / window.innerHeight;
    // composer.addPass(hBlur);
    // composer.addPass(vBlur);
    /* ======================== 后期处理 end ======================== */

    // 循环渲染
    function animate() {
        requestAnimationFrame(animate);

        // 首屏视频方块动画
        videoRef.current?.videoAnimate();

        // 永恒号动画
        const eternity = scene.getObjectByName(InterstellarEnum.ETERNITY);
        if(eternity){
            eternity.rotation.z += 0.01;
        }
        // 黑洞动画
        // const blackHole = scene.getObjectByName(InterstellarEnum.BACKHOLE);
        // if(blackHole){
        //     blackHole.rotation.y += 0.01;
        // }
    
        TWEEN.update();
        // 修改相机视角camera.lookAt时不能使用controls
        // controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 视觉偏移效果
    const handleMousemove = (e :any) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 + 1;
        // camera.position.x = x * 0.1;
        // camera.position.y = y * 0.1;

        const astronaut = scene.getObjectByName(InterstellarEnum.ETERNITY);
        if(astronaut) {
            const offsetNum = 0.15;
            const particleTween = new TWEEN.Tween(astronaut.position)
            .to({x: positionV.x + x * offsetNum, y: positionV.y + y * offsetNum}, 30) // 目标值，毫秒数
            .start()
            // particleTween.easing(TWEEN.Easing.Quadratic.In);
        }
    }

    // 滚轮滚动
    const handleMousewheel = (e: any) => {
        const tween1 = new TWEEN.Tween(camera.position)
        const tween2 = new TWEEN.Tween(camera.up)

        // 向下滚动
        if(e.wheelDelta < 0) {
            tween1.to({x: 0, y: 1, z: 10}, 2000)
            .start()
            .easing(TWEEN.Easing.Quartic.InOut)

            tween2.to(new Vector3(0, 0, 0), 2000)
            .start()
            .easing(TWEEN.Easing.Back.InOut)
            
            // 清除静态星光
            scene.remove(particles);
            // 隐藏开始按钮
            videoRef.current?.hideBtn();
            
            camera.updateProjectionMatrix();
        }

        // 向上滚动
        if(e.wheelDelta > 0) {
            tween1.to({x: 0, y: 1, z: 10}, 2000)
            .start()
            .easing(TWEEN.Easing.Quartic.InOut)

            tween2.to(new Vector3(0, 0, 0), 2000)
            .start()
            .easing(TWEEN.Easing.Back.InOut)
        }
    }
      
    // 画布自适应
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 事件注册
    const eventInfo: eventInfo = {
        resize: handleResize,
        mousemove: handleMousemove,
        mousewheel: handleMousewheel,
    }

    for (const key in eventInfo) {
        const eventFun = eventInfo[key];
        window.addEventListener(key, eventFun)
    }
    return () => {
        for (const key in eventInfo) {
            const eventFun = eventInfo[key];
            window.removeEventListener(key, eventFun)
        }
    }
  }, []);
  
  return (
    <>
        {/* 首屏视频 */}
        { scene && <VideoPageComponent ref={videoRef} scene={scene} /> }
        
        <div id="canvasDiv">
            <canvas id='canvas' ref={canvasRef}></canvas>
        </div>
    </>
    
  );
}
