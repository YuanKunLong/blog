import { useEffect, forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
    BoxGeometry,
    MeshLambertMaterial,
    Mesh,
    VideoTexture,
    SRGBColorSpace,
    Material,
    Object3DEventMap,
    Scene,
    Group,
    Vector3
} from 'three';

// 定义子组件的 props 类型
interface VideoComponentProps {
    scene: Scene;
}

type MaterialExtension = MeshLambertMaterial & {
    hue: number;
    saturation: number;
}
type MeshExtension = Mesh<BoxGeometry, Material, Object3DEventMap> & {
    dx: number;
    dy: number;
}

export type VideoHandle = {
    isPlay: Boolean;
    videoAnimate: () => void;
    hideBtn: () => void;
};

const VideoPage = forwardRef<VideoHandle, VideoComponentProps>(({ scene }, ref) => {
    const startBtnRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    let material: MaterialExtension, 
        mesh: MeshExtension;
    let cube_count = 0;

    const meshes: MeshExtension[] = [],
    materials: MaterialExtension[] = [],
    xgrid = 20,
    ygrid = 10;

    const [isPlay, setIsPlay] = useState(false);
    const videoGroup = new Group();

    // 初始化
    useEffect(() => {
        if(!videoRef || !isPlay) return;

        // 创建视频纹理贴图
        const videoTexture = new VideoTexture(videoRef.current!);
        videoTexture.colorSpace = SRGBColorSpace;

        // 创建播放立方体
        let i,j,ox,oy,geometry;
        // 每个网格单元在 x 和 y 方向上的相对大小
        const ux = 1 / xgrid;
        const uy = 1 / ygrid;
        // 每个立方体的尺寸，基于网格的大小计算得出
        const xSize = 4.80 / xgrid;
        const ySize = 2.04 / ygrid;
        // 定义材质参数
        const parameters = { color: 0xffffff, map: videoTexture };
        // 计数器，用于跟踪已经创建的立方体数量

        for (i = 0; i < xgrid; i++) {
            for (j = 0; j < ygrid; j++) {
                ox = i;
                oy = j;

                geometry = new BoxGeometry(xSize, ySize, xSize);
                change_uvs(geometry, ux, uy, ox, oy)
                materials[cube_count] = new MeshLambertMaterial(parameters) as MaterialExtension;
                
                material = materials[cube_count];
                material.hue = i / xgrid; // 材质的色相
                material.saturation = 1 - j / ygrid; // 材质的饱和度
                // 根据色相和饱和度设置材质的颜色
                material.color.setHSL(material.hue, material.saturation, 0.5);

                // @ts-ignore
                mesh = new Mesh(geometry, material);
                mesh.position.x = (i - xgrid / 2) * xSize;
                mesh.position.y = (j - ygrid / 2) * ySize;
                mesh.position.z = 0;
                mesh.scale.set(1, 1, 1);

                videoGroup.add(mesh);

                mesh.dx = 0.001 * (0.5 - Math.random());
                mesh.dy = 0.001 * (0.5 - Math.random());

                meshes[cube_count] = mesh;

                cube_count += 1;
            }
        }

        videoGroup.position.set(0, 300, 7);
        scene.add(videoGroup);

        function change_uvs(geometry: any, unitx: any, unity: any, offsetx: any, offsety: any) {
            const uvs = geometry.attributes.uv.array;

            for (let i = 0; i < uvs.length; i += 2) {
                uvs[i] = (uvs[i] + offsetx) * unitx;
                uvs[i + 1] = (uvs[i + 1] + offsety) * unity;
            }
        }
    }, [isPlay])

    let counter = 1;
    const videoAnimate = () => {
        // 首屏视频方块动画
        if (counter % 600 > 200) {
            for (let i = 0; i < cube_count; i++) {
                mesh = meshes[i];

                mesh.rotation.x += 0.1 * mesh.dx;
                mesh.rotation.y += 0.1 * mesh.dy;

                mesh.position.x -= 1.5 * mesh.dx;
                mesh.position.y += 1.5 * mesh.dy;
                mesh.position.z += 3 * mesh.dx;
            }
        }
        if (counter % 600 === 0) {
            for (let i = 0; i < cube_count; i++) {
                mesh = meshes[i];
                mesh.dx *= - 1;
                mesh.dy *= - 1;
            }
        }

        counter++;
    }

    // 隐藏开始按钮
    const hideBtn = () => {
        if(startBtnRef.current) {
            startBtnRef.current.style.display = 'none';
        }
    }

    // 开始动画
    const playVideo = () => {
        hideBtn();
        
        setIsPlay(true);
        if(videoRef.current) videoRef.current.play();
    }

    useImperativeHandle(ref, () => {
        return {
            isPlay,
            videoAnimate,
            hideBtn
        }
    })
    
    return (
        <div>
            <div 
                ref={startBtnRef}
                className="font-mono text-white cursor-pointer absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 border-solid border-2 border-white rounded px-4 py-1.5" 
                onClick={playVideo} 
                id="startButton"
            >Start</div>

            <video ref={videoRef} id="video" loop crossOrigin="anonymous" playsInline style={{display: 'none'}}>
                <source src="model/Interstellar/sintel.ogv" type='video/ogg; codecs="theora, vorbis"' />
                <source src="model/Interstellar/sintel.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
            </video>
        </div>
    )
})

export default VideoPage;