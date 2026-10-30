// The site's palette: a hue rotation applied to the whole page. By default it
// follows the time in Bengaluru, interpolated through the day; visitors can
// also pin a fixed theme. 0° is the base Koi Pond palette.
export const STOPS = [
  // [IST hour, hue offset in degrees, phase name]. Kept small so the Koi Pond palette stays
  // itself; the pond's own light changes more through the day (components/KoiPond.jsx).
  [0, 10, 'night'],
  [5, 8, 'night'],
  [7, 0, 'dawn'],
  [12, -6, 'noon'],
  [16, 0, 'afternoon'],
  [18, -22, 'dusk'],
  [19.5, -12, 'twilight'],
  [21, 10, 'night'],
  [24, 10, 'night'],
];

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
  return { hue: 10, phase: 'night', time: time };
}

export const daylight = (date = new Date()) => daylightAt(STOPS, date);
