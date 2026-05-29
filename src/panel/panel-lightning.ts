/** Raios realistas no login (canvas 2D). */
export function loginLightningScript() {
  return `
(function(){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.getElementById("login-lightning-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var w, h, bolts = [], flash = 0;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function branch(x, y, len, angle, depth){
    if (depth <= 0 || len < 4) return [{x:x,y:y}];
    var pts = [{x:x,y:y}];
    var segs = 4 + Math.floor(Math.random()*4);
    var cx = x, cy = y, a = angle;
    for (var i = 0; i < segs; i++){
      var step = len / segs;
      a += (Math.random()-0.5) * 1.1;
      cx += Math.cos(a) * step;
      cy += Math.sin(a) * step;
      pts.push({x:cx,y:cy});
      if (Math.random() < 0.35 && depth > 1){
        var sub = branch(cx, cy, len*0.45, a + (Math.random()>0.5?0.6:-0.6), depth-1);
        bolts.push({ pts: sub, life: 1, width: 1.2 });
      }
    }
    return pts;
  }

  function spawnBolt(){
    var x = w * (0.15 + Math.random() * 0.7);
    var pts = branch(x, -20, h * (0.35 + Math.random()*0.35), Math.PI/2 + (Math.random()-0.5)*0.5, 5);
    bolts.push({ pts: pts, life: 1, width: 1.8 + Math.random()*1.2 });
    flash = 0.35 + Math.random() * 0.25;
    document.body.classList.add("thunder-flash");
    setTimeout(function(){ document.body.classList.remove("thunder-flash"); }, 80 + Math.random()*120);
  }

  setInterval(function(){
    if (Math.random() < 0.55) spawnBolt();
  }, 2200 + Math.random()*2800);
  setTimeout(spawnBolt, 600);

  function loop(){
    ctx.clearRect(0,0,w,h);
    if (flash > 0){
      ctx.fillStyle = "rgba(180,210,255," + (flash * 0.12) + ")";
      ctx.fillRect(0,0,w,h);
      flash *= 0.86;
    }
    for (var i = bolts.length-1; i >= 0; i--){
      var b = bolts[i];
      b.life -= 0.04;
      if (b.life <= 0){ bolts.splice(i,1); continue; }
      var alpha = b.life * 0.9;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(120,180,255,0.9)";
      ctx.strokeStyle = "rgba(220,240,255," + alpha + ")";
      ctx.lineWidth = b.width * b.life;
      ctx.beginPath();
      for (var j = 0; j < b.pts.length; j++){
        if (j === 0) ctx.moveTo(b.pts[j].x, b.pts[j].y);
        else ctx.lineTo(b.pts[j].x, b.pts[j].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(10,92,255," + (alpha*0.6) + ")";
      ctx.lineWidth = (b.width * 0.4) * b.life;
      ctx.stroke();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
`.trim();
}
