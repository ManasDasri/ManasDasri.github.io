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
        // one family, Archivo, at different widths (font-stretch); Space Mono only for code
        head: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        display: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        // small labels and data: Archivo set narrow (see .font-mono in globals.css)
        mono: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        // real code: terminals and commands
        code: ['"Space Mono"', 'monospace'],
        body: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
      },
      // where the dock moves to the left side: the 42rem column plus room for the dock beside it
      screens: { dock: '960px' },
    },
  },
  plugins: [],
};
