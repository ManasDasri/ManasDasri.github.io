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
        // one family, IBM Plex, in its three cuts
        head: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        // display titles: names, section and page headings
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        display: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        // prose is set in the sans; mono is kept for labels, data and code
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      // where the dock moves to the left side: the 42rem column plus room for the dock beside it
      screens: { dock: '960px' },
    },
  },
  plugins: [],
};
