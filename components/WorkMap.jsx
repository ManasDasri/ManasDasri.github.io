'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { projects, oss, byRank } from '@/lib/data';

// The hero: everything I've built or contributed to, joined to the tools it's made with.
// A small spring simulation lays it out, then stops; it only runs again while you drag.
// ponytail: O(n²) repulsion, fine for ~50 nodes; use a quadtree if the map grows past ~300.

const short = (repo) => repo.split('/')[1];

function buildGraph() {
  const nodes = [{ id: 'me', kind: 'me', label: 'Manas', line: 'Drag anything. Lines join each project to what it’s made with.' }];
  const links = [];
  const tools = new Map();
  const tool = (label) => {
    const id = `t:${label}`;
    if (!tools.has(id)) tools.set(id, { id, kind: 'tool', label, used: [] });
    return tools.get(id);
  };
  for (const p of [...projects].sort(byRank)) {
    const id = `p:${p.name}`;
    nodes.push({ id, kind: 'project', label: p.name, line: p.tagline ?? p.kind, href: p.slug ? `/projects/${p.slug}/` : p.link });
    links.push(['me', id]);
    for (const t of p.tags ?? []) {
      tool(t.label).used.push(p.name);
      links.push([id, `t:${t.label}`]);
    }
  }
  const seen = new Set();
  for (const c of oss) {
    const id = `o:${c.repo}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const n = oss.filter((o) => o.repo === c.repo).length;
    nodes.push({ id, kind: 'oss', label: short(c.repo), line: `${c.repo} · ${n > 1 ? `${n} pull requests` : c.what}`, href: '#open-source' });
    links.push(['me', id]);
    tool(c.lang).used.push(short(c.repo));
    links.push([id, `t:${c.lang}`]);
  }
  for (const t of tools.values()) nodes.push({ ...t, line: `${t.label}: used in ${t.used.join(', ')}` });
  return { nodes, links };
}

// seeded, so the first layout is the same on every visit
function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

const R = { me: 9, project: 6.5, oss: 5.5, tool: 3 };

export default function WorkMap() {
  const { nodes: base, links } = useMemo(buildGraph, []);
  const wrap = useRef(null);
  const sim = useRef(null);
  const [size, setSize] = useState(null);
  const [, setFrame] = useState(0);
  const [hover, setHover] = useState(null);

  const neighbours = useMemo(() => {
    const m = new Map(base.map((n) => [n.id, new Set([n.id])]));
    for (const [a, b] of links) {
      m.get(a).add(b);
      m.get(b).add(a);
    }
    return m;
  }, [base, links]);

  useEffect(() => {
    const el = wrap.current;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!size) return;
    const { w, h } = size;
    const rand = rng(7);
    const prev = sim.current?.nodes;
    // a radial start: built things and upstream repos on one ring, each tool beyond the
    // things that use it. The simulation then grows it out from the centre and tidies up.
    const ring = base.filter((n) => n.kind === 'project' || n.kind === 'oss');
    const angle = new Map(ring.map((n, i) => [n.id, (i / ring.length) * Math.PI * 2 - Math.PI / 2]));
    for (const n of base.filter((n) => n.kind === 'tool')) {
      const owners = links.filter(([a, b]) => b === n.id).map(([a]) => angle.get(a));
      const x = owners.reduce((t, a) => t + Math.cos(a), 0), y = owners.reduce((t, a) => t + Math.sin(a), 0);
      angle.set(n.id, Math.atan2(y, x) + (rand() - 0.5) * 0.3);
    }
    const startScale = prev || matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.12;
    const nodes = base.map((n, i) => {
      const old = prev?.[i];
      const a = angle.get(n.id) ?? 0;
      const r = (n.kind === 'me' ? 0 : n.kind === 'tool' ? 0.44 : 0.3) * startScale;
      return { ...n, x: old?.x ?? w / 2 + Math.cos(a) * r * w, y: old?.y ?? h / 2 + Math.sin(a) * r * h, vx: 0, vy: 0 };
    });
    const index = new Map(nodes.map((n, i) => [n.id, i]));
    const edges = links.map(([a, b]) => [nodes[index.get(a)], nodes[index.get(b)]]);
    const scale = Math.min(w, h) / 560;
    const ex = w < 600 ? 1.1 : 2.2; // how much wider than tall a node's personal space is
    const rest = { me: 205 * scale, other: 80 * scale };

    const step = () => {
      let energy = 0;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          // labels run to the right, so nodes push apart harder side to side
          let dx = (a.x - b.x) / ex, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy || 0.01;
          if (d2 > 14000) continue;
          const f = (420 * scale * scale) / d2;
          const d = Math.sqrt(d2);
          dx /= d; dy /= d;
          a.vx += dx * f; a.vy += dy * f;
          b.vx -= dx * f; b.vy -= dy * f;
        }
      }
      for (const [a, b] of edges) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const len = a.kind === 'me' ? rest.me : rest.other;
        const f = (d - len) * 0.02;
        a.vx += (dx / d) * f; a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
      }
      const pad = 24;
      for (const n of nodes) {
        // everything drifts gently toward the centre; I stay pinned to it
        const pull = n.kind === 'me' ? 0.05 : w < 600 ? 0.004 : 0.0015;
        if (!n.held) {
          n.vx += (w / 2 - n.x) * pull;
          n.vy += (h / 2 - n.y) * pull;
        }
        if (n.held) { n.vx = n.vy = 0; continue; }
        n.vx *= 0.82; n.vy *= 0.82;
        n.x = Math.min(w - pad - (w < 600 ? 40 : 70), Math.max(pad, n.x + n.vx));
        n.y = Math.min(h - pad, Math.max(pad, n.y + n.vy));
        energy += n.vx * n.vx + n.vy * n.vy;
      }
      return energy;
    };

    let raf = 0, ticks = 0;
    const run = () => {
      const e = step();
      ticks++;
      setFrame((f) => f + 1);
      if ((e > 0.05 || sim.current.dragging) && ticks < 1200) raf = requestAnimationFrame(run);
      else raf = 0;
    };
    const kick = () => {
      ticks = 0;
      if (!raf) raf = requestAnimationFrame(run);
    };
    sim.current = { nodes, index, edges, kick, dragging: false };

    if (prev || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = 0; i < 400; i++) step();
      setFrame((f) => f + 1);
    } else kick();
    return () => cancelAnimationFrame(raf);
  }, [size, base, links]);

  const s = sim.current;
  const lit = hover ? neighbours.get(hover) : null;

  const point = (e) => {
    const r = wrap.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (n) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const node = s.nodes[s.index.get(n.id)];
    node.held = true;
    node.start = { ...point(e), t: performance.now() };
    s.dragging = true;
    s.kick();
  };
  const onMove = (n) => (e) => {
    const node = s.nodes[s.index.get(n.id)];
    if (!node.held) return;
    const p = point(e);
    node.x = p.x; node.y = p.y;
    node.moved ||= Math.hypot(p.x - node.start.x, p.y - node.start.y) > 4;
  };
  const onUp = (n) => (e) => {
    const node = s.nodes[s.index.get(n.id)];
    const click = !node.moved;
    node.held = node.moved = false;
    s.dragging = false;
    s.kick();
    if (click && n.href && e.type === 'pointerup') {
      if (n.href.startsWith('#')) document.querySelector(n.href)?.scrollIntoView({ behavior: 'smooth' });
      else location.href = n.href;
    }
  };

  const caption = (hover && base.find((n) => n.id === hover)) || base[0];

  return (
    <figure className="map m-0">
      <div ref={wrap} className="map-field">
        {s && size && (
          <svg width={size.w} height={size.h} role="img" aria-label="A map of my projects and open-source work, joined to the languages and tools each uses">
            <g>
              {s.edges.map(([a, b], i) => {
                const on = lit && lit.has(a.id) && lit.has(b.id) && (a.id === hover || b.id === hover);
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`map-edge${on ? ' on' : lit ? ' dim' : ''}`} />;
              })}
            </g>
            {/* the hovered node is drawn last, so its label sits on top */}
            {[...s.nodes].sort((a, b) => (a.id === hover) - (b.id === hover)).map((n) => {
              const on = !lit || lit.has(n.id);
              // on narrow maps only my own projects keep their labels until something is hovered
              const quiet = n.kind === 'tool' || (n.kind === 'oss' && size.w < 600);
              const showLabel = !quiet || (lit && lit.has(n.id));
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  className={`map-node k-${n.kind}${on ? '' : ' dim'}${hover === n.id ? ' hot' : ''}`}
                  onPointerEnter={() => setHover(n.id)}
                  onPointerLeave={() => setHover((h) => (h === n.id ? null : h))}
                  onPointerDown={onDown(n)}
                  onPointerMove={onMove(n)}
                  onPointerUp={onUp(n)}
                  onPointerCancel={onUp(n)}
                >
                  <circle r={R[n.kind] + 10} className="map-hit" />
                  <circle r={R[n.kind]} className="map-dot" />
                  {showLabel && (
                    <text
                      // near the right edge the label goes on the left, so it isn't cut off
                      {...(n.x > size.w - 120 ? { x: -(R[n.kind] + 6), textAnchor: 'end' } : { x: R[n.kind] + 6 })}
                      y={4}
                      className="map-label"
                    >
                      {n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <figcaption className="map-caption" aria-live="polite">
        <span className="map-caption-name">{caption.kind === 'me' ? 'A map of my work' : caption.label}</span>
        <span className="map-caption-line">{caption.line}</span>
      </figcaption>
      <ul className="map-legend" aria-hidden="true">
        <li><span className="k-project" />things I built</li>
        <li><span className="k-oss" />projects I contribute to</li>
        <li><span className="k-tool" />languages and tools</li>
      </ul>
    </figure>
  );
}
