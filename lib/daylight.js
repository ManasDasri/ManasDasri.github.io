// The site's palette: a hue rotation applied to the whole page. By default it
// follows the time in Bengaluru, interpolated through the day; visitors can
// also pin a fixed theme. 0° is the base teal palette.
export const STOPS = [
  // [IST hour, hue offset in degrees, phase name]
  [0, 40, 'night'],
  [5, 20, 'night'],
  [7, 0, 'dawn'],
  [12, -12, 'noon'],
  [16, 0, 'afternoon'],
  [18, 165, 'dusk'],
  [19.5, 110, 'twilight'],
  [21, 40, 'night'],
  [24, 40, 'night'],
];

// Fixed themes, as hue offsets; 'auto' follows the clock.
export const THEMES = { auto: null, bioluminescent: 0, ember: 165, midnight: 40 };
export const THEME_ORDER = ['auto', 'bioluminescent', 'ember', 'midnight'];

// Self-contained (no outside references) so it can also be inlined into the
// page head and run before first paint.
export function daylightAt(stops, date) {
  const parts = {};
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date)
    .forEach((p) => (parts[p.type] = p.value));
  const h = +parts.hour + +parts.minute / 60;
  const time = parts.hour + ':' + parts.minute;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (h >= a[0] && h < b[0]) {
      const t = (h - a[0]) / (b[0] - a[0]);
      const ease = t * t * (3 - 2 * t); // smoothstep: no sudden jumps at the stops
      return { hue: a[1] + (b[1] - a[1]) * ease, phase: a[2], time: time };
    }
  }
  return { hue: 40, phase: 'night', time: time };
}

export const daylight = (date = new Date()) => daylightAt(STOPS, date);

export function readTheme() {
  try {
    const t = localStorage.getItem('theme');
    return t in THEMES ? t : 'auto';
  } catch {
    return 'auto';
  }
}

// The hue to apply right now for a theme.
export const hueFor = (theme, date = new Date()) => THEMES[theme] ?? daylight(date).hue;

// Inline head script: sets --hue before first paint, so pages never fade in from
// the base palette. Written to a constructable stylesheet, which React's hydration
// of <html> can't undo; the Daylight component takes over after load.
export const PALETTE_SCRIPT = `try{var t=localStorage.getItem('theme');var f=${JSON.stringify(
  THEMES
)};var h=(t in f&&f[t]!=null)?f[t]:(${daylightAt.toString()})(${JSON.stringify(
  STOPS
)},new Date()).hue;var s=new CSSStyleSheet();s.replaceSync(':root{--hue:'+h+'deg}');document.adoptedStyleSheets=document.adoptedStyleSheets.concat(s)}catch(e){}`;
