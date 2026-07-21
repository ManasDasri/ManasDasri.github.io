'use client';

import { useEffect, useRef } from 'react';

/**
 * Renders an image as an animated grid of pixel blocks.
 * On mount, blocks reveal in a randomized stagger (like the "dissolving in"
 * effect on ashutoshx7.me). After the reveal finishes, a handful of blocks
 * keep gently flickering so the image never feels fully static.
 *
 * Usage:
 *   <PixelReveal src="/berserk-pfp.jpg" cols={28} className="w-full h-full" />
 *
 * Swap `src` for any image — your GitHub avatar, a project screenshot, etc.
 */
export default function PixelReveal({
  src,
  cols = 28,
  revealDurationMs = 1400,
  flickerAmount = 0.06,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let raf;
    let sampleCanvas;
    let sampleCtx;
    let rows = cols;
    let blockOrder = [];
    let flickerBlocks = [];
    let startTime = null;
    let destroyed = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      if (destroyed) return;

      rows = Math.round(cols * (img.naturalHeight / img.naturalWidth));

      // downsample the source image into a tiny cols x rows grid
      sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      sampleCtx = sampleCanvas.getContext('2d');
      sampleCtx.drawImage(img, 0, 0, cols, rows);

      const total = cols * rows;
      blockOrder = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
      flickerBlocks = new Set(
        Array.from({ length: Math.round(total * 0.12) }, () => Math.floor(Math.random() * total))
      );

      resize();
      window.addEventListener('resize', resize);
      raf = requestAnimationFrame(tick);
    };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    function tick(t) {
      if (destroyed) return;
      if (startTime === null) startTime = t;
      const elapsed = t - startTime;

      const { width, height } = canvas;
      const bw = width / cols;
      const bh = height / rows;
      const revealed = Math.min(
        blockOrder.length,
        Math.floor((elapsed / revealDurationMs) * blockOrder.length * 1.3)
      );
      const revealedSet = new Set(blockOrder.slice(0, revealed));

      ctx.clearRect(0, 0, width, height);

      const pixels = sampleCtx.getImageData(0, 0, cols, rows).data;

      for (let idx = 0; idx < cols * rows; idx++) {
        if (!revealedSet.has(idx)) continue;
        const x = idx % cols;
        const y = Math.floor(idx / cols);
        const p = idx * 4;
        const r = pixels[p];
        const g = pixels[p + 1];
        const b = pixels[p + 2];

        let alpha = 1;
        // gentle ambient flicker on a subset, only once fully revealed
        if (elapsed > revealDurationMs && flickerBlocks.has(idx)) {
          alpha = 1 - flickerAmount + Math.sin(elapsed / 400 + idx) * flickerAmount;
        } else if (!revealedSet.has(idx)) {
          alpha = 0;
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(Math.floor(x * bw), Math.floor(y * bh), Math.ceil(bw), Math.ceil(bh));
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [src, cols, revealDurationMs, flickerAmount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
