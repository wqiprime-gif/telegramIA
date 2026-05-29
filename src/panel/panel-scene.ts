/** Cena 3D full-screen — partículas + formas (Three.js). Ver docs/DESIGN-SKILLS.md */
export function panelSceneScript(mode: "auth" | "app" = "app") {
  const intensity = mode === "auth" ? "1" : "0.65";
  return `
(function(){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.getElementById("panel-scene-canvas");
  if (!canvas) return;
  canvas.style.opacity = "${intensity}";

  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js";
  s.onload = function(){
    var THREE = window.THREE;
    var w = window.innerWidth, h = window.innerHeight;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, w/h, 0.1, 120);
    camera.position.set(0, 0, 8);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var group = new THREE.Group();
    scene.add(group);

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0xff2d55, metalness: 0.9, roughness: 0.15,
        emissive: 0xff0044, emissiveIntensity: 0.55,
        clearcoat: 1, clearcoatRoughness: 0.1
      })
    );
    group.add(core);

    var ring1 = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.1, 0.04, 120, 16),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.7 })
    );
    group.add(ring1);

    var ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.02, 64, 100),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.45 })
    );
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);

    var pCount = ${mode === "auth" ? 1200 : 600};
    var positions = new Float32Array(pCount * 3);
    for (var i = 0; i < pCount; i++) {
      positions[i*3] = (Math.random() - 0.5) * 24;
      positions[i*3+1] = (Math.random() - 0.5) * 16;
      positions[i*3+2] = (Math.random() - 0.5) * 12;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.035, color: 0xff6b8a, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    var l1 = new THREE.PointLight(0xff2d55, 3, 30); l1.position.set(4, 3, 6); scene.add(l1);
    var l2 = new THREE.PointLight(0x00d4ff, 2.2, 30); l2.position.set(-5, -2, 4); scene.add(l2);
    var l3 = new THREE.PointLight(0xa855f7, 1.5, 25); l3.position.set(0, 4, -3); scene.add(l3);

    var mx = 0, my = 0;
    document.addEventListener("mousemove", function(e){
      mx = (e.clientX / w - 0.5) * 1.2;
      my = (e.clientY / h - 0.5) * 0.8;
    });

    var t0 = performance.now();
    function loop(now){
      var t = (now - t0) * 0.001;
      group.rotation.x = t * 0.12 + my * 0.3;
      group.rotation.y = t * 0.18 + mx * 0.4;
      ring1.rotation.x = t * 0.4;
      ring1.rotation.z = t * 0.25;
      ring2.rotation.z = -t * 0.15;
      particles.rotation.y = t * 0.05;
      camera.position.x = mx * 0.8;
      camera.position.y = -my * 0.5;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    loop(performance.now());

    window.addEventListener("resize", function(){
      w = window.innerWidth; h = window.innerHeight;
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  };
  document.head.appendChild(s);
})();
`.trim();
}
