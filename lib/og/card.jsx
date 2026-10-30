import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// The share card for a project or post (1200×630), drawn at build time: a kicker, the
// title in the display serif, a subtitle, a meta line and the page's address, in the
// Koi Pond palette.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const C = { ink: '#070B14', paper: '#0C1322', line: '#1F2C46', text: '#ECE4D6', mute: '#97A0B3', signal: '#F07A4A', accent: '#7EC8D6' };
const font = (file) => readFileSync(join(process.cwd(), 'lib/og', file));
const FONTS = [
  { name: 'Serif', data: font('instrument-serif-latin-400-normal.woff'), weight: 400 },
  { name: 'Mono', data: font('jetbrains-mono-latin-400-normal.woff'), weight: 400 },
  { name: 'Mono', data: font('jetbrains-mono-latin-700-normal.woff'), weight: 700 },
];

export function shareCard({ kicker, title, subtitle, meta, path, badge }) {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 72, background: C.ink, color: C.text, fontFamily: 'Mono' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 24, color: C.signal }}>
              {kicker}
              {badge && <span style={{ fontSize: 20, color: C.accent, border: `2px solid ${C.accent}`, borderRadius: 8, padding: '2px 10px' }}>{badge}</span>}
            </div>
            <div style={{ fontFamily: 'Serif', fontSize: title.length > 28 ? 76 : 112, lineHeight: 1, marginTop: 14 }}>{title}</div>
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
