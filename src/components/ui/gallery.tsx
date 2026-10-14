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

export interface GalleryProps {
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
  /** Load textures sequentially so planes reveal one by one. Default true. */
  progressive?: boolean;
  /** Pause between each image load so the stagger reads clearly. Default 140ms. */
  staggerMs?: number;
  /** Fade/scale-in duration per image. Default 0.9s. */
  introDuration?: number;
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
      (normalized - fade.fadeIn.start) / (fade.fadeIn.end - fade.fadeIn.start);
    opacity = p;
  } else if (normalized < fade.fadeIn.start) {
    opacity = 0;
  } else if (
    normalized >= fade.fadeOut.start &&
    normalized <= fade.fadeOut.end
  ) {
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
  } else if (
    normalized >= blur.blurOut.start &&
    normalized <= blur.blurOut.end
  ) {
    const p =
      (normalized - blur.blurOut.start) /
      (blur.blurOut.end - blur.blurOut.start);
    value = blur.maxBlur * p;
  } else if (normalized > blur.blurOut.end) {
    value = blur.maxBlur;
  }
  return Math.max(0, Math.min(blur.maxBlur, value));
}

/**
 * Load image textures one by one (in order) instead of all at once.
 * Returns an array parallel to `srcs` with `null` for not-yet-loaded slots.
 * Each state update mounts one more plane, so the gallery fills in gradually.
 */
function useProgressiveTextures(
  srcs: string[],
  enabled: boolean,
  staggerMs: number,
) {
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(() =>
    srcs.map(() => null),
  );
  const key = srcs.join("|");

  useEffect(() => {
    const list = key.split("|").filter(Boolean);
    setTextures(list.map(() => null));
    if (!enabled || list.length === 0) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    // Cache-bust only in dev; in prod browser cache makes stagger invisible
    // without the deliberate pause below.
    const loadNext = async () => {
      for (let i = 0; i < list.length; i++) {
        if (cancelled) break;
        try {
          const tex = await loader.loadAsync(list[i]);
          if (cancelled) {
            tex.dispose();
            break;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          if (!cancelled) {
            setTextures((prev) => {
              if (prev[i]) return prev;
              const next = [...prev];
              next[i] = tex;
              return next;
            });
          }
        } catch {
          // Skip broken images, keep the sequence moving.
        }
        if (!cancelled && i < list.length - 1 && staggerMs > 0) {
          await new Promise((r) => setTimeout(r, staggerMs));
        }
      }
    };
    loadNext();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, staggerMs]);

  useEffect(() => {
    const current = textures;
    return () => {
      current.forEach((t) => t?.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return textures;
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
  progressive = true,
  staggerMs = 140,
  introDuration = 0.9,
}: Omit<GalleryProps, "className" | "style" | "falloff">) {
  const normalizedImages = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img,
      ),
    [images],
  );
  const srcs = useMemo(
    () => normalizedImages.map((img) => img.src),
    [normalizedImages],
  );
  const textures = useProgressiveTextures(srcs, progressive, staggerMs);

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
    materials.forEach((material, i) => {
      const planeImage = planesData.current[i]?.imageIndex ?? 0;
      const texture =
        textures.length > 0
          ? textures[planeImage % Math.max(textures.length, 1)]
          : null;
      if (material.uniforms && texture) {
        material.uniforms.map.value = texture;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textures]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  // When each plane slot first got a texture, for the staggered fade/scale-in.
  // -1 means not yet revealed.
  const revealAtRef = useRef<number[]>(
    Array.from({ length: visibleCount }, () => -1),
  );
  const lastImageIndexRef = useRef<number[]>(
    Array.from({ length: visibleCount }, () => -1),
  );
  useEffect(() => {
    revealAtRef.current = Array.from({ length: visibleCount }, (_, i) =>
      lastImageIndexRef.current[i] === (planesData.current[i]?.imageIndex ?? -1)
        ? (revealAtRef.current[i] ?? -1)
        : -1,
    );
    lastImageIndexRef.current = planesData.current.map((p) => p.imageIndex);
  }, [visibleCount, totalImages, depthRange]);
  const velocityRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    velocityRef.current += 0.3 * speedRef.current * dt;
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
        const candidate =
          (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
        // Don't swap to a texture that hasn't loaded yet, keeps the
        // one-by-one reveal clean instead of flashing empty planes.
        if (!progressive || textures[candidate]) {
          if (plane.imageIndex !== candidate) {
            plane.imageIndex = candidate;
            revealAtRef.current[i] = -1;
          }
        }
      }
      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        const candidate = ((step % totalImages) + totalImages) % totalImages;
        if (!progressive || textures[candidate]) {
          if (plane.imageIndex !== candidate) {
            plane.imageIndex = candidate;
            revealAtRef.current[i] = -1;
          }
        }
      }

      plane.z = ((newZ % depthRange) + depthRange) % depthRange;
      plane.x = spatialPositions[i]?.x ?? 0;
      plane.y = spatialPositions[i]?.y ?? 0;

      const worldZ = plane.z - depthRange / 2;
      const mesh = meshRefs.current[i];

      const texture = textures[plane.imageIndex] ?? null;
      const material = materials[i];

      // Staggered entrance: first frame with a texture stamps the start time,
      // then ease opacity + scale from 0 so each image grows in one by one.
      let intro = 1;
      if (progressive) {
        if (!texture) {
          intro = 0;
        } else {
          if (revealAtRef.current[i] == null || revealAtRef.current[i]! < 0) {
            revealAtRef.current[i] = time;
          }
          const t =
            (time - (revealAtRef.current[i] ?? time)) /
            Math.max(introDuration, 0.01);
          const clamped = Math.max(0, Math.min(1, t));
          intro = 1 - Math.pow(1 - clamped, 3);
        }
      }

      if (mesh) {
        mesh.position.set(plane.x, plane.y, worldZ);
        if (progressive) {
          const s = Math.max(intro, 0.0001);
          // Base scale is set from aspect on mount; scale relatively here.
          mesh.scale.setScalar(s);
          // Restore true aspect scale once fully revealed (handled below).
          const tex = texture;
          if (tex?.image && intro >= 1) {
            const img = tex.image as HTMLImageElement;
            if (img.width && img.height) {
              const aspect = img.width / img.height;
              if (aspect > 1) mesh.scale.set(2 * aspect, 2, 1);
              else mesh.scale.set(2, 2 / aspect, 1);
            }
          } else if (tex?.image) {
            const img = tex.image as HTMLImageElement;
            if (img.width && img.height) {
              const aspect = img.width / img.height;
              const bx = aspect > 1 ? 2 * aspect : 2;
              const by = aspect > 1 ? 2 : 2 / aspect;
              mesh.scale.set(bx * s, by * s, 1);
            }
          }
        }
      }

      if (material?.uniforms) {
        if (texture && material.uniforms.map.value !== texture) {
          material.uniforms.map.value = texture;
        }
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = velocityRef.current;
        const normalized = plane.z / depthRange;
        const baseOpacity = opacityForPosition(normalized, fadeSettings);
        material.uniforms.opacity.value = progressive
          ? baseOpacity * intro
          : baseOpacity;
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
        const texture = textures[plane.imageIndex] ?? null;
        const material = materials[i];
        if (progressive && !texture) return null;
        if (!material) return null;
        // Non-progressive path (or texture just swapped): fall back gracefully.
        const tex = texture ?? textures.find(Boolean) ?? null;
        if (!tex) return null;
        const aspect =
          tex.image &&
          (tex.image as HTMLImageElement).width &&
          (tex.image as HTMLImageElement).height
            ? (tex.image as HTMLImageElement).width /
              (tex.image as HTMLImageElement).height
            : 1;
        const fullScale: [number, number, number] =
          aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];
        // Start tiny when progressive so the useFrame intro can grow it
        // instead of flashing full-size for a frame.
        const initialScale: [number, number, number] = progressive
          ? [0.0001, 0.0001, 1]
          : fullScale;
        const worldZ = plane.z - depthRange / 2;
        return (
          <mesh
            key={plane.index}
            ref={(m) => {
              meshRefs.current[i] = m;
            }}
            position={[plane.x, plane.y, worldZ]}
            scale={initialScale}
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

export default function Gallery({
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
  progressive = true,
  staggerMs = 140,
  introDuration = 0.9,
}: GalleryProps) {
  const [webglSupported, setWebglSupported] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (!webglSupported) {
    return (
      <div className={className} style={style}>
        <FallbackGallery images={images} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <GalleryScene
            images={images}
            speed={speed}
            zSpacing={zSpacing}
            visibleCount={visibleCount}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
            progressive={progressive}
            staggerMs={staggerMs}
            introDuration={introDuration}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
