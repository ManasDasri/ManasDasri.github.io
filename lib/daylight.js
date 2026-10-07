// The site's palette follows the time in Bengaluru: a hue rotation applied to
// the whole page, interpolated through the day. 0° is the base teal palette.
const STOPS = [
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

export function daylight(date = new Date()) {
  // read the IST wall-clock time without re-parsing a formatted string (not portable)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  const h = +parts.hour + +parts.minute / 60;
  const time = `${parts.hour}:${parts.minute}`;
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [h0, d0, name0] = STOPS[i], [h1, d1] = STOPS[i + 1];
    if (h >= h0 && h < h1) {
      const t = (h - h0) / (h1 - h0);
      const ease = t * t * (3 - 2 * t); // smoothstep: no sudden jumps at the stops
      return { hue: d0 + (d1 - d0) * ease, phase: name0, time };
    }
  }
  return { hue: 40, phase: 'night', time };
}
