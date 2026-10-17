'use client';

import { useEffect, useRef } from 'react';
import { cssColor } from '@/lib/themes';
import { makePetal, stepPetal, drawPetal } from '@/lib/petals';

// The page background: the header's night carried down the page. Stars sit at three
// depths and drift with the scroll at different speeds. Moving the pointer draws a
// constellation: nearby stars link to it and to each other. Now and then a shooting
// star crosses, and a few petals from the header keep falling, gusting when you
// scroll fast. Dimmed behind the text column (globals.css, .night-sky).
const DEPTHS = [0.04, 0.1, 0.2]; // how far each layer moves per px scrolled
const REACH = 150; // px around the pointer that a constellation forms in
const PETALS = 16;

export default function NightSky() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, c = {}, stars = [], petals = [], meteor = null, nextMeteor = 4000;
    let pointer = null, raf = 0, last = 0, lastScroll = window.scrollY, gust = 0;

    const colours = () =>
      (c = { star: cssColor('text'), line: cssColor('signal', 0.35), meteor: cssColor('signal'), petal: cssColor('text', 0.7) });

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // stars live on a tall strip that wraps, so scrolling never runs out of sky
      stars = Array.from({ length: Math.round((w * h) / 2200) }, () => {
        const d = (Math.random() * 3) | 0;
        return { x: Math.random() * w, y: Math.random() * h, d, r: 0.4 + d * 0.45 + Math.random() * 0.5, tw: Math.random() * 6 };
      });
      if (!petals.length) petals = Array.from({ length: PETALS }, () => makePetal(w, h));
    }

    // a star's place on screen right now
    const at = (s) => [s.x, (((s.y - window.scrollY * DEPTHS[s.d]) % h) + h) % h];

    function draw(t, dt) {
      ctx.clearRect(0, 0, w, h);
      const near = [];
      for (const s of stars) {
        const [x, y] = at(s);
        ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t / 1600 + s.tw));
        ctx.fillStyle = c.star;
        ctx.fillRect(x, y, s.r, s.r);
        if (pointer && Math.hypot(x - pointer.x, y - pointer.y) < REACH) near.push([x, y]);
      }
      // the constellation: each nearby star links to the pointer and to its nearest neighbour
      if (near.length) {
        ctx.strokeStyle = c.line;
        ctx.lineWidth = 0.8;
        for (const [x, y] of near) {
          const fade = 1 - Math.hypot(x - pointer.x, y - pointer.y) / REACH;
          ctx.globalAlpha = fade;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(x, y);
          let best = null, bd = Infinity;
          for (const [ox, oy] of near) {
            const d = Math.hypot(ox - x, oy - y);
            if (d > 0 && d < bd) (bd = d), (best = [ox, oy]);
          }
          if (best) {
            ctx.moveTo(x, y);
            ctx.lineTo(best[0], best[1]);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      if (meteor) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life -= dt;
        const tail = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 14, meteor.y - meteor.vy * 14);
        tail.addColorStop(0, c.meteor);
        tail.addColorStop(1, 'transparent');
        ctx.strokeStyle = tail;
        ctx.globalAlpha = Math.min(1, meteor.life / 20);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * 14, meteor.y - meteor.vy * 14);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (meteor.life <= 0) meteor = null;
      }
      for (const p of petals) {
        if (!reduce) stepPetal(p, dt, w, h, -gust, pointer);
        drawPetal(ctx, p, c.petal);
      }
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return (last = t);
      const dt = Math.min((t - (last || t)) / 16.7, 3);
      last = t;
      // scrolling fast gusts the petals sideways
      const y = window.scrollY;
      gust = gust * 0.95 + Math.min(Math.abs(y - lastScroll) / 40, 3) * 0.05;
      lastScroll = y;
      nextMeteor -= dt * 16.7;
      if (nextMeteor <= 0 && !meteor) {
        // from the top edge, angled down and across
        const right = Math.random() < 0.5;
        meteor = { x: right ? w * (0.6 + Math.random() * 0.4) : Math.random() * w * 0.4, y: Math.random() * h * 0.3, vx: (right ? -1 : 1) * (7 + Math.random() * 4), vy: 3 + Math.random() * 2, life: 45 };
        nextMeteor = 6000 + Math.random() * 9000;
      }
      draw(t, dt);
    }

    const onMove = (e) => (pointer = e.pointerType === 'touch' ? null : { x: e.clientX, y: e.clientY });
    const onLeave = () => (pointer = null);
    const onTheme = () => colours();

    colours();
    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('theme-change', onTheme);
    if (reduce) {
      draw(0, 0);
      const still = () => draw(0, 0);
      window.addEventListener('scroll', still, { passive: true });
      return () => {
        window.removeEventListener('resize', layout);
        window.removeEventListener('theme-change', onTheme);
        window.removeEventListener('scroll', still);
      };
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      window.removeEventListener('theme-change', onTheme);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="night-sky" aria-hidden="true" />;
}
