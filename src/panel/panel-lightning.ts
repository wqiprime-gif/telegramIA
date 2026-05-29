/** Raios sutis no login — leve para não travar a página. */
export function loginLightningScript() {
  return `
(function(){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canvas = document.getElementById("login-lightning-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var w, h, bolts = [], flash = 0, last = 0;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function branch(x, y, len, angle, depth){
    if (depth <= 0 || len < 6) return [{x:x,y:y}];
    var pts = [{x:x,y:y}];
    var segs = 3 + Math.floor(Math.random()*2);
    var cx = x, cy = y, a = angle;
    for (var i = 0; i < segs; i++){
      var step = len / segs;
      a += (Math.random()-0.5) * 0.35;
      cx += Math.cos(a) * step;
      cy += Math.sin(a) * step;
      pts.push({x:cx,y:cy});
    }
    return pts;
  }

  function spawnBolt(){
    if (bolts.length >= 2) return;
    var x = w * (0.2 + Math.random() * 0.6);
    var pts = branch(x, -20, h * (0.35 + Math.random()*0.25), Math.PI/2 + (Math.random()-0.5)*0.25, 4);
    bolts.push({ pts: pts, life: 1, width: 1.2 + Math.random()*0.8 });
    flash = 0.12 + Math.random() * 0.08;
  }

  function tick(ts){
    if (!last) last = ts;
    if (ts - last > 5500 + Math.random() * 2500){
      spawnBolt();
      last = ts;
    }
    requestAnimationFrame(tick);
  }
  setTimeout(spawnBolt, 1200);
  requestAnimationFrame(tick);

  function loop(){
    ctx.clearRect(0,0,w,h);
    if (flash > 0){
      ctx.fillStyle = "rgba(200,225,255," + (flash * 0.06) + ")";
      ctx.fillRect(0,0,w,h);
      flash *= 0.88;
    }
    for (var i = bolts.length-1; i >= 0; i--){
      var b = bolts[i];
      b.life -= 0.05;
      if (b.life <= 0){ bolts.splice(i,1); continue; }
      var alpha = b.life * 0.75;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(200,220,255," + alpha + ")";
      ctx.lineWidth = b.width * b.life;
      ctx.beginPath();
      for (var j = 0; j < b.pts.length; j++){
        if (j === 0) ctx.moveTo(b.pts[j].x, b.pts[j].y);
        else ctx.lineTo(b.pts[j].x, b.pts[j].y);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(10,92,255," + (alpha*0.45) + ")";
      ctx.lineWidth = (b.width * 0.4) * b.life;
      ctx.stroke();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
`.trim();
}
