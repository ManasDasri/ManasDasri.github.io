/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // every colour comes from the active theme (lib/themes.js) via CSS variables
      colors: {
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        text: 'rgb(var(--c-text) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        signal: 'rgb(var(--c-signal) / <alpha-value>)',
        mature: 'rgb(var(--c-mature) / <alpha-value>)',
        old: 'rgb(var(--c-old) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
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
