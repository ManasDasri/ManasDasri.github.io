# Manas Dasari — portfolio

[algorithmicbit.tech](https://www.algorithmicbit.tech/) · Next.js static export on GitHub Pages.

## Work locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

To preview the deployed output:

```sh
npm run build
python3 -m http.server 3100 --bind 127.0.0.1 --directory out
```

There is no Next.js server in production. `.github/workflows/deploy.yml` builds and deploys `out/` on pushes to `main` and refreshes build-time data hourly.

## Content

- `lib/data.js`: project summaries, evidence links, features, architecture, social links and current activities. Cards and project pages use the same records.
- `content/posts/*.md`: writing, with optional interactive demos.
- `public/projects/`: project screenshots. `flow-room.png` comes from the Flow-study repository's `assets/flow.png`.
- `app/sitemap.js`: generated from the project and writing records.

Project evidence links point to the upstream implementation, checks or published benchmark methodology. Atmos is described as a modelled prototype, Velora as a simulation, and Analogue Risk includes negative results. Update those descriptions when the underlying work changes; do not infer users, accuracy or deployment outcomes from a feature list.

## Rendering and motion

The shared layout owns navigation and the command palette. CSS controls dock position and visibility from the first paint; viewport-dependent React state must not decide where it initially appears. The server and first client render use identical text, and clocks update after mount.

Sections render visibly without scroll observers or JavaScript. The name uses a colour transition on hover, not a text-clipping animation. Life remains the main animation; reduced-motion visitors start with a paused colony and can explicitly resume it. Project terminal output is labelled as a recorded v0.2.0 demo.

## Checks

```sh
npm test
npm run build
```

With Playwright CLI installed and the static preview running on port 3100:

```sh
playwright-cli open http://127.0.0.1:3100
playwright-cli run-code --filename=scripts/check-browser.js
```

The browser check covers hydration errors, dock position before hydration and across history navigation, name hover, project and writing routes, the command palette, the terminal, five viewport widths, no-JavaScript content and reduced motion. Screenshots go in `output/playwright/` (ignored by Git).

GitHub, weather and LeetCode can be unavailable or rate limited. Keep the core portfolio usable when they fail. Tokens belong only in build or server environments, never in browser code.
