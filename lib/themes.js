// One palette, the Koi Pond's night water (app/globals.css); what changes is the accent, the
// single colour on links, buttons, highlights and the scenes' signals. Koi orange by default.
// Each is bright enough for text on the dark background.
export const THEMES = {
  orange: { name: 'Koi orange', signal: '#F07A4A' },
  print: { name: 'Red', signal: '#E8363E' },
  cyan: { name: 'Cyan', signal: '#2ECEE0' },
  amber: { name: 'Amber', signal: '#F5B83D' },
  green: { name: 'Green', signal: '#4ADE80' },
  blue: { name: 'Blue', signal: '#6B9BFF' },
  violet: { name: 'Violet', signal: '#A78BFA' },
  pink: { name: 'Pink', signal: '#F472B6' },
};
export const DEFAULT_THEME = 'orange';
const TOKENS = ['signal'];

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

// Switch accent, in place: no transition, so nothing on the page is snapshotted or redrawn
// from scratch. Canvases listen for 'theme-change' and recolour what they're already drawing.
export function setTheme(key) {
  try {
    localStorage.setItem('theme', key);
  } catch {}
  applyTheme(key);
  window.dispatchEvent(new Event('theme-change'));
}

// A token's current colour as a CSS colour string, for canvases.
export function cssColor(token, alpha = 1) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim() || '0 0 0';
  return alpha === 1 ? `rgb(${v})` : `rgb(${v} / ${alpha})`;
}

// Head script: applies a saved theme before first paint, so there's no flash. Self-contained.
export const THEME_SCRIPT = `try{var T=${JSON.stringify(THEMES)},K=${JSON.stringify(TOKENS)},k=localStorage.getItem('theme');if(k in T&&k!=='${DEFAULT_THEME}'){var t=T[k],s=new CSSStyleSheet();s.replaceSync(':root{'+K.map(function(n){return '--c-'+n+':'+[1,3,5].map(function(i){return parseInt(t[n].slice(i,i+2),16)}).join(' ')}).join(';')+'}');window.__themeSheet=s;document.adoptedStyleSheets=document.adoptedStyleSheets.concat(s)}}catch(e){}`;
