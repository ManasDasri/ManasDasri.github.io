/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#041419',
        paper: '#0A222A',
        raised: '#0F2C35',
        line: '#16404A',
        text: '#E6F4F1',
        mute: '#86A9AC',
        signal: '#7CF5E4',
        accent: '#FF7A6B', // coral: tags and secondary highlights
        // cell age ramp: born (signal) → mature → old
        mature: '#2BB3B1',
        old: '#1F5F8B',
      },
      fontFamily: {
        head: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        display: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
