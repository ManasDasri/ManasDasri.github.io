import { STOPS, daylightAt } from './daylight.js';
// Site colour themes. Each sets the full palette; components use the tokens
// (Tailwind classes via CSS variables, canvases via cssColor). The 'auto' theme
// is Bioluminescent with its hue drifting through the day (lib/daylight.js).
// The VS Code-inspired themes use their published palettes, with the muted
// text colour lifted where needed so body copy stays readable (WCAG AA).
export const THEMES = {
  bioluminescent: { name: 'Bioluminescent', ink: '#041419', paper: '#0A222A', raised: '#0F2C35', line: '#16404A', text: '#E6F4F1', mute: '#86A9AC', signal: '#7CF5E4', mature: '#2BB3B1', old: '#1F5F8B', accent: '#FF7A6B' },
  dracula: { name: 'Dracula', ink: '#1E1F29', paper: '#282A36', raised: '#343746', line: '#44475A', text: '#F8F8F2', mute: '#A4AED6', signal: '#BD93F9', mature: '#FF79C6', old: '#6272A4', accent: '#50FA7B' },
  'one-dark': { name: 'One Dark', ink: '#1E2127', paper: '#282C34', raised: '#2C313A', line: '#3E4451', text: '#DCDFE4', mute: '#9DA5B4', signal: '#61AFEF', mature: '#C678DD', old: '#4B6FA5', accent: '#E5C07B' },
  'tokyo-night': { name: 'Tokyo Night', ink: '#16161E', paper: '#1A1B26', raised: '#24283B', line: '#2F334D', text: '#C0CAF5', mute: '#9AA5CE', signal: '#7AA2F7', mature: '#BB9AF7', old: '#3D59A1', accent: '#FF9E64' },
  nord: { name: 'Nord', ink: '#242933', paper: '#2E3440', raised: '#3B4252', line: '#434C5E', text: '#ECEFF4', mute: '#A9B2C3', signal: '#88C0D0', mature: '#81A1C1', old: '#5E81AC', accent: '#EBCB8B' },
  gruvbox: { name: 'Gruvbox', ink: '#1D2021', paper: '#282828', raised: '#32302F', line: '#504945', text: '#EBDBB2', mute: '#A89984', signal: '#FABD2F', mature: '#FE8019', old: '#CC241D', accent: '#8EC07C' },
  catppuccin: { name: 'Catppuccin', ink: '#11111B', paper: '#1E1E2E', raised: '#313244', line: '#45475A', text: '#CDD6F4', mute: '#A6ADC8', signal: '#CBA6F7', mature: '#F5C2E7', old: '#89B4FA', accent: '#FAB387' },
  monokai: { name: 'Monokai', ink: '#1E1F1C', paper: '#272822', raised: '#3E3D32', line: '#49483E', text: '#F8F8F2', mute: '#A9A48C', signal: '#A6E22E', mature: '#66D9EF', old: '#AE81FF', accent: '#F92672' },
  synthwave: { name: "Synthwave '84", ink: '#1A1427', paper: '#262335', raised: '#2A2139', line: '#463465', text: '#F4EEFF', mute: '#B6A9D9', signal: '#36F9F6', mature: '#FF7EDB', old: '#7B5CC4', accent: '#FEDE5D' },
};

export const THEME_ORDER = ['auto', ...Object.keys(THEMES)];
export const TOKENS = ['ink', 'paper', 'raised', 'line', 'text', 'mute', 'signal', 'mature', 'old', 'accent'];

// ---- runtime -------------------------------------------------------------


const triplet = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

// The CSS for a theme: colour tokens as "R G B" triplets (so Tailwind can add
// alpha) plus the hue rotation ('auto' drifts with the clock; others are 0).
export function themeCSS(key, date = new Date()) {
  const auto = !(key in THEMES);
  const t = THEMES[auto ? 'bioluminescent' : key];
  const hue = auto ? daylightAt(STOPS, date).hue : 0;
  return `:root{${TOKENS.map((k) => `--c-${k}:${triplet(t[k])}`).join(';')};--hue:${hue.toFixed(1)}deg}`;
}

export function readTheme() {
  try {
    const t = localStorage.getItem('theme');
    return THEME_ORDER.includes(t) ? t : 'auto';
  } catch {
    return 'auto';
  }
}

// Theme CSS lives in a constructable stylesheet: outside the DOM, so React's
// hydration of <html> can't undo it. The head script creates it; this reuses it.
export function applyTheme(key = readTheme()) {
  if (typeof CSSStyleSheet === 'undefined' || !document.adoptedStyleSheets) return;
  let sheet = window.__themeSheet;
  if (!sheet) {
    sheet = window.__themeSheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
  sheet.replaceSync(themeCSS(key));
}

// A token's current colour as a CSS colour string, for canvases.
export function cssColor(token, alpha = 1) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim() || '0 0 0';
  return alpha === 1 ? `rgb(${v})` : `rgb(${v} / ${alpha})`;
}

// Head script: applies the saved theme before first paint. Self-contained.
export const THEME_SCRIPT = `try{var T=${JSON.stringify(THEMES)},S=${JSON.stringify(STOPS)},K=${JSON.stringify(
  TOKENS
)};var k=localStorage.getItem('theme');var auto=!(k in T);var t=T[auto?'bioluminescent':k];var h=auto?(${daylightAt.toString()})(S,new Date()).hue:0;var css=':root{'+K.map(function(n){var x=t[n];return '--c-'+n+':'+[1,3,5].map(function(i){return parseInt(x.slice(i,i+2),16)}).join(' ')}).join(';')+';--hue:'+h.toFixed(1)+'deg}';var s=new CSSStyleSheet();s.replaceSync(css);window.__themeSheet=s;document.adoptedStyleSheets=document.adoptedStyleSheets.concat(s)}catch(e){}`;
