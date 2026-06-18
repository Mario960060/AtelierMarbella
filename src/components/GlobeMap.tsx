import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type GlobeMarker = { name: string; lat: number; lon: number };

const AZURE = 0x2a93b8;
const OCEAN_FALLBACK = 0x1d4e66;

// NASA Blue Marble satellite imagery + elevation + water mask (three-globe assets)
const MAP_URL = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const BUMP_URL = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
const WATER_URL = 'https://unpkg.com/three-globe/example/img/earth-water.png';

// Western Europe: between the UK and the Costa del Sol
const FOCUS_LAT = 45;
const FOCUS_LON = -2;

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Realistic satellite-textured globe zoomed in on Western Europe
 * (UK, Mallorca, Costa del Sol), with sun lighting, atmosphere glow,
 * azure marker spikes and HTML labels. Gently breathing, draggable
 * within a clamped range so the region stays in frame.
 */
export default function GlobeMap({ markers }: { markers: GlobeMarker[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 1.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';
    host.appendChild(renderer.domElement);

    // Sun + sky fill
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff3dd, 2.4);
    sun.position.set(-2, 1.5, 2.5);
    scene.add(sun);

    const globe = new THREE.Group();
    scene.add(globe);

    // Earth body: ocean-blue until the satellite textures stream in
    const earthMat = new THREE.MeshPhongMaterial({
      color: OCEAN_FALLBACK,
      specular: new THREE.Color(0x2b4a5a),
      shininess: 14,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat));

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    let disposed = false;
    const textures: THREE.Texture[] = [];

    loader.load(MAP_URL, (tex) => {
      if (disposed) return tex.dispose();
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      textures.push(tex);
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    });
    loader.load(BUMP_URL, (tex) => {
      if (disposed) return tex.dispose();
      tex.anisotropy = maxAniso;
      textures.push(tex);
      earthMat.bumpMap = tex;
      earthMat.bumpScale = 0.6;
      earthMat.needsUpdate = true;
    });
    loader.load(WATER_URL, (tex) => {
      if (disposed) return tex.dispose();
      textures.push(tex);
      earthMat.specularMap = tex;
      earthMat.needsUpdate = true;
    });

    // Atmosphere: fresnel rim glow on a back-facing shell
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.09, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            gl_FragColor = vec4(0.45, 0.72, 0.92, 1.0) * intensity;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      })
    );
    scene.add(atmosphere);

    // Markers: white-haloed azure dot on the surface + spike to the label anchor
    const tipLocal: THREE.Vector3[] = [];
    markers.forEach((m) => {
      const surface = latLonToVec3(m.lat, m.lon, 1.002);
      const tip = latLonToVec3(m.lat, m.lon, 1.14);
      tipLocal.push(tip);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      halo.position.copy(surface);
      globe.add(halo);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.009, 16, 16),
        new THREE.MeshBasicMaterial({ color: AZURE })
      );
      dot.position.copy(latLonToVec3(m.lat, m.lon, 1.006));
      globe.add(dot);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([surface, tip]);
      globe.add(
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        )
      );

      const tipDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.006, 12, 12),
        new THREE.MeshBasicMaterial({ color: AZURE })
      );
      tipDot.position.copy(tip);
      globe.add(tipDot);
    });

    // Face Western Europe so the three markers fill the frame
    const baseQuat = new THREE.Quaternion().setFromUnitVectors(
      latLonToVec3(FOCUS_LAT, FOCUS_LON, 1).normalize(),
      new THREE.Vector3(0, 0, 1)
    );

    let dragX = 0;
    let dragY = 0;
    let targetDragX = 0;
    let targetDragY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastInteraction = 0;

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetDragX = Math.max(-0.7, Math.min(0.7, targetDragX + (e.clientX - lastX) * 0.0035));
      targetDragY = Math.max(-0.35, Math.min(0.35, targetDragY + (e.clientY - lastY) * 0.0025));
      lastX = e.clientX;
      lastY = e.clientY;
      lastInteraction = performance.now();
    };
    const onUp = () => {
      dragging = false;
      el.style.cursor = 'grab';
      targetDragX = 0;
      targetDragY = 0;
      lastInteraction = performance.now();
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const oscAxis = new THREE.Vector3(0, 1, 0);
    const xAxis = new THREE.Vector3(1, 0, 0);
    const work = new THREE.Vector3();
    const qy = new THREE.Quaternion();
    const qx = new THREE.Quaternion();

    let raf = 0;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);

      dragX += (targetDragX - dragX) * 0.06;
      dragY += (targetDragY - dragY) * 0.06;

      const idle = !dragging && time - lastInteraction > 2500 && !reduce;
      const osc = idle ? Math.sin(time * 0.00035) * 0.035 : 0;

      qy.setFromAxisAngle(oscAxis, dragX + osc);
      qx.setFromAxisAngle(xAxis, dragY);
      globe.quaternion.copy(qx).multiply(qy).multiply(baseQuat);

      renderer.render(scene, camera);

      const w = host.clientWidth;
      const h = host.clientHeight;
      tipLocal.forEach((tip, i) => {
        const label = labelRefs.current[i];
        if (!label) return;
        work.copy(tip).applyQuaternion(globe.quaternion);
        const facing = work.z > 0.6;
        work.project(camera);
        const x = (work.x * 0.5 + 0.5) * w;
        const y = (1 - (work.y * 0.5 + 0.5)) * h;
        label.style.transform = `translate(${x}px, ${y}px)`;
        label.style.opacity = facing ? '1' : '0';
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const material = obj.material as THREE.Material;
          material.dispose();
        }
      });
      textures.forEach((tex) => tex.dispose());
      renderer.dispose();
      host.removeChild(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[420px] w-full md:h-[560px]">
      <div ref={hostRef} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
      {markers.map((m, i) => (
        <div
          key={m.name}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="pointer-events-none absolute left-0 top-0 transition-opacity duration-300"
        >
          <span className="ml-2 inline-block -translate-y-1/2 whitespace-nowrap bg-limestone/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
            {m.name}
          </span>
        </div>
      ))}
    </div>
  );
}
