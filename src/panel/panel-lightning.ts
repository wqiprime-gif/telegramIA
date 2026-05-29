/** Raios realistas no login — a cada 2s, múltiplos raios. */
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
    var segs = 5 + Math.floor(Math.random()*5);
    var cx = x, cy = y, a = angle;
    for (var i = 0; i < segs; i++){
      var step = len / segs;
      a += (Math.random()-0.5) * 1.2;
      cx += Math.cos(a) * step;
      cy += Math.sin(a) * step;
      pts.push({x:cx,y:cy});
      if (Math.random() < 0.42 && depth > 1){
        var sub = branch(cx, cy, len*0.5, a + (Math.random()>0.5?0.7:-0.7), depth-1);
        bolts.push({ pts: sub, life: 1, width: 1 + Math.random()*0.8 });
      }
    }
    return pts;
  }

  function spawnBolt(){
    var x = w * (0.08 + Math.random() * 0.84);
    var pts = branch(x, -30, h * (0.4 + Math.random()*0.45), Math.PI/2 + (Math.random()-0.5)*0.65, 6);
    bolts.push({ pts: pts, life: 1, width: 2 + Math.random()*2.2 });
    flash = 0.4 + Math.random() * 0.35;
    document.body.classList.add("thunder-flash");
    setTimeout(function(){ document.body.classList.remove("thunder-flash"); }, 60 + Math.random()*140);
  }

  function stormBurst(){
    var count = 2 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) setTimeout(spawnBolt, i * 80);
  }

  setInterval(stormBurst, 2000);
  setTimeout(stormBurst, 400);

  function loop(){
    ctx.clearRect(0,0,w,h);
    if (flash > 0){
      ctx.fillStyle = "rgba(200,225,255," + (flash * 0.18) + ")";
      ctx.fillRect(0,0,w,h);
      flash *= 0.82;
    }
    for (var i = bolts.length-1; i >= 0; i--){
      var b = bolts[i];
      b.life -= 0.035;
      if (b.life <= 0){ bolts.splice(i,1); continue; }
      var alpha = b.life * 0.95;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(140,200,255,0.95)";
      ctx.strokeStyle = "rgba(235,245,255," + alpha + ")";
      ctx.lineWidth = b.width * b.life;
      ctx.beginPath();
      for (var j = 0; j < b.pts.length; j++){
        if (j === 0) ctx.moveTo(b.pts[j].x, b.pts[j].y);
        else ctx.lineTo(b.pts[j].x, b.pts[j].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(10,92,255," + (alpha*0.7) + ")";
      ctx.lineWidth = (b.width * 0.45) * b.life;
      ctx.stroke();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
`.trim();
}
