/** Cena 3D: partículas + raios azuis (Three.js). Ver docs/DESIGN-SKILLS.md */
export function panelSceneScript(mode: "auth" | "app" = "app") {
  const intensity = mode === "auth" ? "0.92" : "0.55";
  const particles = mode === "auth" ? 1800 : 900;
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
    var camera = new THREE.PerspectiveCamera(52, w/h, 0.1, 150);
    camera.position.set(0, 0, 9);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var blue = 0x0a5cff;
    var cyan = 0x00b4ff;
    var white = 0xaaccff;

    var group = new THREE.Group();
    scene.add(group);

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 2),
      new THREE.MeshPhysicalMaterial({
        color: blue, metalness: 0.95, roughness: 0.1,
        emissive: 0x0033aa, emissiveIntensity: 0.6,
        clearcoat: 1, transparent: true, opacity: 0.9
      })
    );
    group.add(core);

    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.025, 64, 120),
      new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    var rayCount = 12;
    var rayGroup = new THREE.Group();
    for (var r = 0; r < rayCount; r++) {
      var angle = (r / rayCount) * Math.PI * 2;
      var pts = new Float32Array([0, 0, 0, Math.cos(angle) * 14, Math.sin(angle) * 14, -2]);
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: blue, transparent: true, opacity: 0.12,
        blending: THREE.AdditiveBlending
      }));
      rayGroup.add(line);
    }
    scene.add(rayGroup);

    var pCount = ${particles};
    var positions = new Float32Array(pCount * 3);
    var sizes = new Float32Array(pCount);
    for (var i = 0; i < pCount; i++) {
      positions[i*3] = (Math.random() - 0.5) * 28;
      positions[i*3+1] = (Math.random() - 0.5) * 18;
      positions[i*3+2] = (Math.random() - 0.5) * 14;
      sizes[i] = Math.random() * 0.04 + 0.01;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particlesMesh = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.04, color: white, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    scene.add(particlesMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    var l1 = new THREE.PointLight(blue, 2.5, 40); l1.position.set(5, 4, 8); scene.add(l1);
    var l2 = new THREE.PointLight(cyan, 1.8, 35); l2.position.set(-6, -3, 5); scene.add(l2);

    var mx = 0, my = 0;
    document.addEventListener("mousemove", function(e){
      mx = (e.clientX / w - 0.5) * 1.0;
      my = (e.clientY / h - 0.5) * 0.6;
    });

    var t0 = performance.now();
    function loop(now){
      var t = (now - t0) * 0.001;
      group.rotation.x = t * 0.1 + my * 0.25;
      group.rotation.y = t * 0.14 + mx * 0.35;
      rayGroup.rotation.z = t * 0.03;
      particlesMesh.rotation.y = t * 0.04;
      camera.position.x = mx * 0.6;
      camera.position.y = -my * 0.4;
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
