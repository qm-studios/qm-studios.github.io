/* Animated starfield: three depth layers, twinkle, slow drift, the odd shooting star.
   Drawn in code. Respects prefers-reduced-motion (renders one still frame). */
(function () {
  const c = document.getElementById('stars');
  if (!c) return;
  const ctx = c.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, dpr, stars = [], shoot = null, last = 0;
  const TINTS = ['255,255,255', '255,255,255', '255,255,255', '180,240,255', '255,190,245', '200,190,255'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.width = Math.floor(innerWidth * dpr);
    H = c.height = Math.floor(innerHeight * dpr);
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
    const n = Math.min(520, Math.floor((innerWidth * innerHeight) / 3200));
    stars = [];
    for (let i = 0; i < n; i++) {
      const z = Math.random();
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: (z < 0.75 ? 0.5 : z < 0.95 ? 0.9 : 1.5) * dpr,
        v: (0.02 + z * 0.12) * dpr,
        a: 0.35 + Math.random() * 0.65,
        tw: Math.random() * Math.PI * 2, ts: 0.6 + Math.random() * 2.2,
        c: TINTS[(Math.random() * TINTS.length) | 0]
      });
    }
    if (still) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const sy = (window.scrollY || 0) * dpr;
    for (const s of stars) {
      if (!still) { s.x -= s.v; if (s.x < -2) s.x = W + 2; }
      const y = ((s.y - sy * s.v * 0.6) % H + H) % H;
      const a = still ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * 0.001 * s.ts + s.tw));
      ctx.fillStyle = `rgba(${s.c},${a})`;
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.283); ctx.fill();
      if (s.r > 1.2 * dpr) {
        ctx.fillStyle = `rgba(${s.c},${a * 0.15})`;
        ctx.beginPath(); ctx.arc(s.x, y, s.r * 4, 0, 6.283); ctx.fill();
      }
    }
    if (!still) {
      if (!shoot && Math.random() < 0.0025) {
        shoot = { x: Math.random() * W * 0.8 + W * 0.2, y: Math.random() * H * 0.4, l: 0 };
      }
      if (shoot) {
        shoot.l += 1;
        const len = 120 * dpr, p = shoot.l * 14 * dpr;
        const x = shoot.x - p, y = shoot.y + p * 0.45;
        const g = ctx.createLinearGradient(x, y, x + len, y - len * 0.45);
        g.addColorStop(0, 'rgba(180,240,255,0.9)'); g.addColorStop(1, 'rgba(180,240,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len * 0.45); ctx.stroke();
        if (shoot.l > 40) shoot = null;
      }
    }
  }

  function loop(t) {
    if (t - last > 30) { draw(t); last = t; }
    requestAnimationFrame(loop);
  }
  addEventListener('resize', resize);
  resize();
  if (!still) requestAnimationFrame(loop);
  else addEventListener('scroll', () => draw(0), { passive: true });
})();
