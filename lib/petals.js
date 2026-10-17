// Falling petals, shared by the header scene and the page background. Each petal
// falls with a slow sideways sway, tumbles (its width shrinks as it turns edge-on)
// and is pushed away from the pointer.

export function makePetal(w, h, anywhere = true) {
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : -10,
    size: 3 + Math.random() * 4,
    vy: 0.25 + Math.random() * 0.45, // px per frame at 60fps
    vx: -0.2 - Math.random() * 0.4, // a light breeze to the left
    phase: Math.random() * Math.PI * 2,
    spin: 0.01 + Math.random() * 0.03,
    pushX: 0,
    pushY: 0,
  };
}

// dt in frames (1 = 1/60s); wind adds to the breeze; pointer is {x, y} or null
export function stepPetal(p, dt, w, h, wind = 0, pointer = null) {
  p.phase += p.spin * dt;
  if (pointer) {
    const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
    if (d2 < 120 * 120 && d2 > 1) {
      const f = (1 - Math.sqrt(d2) / 120) * 0.6;
      p.pushX += (dx / Math.sqrt(d2)) * f;
      p.pushY += (dy / Math.sqrt(d2)) * f;
    }
  }
  p.pushX *= 0.94;
  p.pushY *= 0.94;
  p.x += (p.vx + wind + Math.sin(p.phase) * 0.35 + p.pushX) * dt;
  p.y += (p.vy + p.pushY) * dt;
  if (p.y > h + 10 || p.x < -20 || p.x > w + 20) Object.assign(p, makePetal(w, h, false), { x: Math.random() * (w + 200) });
}

export function drawPetal(ctx, p, colour) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.phase * 0.7);
  ctx.scale(Math.abs(Math.cos(p.phase)) * 0.8 + 0.2, 1); // tumbling: edge-on, then face-on
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
