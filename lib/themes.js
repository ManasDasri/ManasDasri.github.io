// Colour themes. Each sets the full palette as CSS variables on :root; components use the
// tokens (Tailwind classes, and canvases through cssColor). Print is the default: black and
// white like the banner, with one colour. The VS Code-inspired themes use their published
// palettes, with the muted text lifted where needed so body copy stays readable (WCAG AA).
export const THEMES = {
  print: { name: 'Print · Red', ink: '#0A0A0A', paper: '#121212', raised: '#1C1C1C', line: '#2E2E2E', text: '#EEEEEA', mute: '#8E8E8C', signal: '#E8363E', mature: '#B0B0AC', old: '#5C5C5A', accent: '#CECECA' },
  'print-cyan': { name: 'Print · Cyan', ink: '#0A0A0A', paper: '#121212', raised: '#1C1C1C', line: '#2E2E2E', text: '#EEEEEA', mute: '#8E8E8C', signal: '#2ECEE0', mature: '#B0B0AC', old: '#5C5C5A', accent: '#CECECA' },
  koi: { name: 'Koi Pond', ink: '#070B14', paper: '#0C1322', raised: '#121B2E', line: '#1F2C46', text: '#ECE4D6', mute: '#97A0B3', signal: '#F07A4A', mature: '#4FA3A0', old: '#2C4F8A', accent: '#7EC8D6' },
  dracula: { name: 'Dracula', ink: '#1E1F29', paper: '#282A36', raised: '#343746', line: '#44475A', text: '#F8F8F2', mute: '#A4AED6', signal: '#BD93F9', mature: '#FF79C6', old: '#6272A4', accent: '#50FA7B' },
  'one-dark': { name: 'One Dark', ink: '#1E2127', paper: '#282C34', raised: '#2C313A', line: '#3E4451', text: '#DCDFE4', mute: '#9DA5B4', signal: '#61AFEF', mature: '#C678DD', old: '#4B6FA5', accent: '#E5C07B' },
  'tokyo-night': { name: 'Tokyo Night', ink: '#16161E', paper: '#1A1B26', raised: '#24283B', line: '#2F334D', text: '#C0CAF5', mute: '#9AA5CE', signal: '#7AA2F7', mature: '#BB9AF7', old: '#3D59A1', accent: '#FF9E64' },
  nord: { name: 'Nord', ink: '#242933', paper: '#2E3440', raised: '#3B4252', line: '#434C5E', text: '#ECEFF4', mute: '#A9B2C3', signal: '#88C0D0', mature: '#81A1C1', old: '#5E81AC', accent: '#EBCB8B' },
  gruvbox: { name: 'Gruvbox', ink: '#1D2021', paper: '#282828', raised: '#32302F', line: '#504945', text: '#EBDBB2', mute: '#A89984', signal: '#FABD2F', mature: '#FE8019', old: '#CC241D', accent: '#8EC07C' },
  catppuccin: { name: 'Catppuccin', ink: '#11111B', paper: '#1E1E2E', raised: '#313244', line: '#45475A', text: '#CDD6F4', mute: '#A6ADC8', signal: '#CBA6F7', mature: '#F5C2E7', old: '#89B4FA', accent: '#FAB387' },
  monokai: { name: 'Monokai', ink: '#1E1F1C', paper: '#272822', raised: '#3E3D32', line: '#49483E', text: '#F8F8F2', mute: '#A9A48C', signal: '#A6E22E', mature: '#66D9EF', old: '#AE81FF', accent: '#F92672' },
  synthwave: { name: "Synthwave '84", ink: '#1A1427', paper: '#262335', raised: '#2A2139', line: '#463465', text: '#F4EEFF', mute: '#B6A9D9', signal: '#36F9F6', mature: '#FF7EDB', old: '#7B5CC4', accent: '#FEDE5D' },
};
export const DEFAULT_THEME = 'print';
const TOKENS = ['ink', 'paper', 'raised', 'line', 'text', 'mute', 'signal', 'mature', 'old', 'accent'];

const triplet = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
const themeCSS = (key) => `:root{${TOKENS.map((k) => `--c-${k}:${triplet(THEMES[key][k])}`).join(';')}}`;

export function readTheme() {
  try {
    const t = localStorage.getItem('theme');
    return t in THEMES ? t : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

// The theme's CSS lives in a constructable stylesheet, outside the DOM, so React's hydration
// of <html> can't undo it. The head script makes it; this reuses it.
function applyTheme(key) {
  if (typeof CSSStyleSheet === 'undefined' || !document.adoptedStyleSheets) return;
  let sheet = window.__themeSheet;
  if (!sheet) {
    sheet = window.__themeSheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
  sheet.replaceSync(themeCSS(key));
}

// Switch theme: the new palette grows out of the centre of the screen as a circle (globals.css,
// html.theme-wipe); without view transitions, or with reduced motion, it just swaps. Canvases
// listen for 'theme-change' and pick up the new colours.
export function setTheme(key) {
  try {
    localStorage.setItem('theme', key);
  } catch {}
  const swap = () => {
    applyTheme(key);
    window.dispatchEvent(new Event('theme-change'));
  };
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
  const html = document.documentElement;
  html.classList.add('theme-wipe');
  document.startViewTransition(swap).finished.finally(() => html.classList.remove('theme-wipe'));
}

// A token's current colour as a CSS colour string, for canvases.
export function cssColor(token, alpha = 1) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim() || '0 0 0';
  return alpha === 1 ? `rgb(${v})` : `rgb(${v} / ${alpha})`;
}

// Head script: applies a saved theme before first paint, so there's no flash. Self-contained.
export const THEME_SCRIPT = `try{var T=${JSON.stringify(THEMES)},K=${JSON.stringify(TOKENS)},k=localStorage.getItem('theme');if(k in T&&k!=='${DEFAULT_THEME}'){var t=T[k],s=new CSSStyleSheet();s.replaceSync(':root{'+K.map(function(n){return '--c-'+n+':'+[1,3,5].map(function(i){return parseInt(t[n].slice(i,i+2),16)}).join(' ')}).join(';')+'}');window.__themeSheet=s;document.adoptedStyleSheets=document.adoptedStyleSheets.concat(s)}}catch(e){}`;
