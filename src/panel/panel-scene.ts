/** Script 3D para login/register — Three.js com fallback WebGL (ver docs/DESIGN-SKILLS.md). */
export function panelSceneScript() {
  return `
(function(){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.getElementById("panel-scene-canvas");
  if (!canvas) return;

  var script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.min.js";
  script.onload = function(){
    var THREE = window.THREE;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, w/h, 0.1, 100);
    camera.position.z = 4.2;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var geo = new THREE.IcosahedronGeometry(1.15, 1);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xff2d55,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x220008,
      emissiveIntensity: 0.4
    });
    var mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.03, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = Math.PI / 2.2;
    scene.add(ring);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    var p1 = new THREE.PointLight(0xff2d55, 2.2, 12);
    p1.position.set(2, 2, 3);
    scene.add(p1);
    var p2 = new THREE.PointLight(0x00d4ff, 1.4, 12);
    p2.position.set(-2, -1, 2);
    scene.add(p2);

    var mx = 0, my = 0;
    document.addEventListener("mousemove", function(e){
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    var t0 = performance.now();
    function loop(now){
      var t = (now - t0) * 0.001;
      mesh.rotation.x = t * 0.35 + my;
      mesh.rotation.y = t * 0.5 + mx;
      ring.rotation.z = t * 0.2;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    window.addEventListener("resize", function(){
      w = canvas.clientWidth; h = canvas.clientHeight;
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  };
  document.head.appendChild(script);
})();
`.trim();
}
