// Live Bengaluru weather from Open-Meteo (free, no key, CORS-enabled).
// One request is shared by everything on the page and refreshed every 15 min.
const URL_ =
  'https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59' +
  '&current=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m&timezone=Asia%2FKolkata';
const TTL = 15 * 60 * 1000;

// WMO weather codes → plain words, plus whether it's raining / stormy
function describe(code) {
  if (code === 0) return { text: 'clear', rain: false, storm: false };
  if (code <= 3) return { text: code === 3 ? 'overcast' : 'partly cloudy', rain: false, storm: false };
  if (code <= 48) return { text: 'foggy', rain: false, storm: false };
  if (code <= 57) return { text: 'drizzle', rain: true, storm: false };
  if (code <= 67) return { text: 'rain', rain: true, storm: false };
  if (code <= 77) return { text: 'snow (in Bengaluru?!)', rain: false, storm: false };
  if (code <= 82) return { text: 'showers', rain: true, storm: false };
  return { text: 'thunderstorm', rain: true, storm: true };
}

let cache = null;

export function getWeather() {
  if (cache && Date.now() - cache.at < TTL) return cache.promise;
  const promise = fetch(URL_)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then(({ current: c }) => ({
      temp: c.temperature_2m,
      precip: c.precipitation,
      night: c.is_day === 0,
      wind: c.wind_speed_10m,
      ...describe(c.weather_code),
    }))
    .catch(() => {
      cache = null; // retry on the next call
      return null;
    });
  cache = { at: Date.now(), promise };
  return promise;
}
