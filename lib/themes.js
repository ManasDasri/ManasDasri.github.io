// The palette lives as CSS variables on :root (app/globals.css). Canvases, which can't use
// classes, read a colour here.
export function cssColor(token, alpha = 1) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim() || '0 0 0';
  return alpha === 1 ? `rgb(${v})` : `rgb(${v} / ${alpha})`;
}
