/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#14171C',
        paper: '#1B1F26',
        raised: '#20242C',
        line: '#2A2F3A',
        text: '#E7E7E2',
        mute: '#8B93A1',
        signal: '#4FD1A5',
        accent: '#C792EA',
      },
      fontFamily: {
        display: ['"JetBrains Mono"', 'monospace'],
        body: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
