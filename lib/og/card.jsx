import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { PATTERNS } from '@/lib/sigilPatterns';

// The share card for a project or post (1200×630), drawn at build time: the project's
// sigil (or a plain mark for posts), a kicker, the title, a subtitle, a meta line and the
// page's address, in the default theme's colours.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const C = { ink: '#041419', paper: '#0A222A', line: '#16404A', text: '#E6F4F1', mute: '#86A9AC', signal: '#7CF5E4', accent: '#FF7A6B' };
const font = (file) => readFileSync(join(process.cwd(), 'lib/og', file));
const FONTS = [
  { name: 'Bricolage', data: font('bricolage-grotesque-latin-800-normal.woff'), weight: 800 },
  { name: 'Mono', data: font('jetbrains-mono-latin-400-normal.woff'), weight: 400 },
  { name: 'Mono', data: font('jetbrains-mono-latin-700-normal.woff'), weight: 700 },
];

function Sigil({ pattern }) {
  const live = new Set((PATTERNS[pattern] ?? []).map(([x, y]) => `${x},${y}`));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', width: 136, height: 136, padding: 8, gap: 4, borderRadius: 14, background: C.ink, border: `2px solid ${C.line}` }}>
      {Array.from({ length: 36 }, (_, i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: live.has(`${i % 6},${(i / 6) | 0}`) ? C.signal : 'rgba(22,64,74,0.45)' }} />
      ))}
    </div>
  );
}

export function shareCard({ kicker, title, subtitle, meta, path, pattern, badge }) {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 72, background: C.ink, color: C.text, fontFamily: 'Mono' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {pattern && <Sigil pattern={pattern} />}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, color: C.signal }}>
              {kicker}
              {badge && <span style={{ fontSize: 20, color: C.accent, border: `2px solid ${C.accent}`, borderRadius: 8, padding: '2px 10px' }}>{badge}</span>}
            </div>
            <div style={{ fontFamily: 'Bricolage', fontWeight: 800, fontSize: title.length > 28 ? 64 : 92, letterSpacing: -3, lineHeight: 1, marginTop: 10 }}>{title}</div>
          </div>
        </div>
        {subtitle && <div style={{ fontSize: 34, color: C.text, marginTop: 40, lineHeight: 1.35, maxWidth: 1000 }}>{subtitle}</div>}
        <div style={{ display: 'flex', marginTop: 'auto', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 24, color: C.mute }}>
          <span>{meta}</span>
          <span style={{ color: C.signal }}>algorithmicbit.tech{path}</span>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: C.signal }} />
      </div>
    ),
    { ...size, fonts: FONTS }
  );
}
