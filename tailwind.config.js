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
        // Space Grotesk and its sibling Space Mono
        head: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // display titles: names, section and page headings (the name is historical)
        serif: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Space Mono"', 'monospace'],
        mono: ['"Space Mono"', 'monospace'],
        // prose is set in the grotesk; mono is kept for labels, data and code
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      // where the dock moves to the left side: the 42rem column plus room for the dock beside it
      screens: { dock: '960px' },
    },
  },
  plugins: [],
};
