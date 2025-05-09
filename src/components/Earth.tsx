import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import earthJPG from "/earth.jpg";
import nightPNG from "/night.png";
import cloudPNG from "/clouds.png";
import bumpJPG from "/bump.jpg";
import latLongToVector3 from "../utils/latLongToVector3";

type RotatingEarthProps = {
  width?: string;
  height?: string;
};

// 定义标记点数据结构
interface Marker {
  name: string;
  latitude: number; // 纬度，范围：-90到90
  longitude: number; // 经度，范围：-180到180
  color: string;
  size: number;
  mesh?: THREE.Mesh; // 存储创建的网格对象
}

const Earth: React.FC<RotatingEarthProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // 示例标记点数据
  const markerData: Marker[] = [
    {
      name: "武汉",
      latitude: 30.5,
      longitude: 114,
      color: "#8b5cf6",
      size: 0.02,
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // 清除严格模式下渲染两个地球情况
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // 创建一个对象来存储可调整的参数
    const parameters = {
      earthRotationSpeed: 0.0005,
      cloudRotationSpeed: 0.00055,
      cloudOpacity: 0.8,
      sunIntensity: 1.2,
      ambientIntensity: 0.1,
      transitionSharpness: 1,
    };

    // 创建scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 创造camera
    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current?.clientWidth / containerRef.current?.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2;
    scene.add(camera);

    // 创造renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2, // 只在低DPI设备上启用抗锯齿
      alpha: true,
      precision: "mediump", // 使用中等精度以提高性能
      powerPreference: "high-performance", // 请求高性能GPU模式
    });
    renderer.setPixelRatio(window.devicePixelRatio); // 适应设备像素比
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 添加阻尼效果，使控制更平滑
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // 禁止缩放
    controls.enablePan = false; // 禁止平移
    // controls.autoRotate = false; // 可以设置为true让地球自动旋转

    // 添加环境光和平行光（太阳光）
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      parameters.ambientIntensity
    ); // 颜色和强度
    scene.add(ambientLight);

    // 创建固定的太阳光源
    const sunLight = new THREE.DirectionalLight(
      0xffffff,
      parameters.sunIntensity
    ); // 颜色和强度
    sunLight.position.set(5, 3, 5).normalize();
    scene.add(sunLight);

    // 创建地球
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);

    // 创建地球纹理层
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(earthJPG);
    const earthNightTexture = textureLoader.load(nightPNG);
    const bumpTexture = textureLoader.load(bumpJPG);

    // 创建自定义着色器材质实现昼夜效果
    const earthMaterial = new THREE.ShaderMaterial({
      // 定义着色器中使用的全局变量（uniform变量）
      uniforms: {
        dayTexture: { value: earthTexture }, // 白天纹理贴图
        nightTexture: { value: earthNightTexture }, // 夜晚纹理贴图
        bumpTexture: { value: bumpTexture }, // 凹凸贴图，用于增加表面细节
        bumpScale: { value: 0.03 }, // 凹凸贴图的影响强度
        sunDirection: { value: new THREE.Vector3(5, 3, 5).normalize() }, // 太阳光方向（归一化）
        transitionSharpness: { value: parameters.transitionSharpness }, // 昼夜过渡的锐度，值越大过渡越锐利
      },
      // 顶点着色器：处理每个顶点的位置和属性
      vertexShader: `
        varying vec2 vUv;           // 传递给片段着色器的UV坐标
        varying vec3 vNormal;       // 传递给片段着色器的模型空间法线
        varying vec3 vWorldNormal;  // 传递给片段着色器的世界空间法线
        
        void main() {
          // 将UV坐标传递给片段着色器
          vUv = uv;
          // 计算并传递模型空间中的法线向量（用于凹凸贴图）
          vNormal = normalize(normalMatrix * normal);
          
          // 计算世界空间的法线（用于光照计算）
          // modelMatrix将顶点从模型空间转换到世界空间
          // mat3()提取3x3矩阵,仅应用旋转和缩放,不应用平移
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          
          // 计算顶点的最终位置（裁剪空间坐标）
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      // 片段着色器：处理每个像素的颜色
      fragmentShader: `
        // 定义全局变量 从JavaScript传入
        uniform sampler2D dayTexture;     // 白天纹理
        uniform sampler2D nightTexture;   // 夜晚纹理
        uniform sampler2D bumpTexture;    // 凹凸贴图
        uniform float bumpScale;          // 凹凸效果强度
        uniform vec3 sunDirection;        // 太阳光方向
        uniform float transitionSharpness; // 昼夜过渡锐度
        
        // 从顶点着色器接收的变量
        varying vec2 vUv;                 // UV坐标
        varying vec3 vNormal;             // 模型空间法线
        varying vec3 vWorldNormal;        // 世界空间法线
        
        void main() {
          // 使用世界空间法线计算光照强度
          // dot()计算两个向量的点积，表示光照方向与表面法线的夹角余弦值
          // max()确保强度不小于0(背光面)
          float intensity = max(0.0, dot(vWorldNormal, sunDirection));
          
          // 应用凹凸贴图，增强表面细节
          vec3 normal = normalize(vNormal);
          // 将凹凸贴图的RGB值从[0,1]映射到[-1,1]范围
          vec3 bump = texture2D(bumpTexture, vUv).rgb * 2.0 - 1.0;
          // 将凹凸效果添加到法线，并减小其影响(*0.5)以避免过度效果
          normal = normalize(normal + bump * bumpScale * 0.5);
          
          // 获取白天和夜晚纹理颜色
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // 使用平滑过渡函数计算昼夜混合比例
          // smoothstep()创建平滑的S形过渡曲线,从0到transitionSharpness
          float transition = smoothstep(0.0, transitionSharpness, intensity);
          
          // 添加额外的平滑处理，使过渡更加自然
          // 将transition值从[0,1]重新映射到[0.1,0.9]范围内的S形曲线
          transition = smoothstep(0.1, 0.9, transition);
          
          // 混合白天和夜晚纹理
          // mix()根据第三个参数（混合因子）线性插值两个颜色
          // transition为0时显示夜晚纹理,为1时显示白天纹理
          gl_FragColor = mix(nightColor, dayColor, transition);
        }
      `,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthRef.current = earth;
    scene.add(earth);

    // 创建云球
    const cloudGeometry = new THREE.SphereGeometry(1.005, 32, 32);

    // 创建云纹理层
    const cloudTexture = textureLoader.load(cloudPNG);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: parameters.cloudOpacity, // 云层透明度
      alphaMap: cloudTexture,
      depthWrite: false, // 禁止以确保渲染正常
      side: THREE.DoubleSide, // 双向渲染，确保camera无论在哪都正常渲染
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloud);

    // 创建标记点
    markersRef.current = markerData.map((marker) => {
      // 创建圆锥缓存几何体 - 调整大小和细分
      const markerGeometry = new THREE.ConeGeometry(marker.size, 0.4, 16);

      // 创建发光材质
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: marker.color,
        transparent: true,
        opacity: 0.7,
      });

      // 创建标记网格
      const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);

      // 将标记和发光效果添加到场景
      scene.add(markerMesh);

      // 更新标记对象，添加mesh引用和引用
      return { ...marker, mesh: markerMesh };
    });

    // 动画
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // 只有当场景可见或发生变化时才渲染
      if (isVisible || needsUpdate) {
        earth.rotation.y += parameters.earthRotationSpeed;
        cloud.rotation.y += parameters.cloudRotationSpeed;

        // 更新标记点位置，使其跟随地球旋转
        // 优化：减少每帧的计算量
        let frameCount = 0;
        markersRef.current.forEach((marker) => {
          if (marker.mesh) {
            // 每3帧更新一次标记位置，而不是每帧都更新
            if (frameCount % 3 === 0) {
              // 计算标记在地球表面的位置
              const position = latLongToVector3(
                marker.latitude,
                marker.longitude,
                1.01
              );

              // 应用地球的旋转
              position.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                earth.rotation.y
              );

              // 计算从地球中心到标记点的方向向量
              const direction = position.clone().normalize();

              // 创建一个向上的向量
              const up = new THREE.Vector3(0, 1, 0);

              // 创建一个四元数，使圆锥朝向地球表面法线方向
              const quaternion = new THREE.Quaternion();
              quaternion.setFromUnitVectors(up, direction);

              // 更新标记位置和旋转
              marker.mesh.position.copy(position);
              marker.mesh.setRotationFromQuaternion(quaternion);
            }
          }
        });
        frameCount = (frameCount + 1) % 60; // 重置计数器

        controls.update();
        renderer.render(scene, camera);
        needsUpdate = false;
      }
    };

    // 添加可见性检测
    let isVisible = true;
    let needsUpdate = true;

    // 使用Intersection Observer检测元素可见性
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) needsUpdate = true;
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    animate();

    // 在组件卸载时彻底清理资源
    return () => {
      // 取消动画
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    
      // 取消观察者
      if (observer) {
        observer.disconnect();
      }
    
      // 释放资源
      if (sceneRef.current) {
        // 递归处理场景中的所有对象
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => disposeMaterial(material));
              } else {
                disposeMaterial(object.material);
              }
            }
          }
        });
        
        sceneRef.current.clear();
      }
      
      // 辅助函数：处理材质释放
      function disposeMaterial(material: THREE.Material) {
        // 释放材质的所有纹理
        for (const key in material) {
          const value = (material as any)[key];
          if (value && typeof value === 'object' && 'isTexture' in value) {
            value.dispose();
          }
        }
        material.dispose();
      }
    
      // 释放渲染器
      if (renderer) {
        renderer.dispose();
        
        // 移除renderer
        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width, height }}></div>;
};

export default Earth;
