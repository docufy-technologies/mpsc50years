import type React from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export type ImageItem = string | { src: string; alt?: string };

export interface FadeSettings {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
}

export interface BlurSettings {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
}

export interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  zSpacing?: number;
  visibleCount?: number;
  /** Kept for API compatibility with the reference demo. Currently unused. */
  falloff?: { near: number; far: number };
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: React.CSSProperties;
}

interface PlaneData {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
}

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

const createClothMaterial = () => {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;

        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }

        pos.z -= (curve + clothEffect + flagWave);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vec4 color = texture2D(map, vUv);

        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;

          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);

        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
};

function opacityForPosition(normalized: number, fade: FadeSettings): number {
  let opacity = 1;
  if (normalized >= fade.fadeIn.start && normalized <= fade.fadeIn.end) {
    const p =
      (normalized - fade.fadeIn.start) /
      (fade.fadeIn.end - fade.fadeIn.start);
    opacity = p;
  } else if (normalized < fade.fadeIn.start) {
    opacity = 0;
  } else if (normalized >= fade.fadeOut.start && normalized <= fade.fadeOut.end) {
    const p =
      (normalized - fade.fadeOut.start) /
      (fade.fadeOut.end - fade.fadeOut.start);
    opacity = 1 - p;
  } else if (normalized > fade.fadeOut.end) {
    opacity = 0;
  }
  return Math.max(0, Math.min(1, opacity));
}

function blurForPosition(normalized: number, blur: BlurSettings): number {
  let value = 0;
  if (normalized >= blur.blurIn.start && normalized <= blur.blurIn.end) {
    const p =
      (normalized - blur.blurIn.start) / (blur.blurIn.end - blur.blurIn.start);
    value = blur.maxBlur * (1 - p);
  } else if (normalized < blur.blurIn.start) {
    value = blur.maxBlur;
  } else if (normalized >= blur.blurOut.start && normalized <= blur.blurOut.end) {
    const p =
      (normalized - blur.blurOut.start) /
      (blur.blurOut.end - blur.blurOut.start);
    value = blur.maxBlur * p;
  } else if (normalized > blur.blurOut.end) {
    value = blur.maxBlur;
  }
  return Math.max(0, Math.min(blur.maxBlur, value));
}

function GalleryScene({
  images,
  speed = 1,
  zSpacing = 3,
  visibleCount = 8,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.15 },
    fadeOut: { start: 0.85, end: 0.95 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.9, end: 1.0 },
    maxBlur: 3.0,
  },
  registerHandlers,
}: Omit<InfiniteGalleryProps, "className" | "style" | "falloff"> & {
  registerHandlers: (handlers: {
    onWheelDelta: (deltaY: number) => void;
    onKeyStep: (dir: 1 | -1) => void;
    onTouchDelta: (deltaY: number) => void;
  }) => void;
}) {
  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img,
      ),
    [images],
  );
  const srcs = useMemo(() => normalizedImages.map((img) => img.src), [normalizedImages]);
  const textures = useTexture(srcs) as THREE.Texture[];

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount],
  );

  useEffect(() => {
    return () => {
      materials.forEach((m) => m.dispose());
    };
  }, [materials]);

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      const x =
        (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) /
        3;
      const y =
        (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4;
      positions.push({ x, y });
    }
    return positions;
  }, [visibleCount]);

  const totalImages = normalizedImages.length;
  const depthRange = zSpacing * visibleCount || DEFAULT_DEPTH_RANGE;

  const planesData = useRef<PlaneData[]>(
    Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: 0,
      y: 0,
    })),
  );

  useEffect(() => {
    planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z:
        visibleCount > 0
          ? ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange
          : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }, [depthRange, spatialPositions, totalImages, visibleCount]);

  useEffect(() => {
    textures.forEach((t) => {
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
      }
    });
    materials.forEach((material, i) => {
      const planeImage = planesData.current[i]?.imageIndex ?? 0;
      const texture = textures[planeImage % Math.max(textures.length, 1)];
      if (material.uniforms && texture) {
        material.uniforms.map.value = texture;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const velocityRef = useRef(0);
  const autoPlayRef = useRef(true);
  const lastInteraction = useRef(Date.now());
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const poke = useCallback(() => {
    autoPlayRef.current = false;
    lastInteraction.current = Date.now();
  }, []);

  const onWheelDelta = useCallback(
    (deltaY: number) => {
      velocityRef.current += deltaY * 0.01 * speedRef.current;
      poke();
    },
    [poke],
  );

  const onKeyStep = useCallback(
    (dir: 1 | -1) => {
      velocityRef.current += dir * 2 * speedRef.current;
      poke();
    },
    [poke],
  );

  const onTouchDelta = useCallback(
    (deltaY: number) => {
      velocityRef.current += deltaY * 0.02 * speedRef.current;
      poke();
    },
    [poke],
  );

  useEffect(() => {
    registerHandlers({ onWheelDelta, onKeyStep, onTouchDelta });
  }, [registerHandlers, onWheelDelta, onKeyStep, onTouchDelta]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastInteraction.current > 3000) {
        autoPlayRef.current = true;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (autoPlayRef.current) {
      velocityRef.current += 0.3 * dt;
    }
    velocityRef.current *= 0.95;

    const time = state.clock.getElapsedTime();
    const imageAdvance =
      totalImages > 0 ? visibleCount % totalImages || totalImages : 0;

    planesData.current.forEach((plane, i) => {
      let newZ = plane.z + velocityRef.current * dt * 10;
      let wrapsForward = 0;
      let wrapsBackward = 0;

      if (newZ >= depthRange) {
        wrapsForward = Math.floor(newZ / depthRange);
        newZ -= depthRange * wrapsForward;
      } else if (newZ < 0) {
        wrapsBackward = Math.ceil(-newZ / depthRange);
        newZ += depthRange * wrapsBackward;
      }

      if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
        plane.imageIndex =
          (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
      }
      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % depthRange) + depthRange) % depthRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      const worldZ = plane.z - depthRange / 2;
      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.set(plane.x, plane.y, worldZ);
      }

      const material = materials[i];
      if (material?.uniforms) {
        const texture = textures[plane.imageIndex];
        if (texture && material.uniforms.map.value !== texture) {
          material.uniforms.map.value = texture;
        }
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = velocityRef.current;
        const normalized = plane.z / depthRange;
        material.uniforms.opacity.value = opacityForPosition(
          normalized,
          fadeSettings,
        );
        material.uniforms.blurAmount.value = blurForPosition(
          normalized,
          blurSettings,
        );
      }
    });
  });

  if (normalizedImages.length === 0) return null;

  return (
    <group>
      {planesData.current.map((plane, i) => {
        const texture = textures[plane.imageIndex];
        const material = materials[i];
        if (!texture || !material) return null;
        const aspect =
          texture.image &&
          (texture.image as HTMLImageElement).width &&
          (texture.image as HTMLImageElement).height
            ? (texture.image as HTMLImageElement).width /
              (texture.image as HTMLImageElement).height
            : 1;
        const scale: [number, number, number] =
          aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];
        const worldZ = plane.z - depthRange / 2;
        return (
          <mesh
            key={plane.index}
            ref={(m) => {
              meshRefs.current[i] = m;
            }}
            position={[plane.x, plane.y, worldZ]}
            scale={scale}
            material={material}
            onPointerEnter={() => {
              if (material.uniforms) material.uniforms.isHovered.value = 1.0;
            }}
            onPointerLeave={() => {
              if (material.uniforms) material.uniforms.isHovered.value = 0.0;
            }}
          >
            <planeGeometry args={[1, 1, 32, 32]} />
          </mesh>
        );
      })}
    </group>
  );
}

function FallbackGallery({ images }: { images: ImageItem[] }) {
  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img,
      ),
    [images],
  );

  return (
    <div className="flex h-full flex-col items-center justify-center bg-muted p-4">
      <p className="mb-4 text-muted-foreground">
        WebGL not supported. Showing image list:
      </p>
      <div className="grid max-h-96 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
        {normalizedImages.map((img, i) => (
          <img
            key={i}
            src={img.src || "/placeholder.svg"}
            alt={img.alt}
            className="h-32 w-full rounded object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery({
  images,
  speed = 1,
  zSpacing = 3,
  visibleCount = 12,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
  className = "h-96 w-full",
  style,
}: InfiniteGalleryProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef<{
    onWheelDelta: (deltaY: number) => void;
    onKeyStep: (dir: 1 | -1) => void;
    onTouchDelta: (deltaY: number) => void;
  } | null>(null);

  const registerHandlers = useCallback(
    (handlers: {
      onWheelDelta: (deltaY: number) => void;
      onKeyStep: (dir: 1 | -1) => void;
      onTouchDelta: (deltaY: number) => void;
    }) => {
      handlersRef.current = handlers;
    },
    [],
  );

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !webglSupported) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handlersRef.current?.onWheelDelta(e.deltaY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        handlersRef.current?.onKeyStep(-1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        handlersRef.current?.onKeyStep(1);
      }
    };

    let lastTouchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (lastTouchY !== null && y !== undefined) {
        handlersRef.current?.onTouchDelta(lastTouchY - y);
        lastTouchY = y;
      }
    };
    const onTouchEnd = () => {
      lastTouchY = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("keydown", onKeyDown);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [webglSupported]);

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      <Canvas camera={{ position: [0, 0, 0], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <GalleryScene
            images={images}
            speed={speed}
            zSpacing={zSpacing}
            visibleCount={visibleCount}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
            registerHandlers={registerHandlers}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
