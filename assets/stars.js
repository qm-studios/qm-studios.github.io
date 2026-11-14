/* Starfield drawn in code. Configure per page on the canvas:
   data-tints="r,g,b|r,g,b"  data-density (px² per star)  data-speed  data-sparkle="1" (four-point sparkles)
   data-shooting="1". Respects prefers-reduced-motion (one still frame). */
(function () {
  const c = document.getElementById('stars');
  if (!c) return;
  const ctx = c.getContext('2d');
  const d = c.dataset;
  const tints = (d.tints || '255,255,255').split('|');
  const density = +d.density || 3200, speed = +(d.speed || 1), sparkle = d.sparkle === '1', shooting = d.shooting === '1';
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, dpr, stars = [], shoot = null, last = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.width = Math.floor(innerWidth * dpr); H = c.height = Math.floor(innerHeight * dpr);
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    const n = Math.min(500, Math.floor(innerWidth * innerHeight / density));
    stars = [];
    for (let i = 0; i < n; i++) {
      const z = Math.random();
      stars.push({ x: Math.random() * W, y: Math.random() * H,
        r: (z < .75 ? .55 : z < .95 ? .95 : 1.5) * dpr, v: (.015 + z * .08) * dpr * speed,
        a: .3 + Math.random() * .7, tw: Math.random() * 6.28, ts: .5 + Math.random() * 2,
        c: tints[(Math.random() * tints.length) | 0], sp: sparkle && z > .965 });
    }
    if (still) draw(0);
  }
  function star4(x, y, r, col) {
    ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const sy = (window.scrollY || 0) * dpr;
    for (const s of stars) {
      if (!still) { s.x -= s.v; if (s.x < -4) s.x = W + 4; }
      const y = ((s.y - sy * s.v * .8) % H + H) % H;
      const a = still ? s.a : s.a * (.55 + .45 * Math.sin(t * .001 * s.ts + s.tw));
      if (s.sp) star4(s.x, y, 5 * dpr * (.6 + .4 * a), `rgba(${s.c},${a})`);
      else { ctx.fillStyle = `rgba(${s.c},${a})`; ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.283); ctx.fill(); }
    }
    if (!still && shooting) {
      if (!shoot && Math.random() < .002) shoot = { x: W * (.3 + Math.random() * .7), y: H * Math.random() * .4, l: 0 };
      if (shoot) {
        shoot.l++; const len = 110 * dpr, p = shoot.l * 13 * dpr, x = shoot.x - p, y = shoot.y + p * .45;
        const g = ctx.createLinearGradient(x, y, x + len, y - len * .45);
        g.addColorStop(0, `rgba(${tints[0]},.9)`); g.addColorStop(1, `rgba(${tints[0]},0)`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len * .45); ctx.stroke();
        if (shoot.l > 40) shoot = null;
      }
    }
  }
  function loop(t) { if (t - last > 30) { draw(t); last = t; } requestAnimationFrame(loop); }
  addEventListener('resize', resize); resize();
  if (!still) requestAnimationFrame(loop); else addEventListener('scroll', () => draw(0), { passive: true });
})();
