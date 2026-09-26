/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F1226',
        paper: '#161A33',
        raised: '#1D2242',
        line: '#2A3060',
        text: '#ECE8DF',
        mute: '#8F95BC',
        signal: '#FFC857',
        accent: '#9D7BFF',
        coral: '#FF6B57',
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
