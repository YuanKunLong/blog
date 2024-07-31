"use client"
import { useEffect, useRef, useState } from "react";
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
    MathUtils,
    Raycaster,
    Vector2,
    MeshStandardMaterial,
    Texture
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import Stats from 'three/addons/libs/stats.module.js';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
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

export default function Page() {
  const { useInitScene } = useInit3D;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let [scene, setScene] = useState<Scene>(useInitScene());
  let camera: PerspectiveCamera, renderer: WebGLRenderer;

  const [up, setUp] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [layer, setLayer] = useState(0);
  useEffect(() => {
    setShowBack(layer > 0)
  }, [layer])

  let backHandle;

  useEffect(() => {
    if(!canvasRef.current) return;
    // 设置全屏
    canvasRef.current.style.width = `${window.innerWidth}px`;
    canvasRef.current.style.height = `${window.innerHeight}px`;

    const { useInitRenderer } = useInit3D;
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,30,30);
    camera.lookAt(0,30,30);
    // camera.position.y = 300;
    camera.updateProjectionMatrix();
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
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.addEventListener('change', () => {
        // console.log(3333,camera.position)
    })

    // scene.add(axes);
    // scene.add( gridHelper );
    /* ======================== 辅助工具 end ======================== */


    /* ======================== 模型模块 start ======================== */
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const positionV = new Vector3(-1.1, 0.5, 4.8);
    dracoLoader.setDecoderPath('model/Interstellar');
    loader.setDRACOLoader(dracoLoader);
    const layerList: any = [];
    const colorObj: any = {}

    loader.load('model/demo/demo1.glb', (gltf) => {
        const eternity = gltf.scene;

        for (let i = 0; i < 5; i++) {
            const group = new Group();
            group.name = `${i}层楼`;

            const layer = eternity.clone();
            group.position.y = 3 * i;

            layer.traverse((child) => {
                if(child instanceof Mesh) {
                    const { color } = child.material as MeshStandardMaterial;
                    child.material = new MeshBasicMaterial({ color });
                    colorObj[child.name] = color;
                    child.material.transparent = true;
                    child.name = `${i}层楼_${child.name}`;
                }
            })

            layerList.push(layer)
            group.add(layer)
            scene.add(group)
        }
    })
    
    /* ======================== 模型模块 end ======================== */

    const raycaster = new Raycaster();
    // 被点击的坐标位置
    const mouse = new Vector2()
    let strIndex: any = null;

    const moveHandle = (event: any) => {
        if(showBack) return;
        // 屏幕上的坐标转换为归一化设备上的坐标公式
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        // 确定射线 - 基于鼠标点的裁剪坐标位和相机设置射线投射器
        raycaster.setFromCamera(mouse, camera);
        
        // 获取被射线射中的集合。
        const array = raycaster.intersectObjects(layerList)
        const body = document.body;
        if(array.length) {
            body.style.cursor = 'pointer';

            const mesh = array[0]?.object as Mesh;
            strIndex = mesh.name.slice(0, 1);
            
            for (let i = 0; i < layerList.length; i++) {
                layerList[i].traverse((child: any) => {
                    if(child instanceof Mesh && !showBack) {
                        if(i === Number(strIndex)) {
                            child.material.opacity = 0.5;
                            child.material.color = new Color('skyblue');
                        }else {
                            child.material.opacity = 1;
                            child.material.color = colorObj[child.name.slice(4)];
                        }
                    }
                })
            }
        }else {
            console.log(3333333,!strIndex)
            if(!strIndex) return;

            strIndex = null;
            body.style.cursor = 'default';
            
            layerList[strIndex]?.traverse((child: any) => {
                if(child instanceof Mesh) {
                    child.material.opacity = 1;
                    child.material.color = colorObj[child.name.slice(4)];
                }
            })
        }
    }
    window.addEventListener('mousemove', moveHandle)


    /* ======================== 灯光模块 start ======================== */
    // 添加环境光
    const ambientLight = new AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
    /* ======================== 灯光模块 end ======================== */

    // 循环渲染
    function animate() {
        requestAnimationFrame(animate);
    
        // 修改相机视角camera.lookAt时不能使用controls
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
      
    // 画布自适应
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 初始化CSS2DRenderer
    // const labelRenderer = new CSS2DRenderer();
    // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    // labelRenderer.domElement.style.position = 'absolute';
    // labelRenderer.domElement.style.top = '0px';
    // document.body.appendChild(labelRenderer.domElement);

    const onMouseClick = (event: MouseEvent) => {
        if (!canvasRef.current) return;

        // 计算鼠标位置在标准化设备坐标（NDC）中的位置（范围为 -1 到 +1）
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(scene, true);
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            const index = intersectedObject.name.slice(0, 1);
            setLayer(Number(index) + 1)

            let yLook = 0;
            for (let i = 0; i < layerList.length; i++) {
                layerList[i].traverse((child: any) => {
                    if(child.isGroup) {
                        yLook = child.position.y;
                    }
                    if(child instanceof Mesh) {
                        if(i === Number(index)) {
                            child.visible = true;
                            child.material.opacity = 1;
                            child.material.color = colorObj[child.name.slice(4)];
                        }else {
                            child.visible = false;
                        }
                    }
                })
            }
            
            camera.position.set(0,yLook + 30,0);
            camera.lookAt(0,yLook + 30,0);
            camera.updateProjectionMatrix();

            window.removeEventListener('mousemove', moveHandle)
        }else {
            scene.children.forEach(child => {
                child.traverse((c: any) => {
                    if(c instanceof Mesh) {
                        c.visible = true;
                    }
                })
            })
            setLayer(0)
            
            camera.position.set(0,30,30);
            camera.lookAt(0,30,30);
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
            window.addEventListener('mousemove', moveHandle)
        }
    }
    

    // 事件注册
    const eventInfo: eventInfo = {
        resize: handleResize,
        click: onMouseClick
    }

    for (const key in eventInfo) {
        const eventFun = eventInfo[key];
        window.addEventListener(key, eventFun, false)
    }
    return () => {
        for (const key in eventInfo) {
            const eventFun = eventInfo[key];
            window.removeEventListener(key, eventFun)
        }
    }
  }, []);

  const expandHandle = () => {
    setUp(!up);

    scene.children.forEach(child => {
        if(child.name.includes('层楼')) {
            if(up) {
                child.position.y = child.position.y / 2;
            }else {
                child.position.y = child.position.y * 2;
            }
        }
    })
  }

  

    return (
        <div id="canvasDiv" className="relative">
            {   
                showBack && 
                <div className="absolute left-1/2 top-10 text-white text-xl -translate-x-1/2">
                    第 {layer} 层楼信息
                </div>
            }
            <div className="absolute left-1/2 bottom-20 w-100 flex align-center justify-center -translate-x-1/2">
                {
                    !showBack && 
                    <div onClick={expandHandle} className="text-cyan-200 px-4 py-1 rounded border-2 cursor-pointer mr-3">
                        {up ? '收起' : '展开'}
                    </div>
                }
                {
                    // showBack && 
                    // <div onClick={backHandle} className="text-cyan-200 px-4 py-1 rounded border-2 cursor-pointer">
                    //     返回
                    // </div>
                }
            </div>
            
            <canvas id='canvas' ref={canvasRef}></canvas>
        </div>
    )
}