import {
  SiPython,
  SiJavascript,
  SiNodedotjs,
  SiC,
  SiExpress,
  SiSupabase,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiGit,
  SiGithub,
  SiLinux,
  SiDocker,
  SiKde,
  SiKalilinux,
  SiPopos,
  SiNumpy,
  SiPandas,
  SiTensorflow,
  SiFastapi,
  SiDotnet,
  SiGo,
  SiVite,
  SiRust,
} from 'react-icons/si';
import { FaJava, FaWindows } from 'react-icons/fa6';

//socials
export const socials = [
  { label: 'GitHub', href: 'https://github.com/ManasDasri', type: 'github', username: 'ManasDasri' },
  {
    label: 'X',
    href: 'https://x.com/ManasDmg9',
    type: 'static',
    name: 'Manas D',
    handle: '@ManasDmg9',
    note: 'CS undergrad, Building Systems',
    avatar: '/berserk-pfp.jpg',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/manas-dasari-2a52163a5/',
    type: 'static',
    name: 'Manas',
    handle: 'CS undergrad · Amrita School of Engineering',
    note: 'Connect for work, internships, or collabs.',
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/ManasDasari/',
    type: 'static', 
    name: 'Manas',
    handle: '@ManasDasari',
    note: 'Sharpening DSA fundamentals daily in Python.',
    avatar: '/img.jpeg',
  },
  {
    label: 'Reddit',
    href: 'https://reddit.com/u/KenX049',
    type: 'static',
    name: 'Manas',
    handle: 'u/KenX049',
    note: 'Lurking in Linux and fintech subreddits.',
    avatar: '/pcii.jpg',
  },
];

// "Now" section. `href` is optional; `note` renders dimmer after the text.
export const now = [
  {
    label: 'Shipping',
    items: [
      { text: 'Sprout', note: 'codebase maps for developers and AI agents', href: 'https://github.com/Sprout-DevLabs/sprout' },
      { text: 'Flow', note: 'virtual study rooms', href: 'https://flow-study.me' },
      { text: 'Atmos', note: 'air quality sensor placement', href: 'https://github.com/ManasDasri/Atmos' },
    ],
  },
  {
    label: 'Exploring',
    items: [
      { text: 'Velora', note: 'Monte Carlo market forecasting', href: '/projects/velora/' },
      { text: 'A live 3D physics engine' },
      { text: 'An ML life simulator', note: 'simple survival rules, like the grid up top', href: '#top' },
    ],
  },
  {
    label: 'Competing',
    items: [
      { text: 'Kaggle' },
      { text: 'Hack2skill' },
      { text: 'WeMakeDevs' },
      { text: 'Guidewire DEVTrails' },
    ],
  },
  {
    label: 'Contributing',
    items: [
      { text: 'Exercism/vbnet', href: 'https://github.com/exercism/vbnet' },
      { text: 'DSA daily on LeetCode', note: 'in Python', href: 'https://leetcode.com/u/ManasDasari/' },
    ],
  },
  {
    label: 'Events',
    items: [
      { text: 'IndiaFOSS 2026, Bengaluru', note: 'attending' },
      { text: 'Bangalore Tech Summit 2025', note: 'attended' },
    ],
  },
  {
    label: 'Off the keyboard',
    items: [
      { text: 'Animal welfare outreach with Barket', note: 'weekend events' },
      { text: 'KDE Plasma ricing on Linux' },
      { text: 'Following markets and trading systems' },
    ],
  },
];

export const projects = [
  {
    name: 'Sprout',
    pattern: 'beacon',
    status: 'shipped',
    active: true,
    featured: true,
    tagline: 'Know where to start. See what a change could break.',
    summary: 'Explore unfamiliar code, trace dependencies and find affected tests. One Go binary, with the same tools available to coding agents over MCP.',
    evidence: {
      text: 'Published benchmark: a 31,412-file Kubernetes tree in 0.23 s on an Apple M4 with a warm cache.',
      href: 'https://sprout-devlabs.github.io/sprout-web/benchmarks/',
      label: 'Benchmark method',
    },
    description:
      'A single Go binary that maps a repository, suggests where to start reading, and traces what a change could affect. Its CLI and read-only MCP server give developers and coding agents the same view of the codebase.',
    tags: [
      { label: 'Go', icon: SiGo },
      { label: 'CLI', icon: null },
      { label: 'MCP', icon: null },
      { label: 'LLM tooling', icon: null },
    ],
    link: 'https://sprout-devlabs.github.io/sprout-web/',
    statusUrl: 'https://sprout-devlabs.github.io/sprout-web/',
    repo: 'Sprout-DevLabs/sprout',
    version: 'v0.4.2', // fallback; the card fetches the latest release
    slug: 'sprout',
    started: '2026-09',
    kind: 'Developer tool',
    features: [
      'sprout tour: project purpose, ecosystems, layout and a suggested reading order in one command',
      'sprout impact: trace changed files to their dependents and affected tests, with suggested test commands',
      'sprout context: signatures, dependencies, callers and tests for one file within a token budget',
      'Trees that respect .gitignore (it asks git itself, so nested ignores and negations work) and say how much they hid',
      'Git changes, 90-day commit hotspots and true folder sizes shown in the tree',
      'Pull requests rendered as trees: sprout --diff main...HEAD',
      'A suggested reading order for an unfamiliar project: sprout --entry',
      '--ai: a structure-first project map for LLMs, sized to a token budget, with the most-used files and their signatures',
      'Read-only MCP tools for maps, reading order, dependencies, impact and context, with paths confined to the project',
      'Works on repos you have not cloned: sprout github.com/owner/repo',
    ],
    layers: [
      { label: 'Input', nodes: ['your project, or a GitHub URL', 'git: ignores, changes, 90-day history'] },
      { label: 'Analysis', nodes: ['gitignore-aware walk', 'hotspots and sizes', 'usage graph: key files and signatures'] },
      { label: 'Output', nodes: ['tour, impact and context', 'terminal tree and --ai map', 'read-only MCP tools'] },
    ],
  },
  {
    name: 'Flow',
    pattern: 'glider',
    status: 'live in dev',
    active: true,
    description:
      'A shared study room with a synchronised focus timer, persistent tasks, chat and peer-to-peer video. Supabase handles room state and signalling; a small Express server provides AI replies and temporary TURN credentials.',
    tags: [
      {label: 'Express.js', icon: SiExpress},
      {label: 'Supabase', icon: SiSupabase},
      {label: 'WebRTC', icon: null},
      {label: 'Twilio TURN', icon: null}
    ],
    link: 'https://flow-study.me',
    statusUrl: 'https://flow-study.me/',
    repoUrl: 'https://github.com/ManasDasri/Flow-study',
    slug: 'flow',
    started: '2026-06',
    kind: 'Real-time web app',
    tagline: 'A shared room for focused work.',
    summary: 'Study together with a synchronised Pomodoro timer, shared tasks, chat and WebRTC video. Join a room with a six-character code.',
    evidence: {
      text: 'Shared timer state, persistent tasks and room access checks are implemented in the app and database schema.',
      href: 'https://github.com/ManasDasri/Flow-study/blob/main/sql/schema.sql',
      label: 'Room & data model',
    },
    screenshots: [{ src: '/projects/flow-room.png', alt: 'Flow study room with a shared timer, task list, chat and participant video.', width: 2560, height: 1380 }],
    features: [
      'Rooms you join with a 6-character code; state syncs through Supabase Realtime instead of a WebSocket server',
      'Peer-to-peer WebRTC video, relayed through Twilio TURN when networks block direct connections',
      'A synchronised pomodoro timer: if one person pauses, everyone pauses',
      'Shared tasks with a live progress bar, stored in Postgres',
      'Type /ai in the room chat and a Groq-hosted assistant answers for the whole room',
      'Built-in lo-fi music through Spotify',
    ],
    layers: [
      { label: 'Browser', nodes: ['vanilla JS app (ES modules)', 'WebRTC video, peer to peer'] },
      { label: 'Realtime', nodes: ['Supabase Realtime: room state, chat, signalling', 'Twilio TURN relay'] },
      { label: 'Server and data', nodes: ['Express: static files and the /ai endpoint', 'Groq: gpt-oss-20b', 'Supabase Postgres: rooms, tasks, sessions (row-level security)'] },
    ],
  },

  {
    name: 'Atmos',
    pattern: 'toad',
    status: 'prototype',
    active: true,
    description: 'A prototype for exploring air-quality sensor placement in Bengaluru under a fixed budget. It combines WAQI readings, traffic-weighted zones and numerical optimisation, and compares a proposed hybrid network with the existing 14-station model. These are modelled allocations, not a deployed sensor network.',
    repo: 'ManasDasri/Atmos',
    tags: [
      {label: 'Python', icon: SiPython},
      {label: 'FastAPI',  icon: SiFastapi},
      {label: 'JavaScript', icon: SiJavascript},
    ],
    link: 'https://github.com/ManasDasri/Atmos',
    slug: 'atmos',
    started: '2025-12',
    kind: 'Optimisation model',
    tagline: 'Where should Bengaluru put its next air-quality sensors?',
    summary: 'Model sensor placement with pollution and traffic data, then compare coverage under a fixed budget. A FastAPI prototype with an interactive map.',
    evidence: {
      text: 'The prototype explores a ₹25 lakh budget against a 14-station baseline; savings and coverage are modelled, not field-validated.',
      href: 'https://github.com/ManasDasri/Atmos#notes',
      label: 'Scope & assumptions',
    },
    features: [
      'Live PM2.5 and AQI readings for Bengaluru from the WAQI API, with realistic fallback data if the API is down',
      'Traffic-weighted zones, so sensors go where people and pollution actually are',
      'A hybrid optimiser using the Bounding Phase method and Golden Ratio search',
      'An interactive map of sensor coverage and PM2.5 per zone',
      'A side-by-side comparison against the 14 existing CAAQMS stations',
      'AQI lookup per neighbourhood, zone statistics, and a guide to PM2.5 safety',
    ],
    layers: [
      { label: 'Data', nodes: ['WAQI live PM2.5 / AQI', 'fallback data generator'] },
      { label: 'Model', nodes: ['traffic-weighted zones', 'Bounding Phase + Golden Ratio search', 'proportional sensor allocation'] },
      { label: 'App', nodes: ['FastAPI JSON API: /api/model, /api/optimize, /api/stats', 'Jinja2 pages: map, compare, zone lookup'] },
    ],
  },

  {
    name: 'Velora',
    pattern: 'blinker',
    status: 'live',
    active: true,
    description:
      'An interactive stock-price simulation with 2,000 seeded Monte Carlo paths, three market regimes and optional jump shocks. Probability bands, tail-risk measures and headline sentiment make the assumptions visible; simulated outcomes are scenarios, not validated forecasts.',
    tags: [
      { label: 'React', icon: SiReact },
      { label: 'Vite', icon: SiVite },
      { label: 'Monte Carlo', icon: null },
    ],
    link: 'https://velora-one-lake.vercel.app',
    statusUrl: 'https://velora-one-lake.vercel.app/',
    repoUrl: 'https://github.com/ManasDasri/Velora',
    slug: 'velora',
    started: '2026-08',
    kind: 'Quant platform',
    tagline: 'Explore a range of market outcomes.',
    summary: 'Adjust a horizon, market regime and jump risk to explore 2,000 simulated price paths. See probability bands and tail-risk measures update together.',
    evidence: {
      text: 'A seeded engine keeps scenarios repeatable. Runnable checks cover the simulation; API keys stay in serverless endpoints.',
      href: 'https://github.com/ManasDasri/Velora/blob/main/src/utils/simulation.check.js',
      label: 'Simulation checks',
    },
    features: [
      'Live OHLCV prices from Twelve Data, plus quotes and headlines from Finnhub',
      'Monte Carlo engine with regime-switching volatility and jump-shock stress events',
      'Groq LLaMA 3.3-70B reads recent headlines and shifts the drift and volatility assumptions',
      'SVG probability fan with 50%, 80% and 90% bands, a terminal distribution and per-day hover readouts; no charting library',
      'Median and expected terminal price, upside probability, and 95% VaR / CVaR, with a checkpoint table',
      'Scenario presets (Base, Risk-on, Risk-off, Stress) and a regime heatmap with the Markov transition matrix',
      'Runs in demo mode on synthetic data when API keys are missing',
    ],
    layers: [
      { label: 'Data', nodes: ['Twelve Data: OHLCV', 'Finnhub: quotes and headlines'] },
      { label: 'Model', nodes: ['2,000 seeded Monte Carlo paths', '3-state Markov regimes + jump shocks', 'LLaMA 3.3 sentiment → drift and volatility'] },
      { label: 'Output', nodes: ['SVG probability fan and distribution', 'VaR / CVaR (95%), upside probability', 'scenario presets'] },
    ],
  },

  {
    name: 'Analogue Risk',
    pattern: 'clock',
    status: 'in research',
    badge: 'paper in preparation',
    slug: 'analogue-risk',
    repo: 'ManasDasri/analogue-risk',
    active: true,
    description:
      'Regime-conditioned analogue forecasting of market risk, with self-exciting tail-risk gating. A Rust + Python rebuild of a kNN, Poisson-gated trading model, re-tested under a pre-registered out-of-sample protocol across 15 new assets and redirected from forecasting direction to forecasting risk, which is where the data shows predictability.',
    tags: [
      { label: 'Python', icon: SiPython },
      { label: 'Rust', icon: SiRust },
      { label: 'Quant research', icon: null },
    ],
    link: 'https://github.com/ManasDasri/analogue-risk',
    started: '2026-09',
    kind: 'Research',
    tagline: 'Test the signal. Report the limits.',
    summary: 'A Rust and Python study of historical analogues for market risk. A pre-registered evaluation compares direction, volatility and tail-risk forecasts with established baselines.',
    evidence: {
      text: 'On 15 new assets, the study found no directional edge. Analogue + HAR tied HAR for volatility; the analogue alone was worse.',
      href: 'https://github.com/ManasDasri/analogue-risk#results-summary',
      label: 'Results & limitations',
    },
    features: [
      'A causal analogue engine with non-overlapping historical anchors and volatility-regime conditioning',
      'Eight pre-registered hypotheses evaluated on 15 new assets after a nine-asset development study',
      'Walk-forward comparisons with HAR, EWMA, GARCH and filtered historical simulation',
      'A Rust core exposed to Python through PyO3, with reproducible tables and figures',
      'Tests for look-ahead leakage, likelihood calculations, planted-signal recovery and bootstrap behaviour',
    ],
    layers: [
      { label: 'Data', nodes: ['Binance and Yahoo price histories', 'pinned snapshots and documented cleaning'] },
      { label: 'Model', nodes: ['Rust analogue engine and risk gates', 'Python walk-forward experiments and benchmarks'] },
      { label: 'Evidence', nodes: ['pre-registered hypotheses', 'reproducible tables, figures and limitations'] },
    ],
  },
];

export const skills = [
  {
    group: 'languages',
    items: [
      { label: 'Python', icon: SiPython },
      { label: 'JavaScript', icon: SiJavascript },
      { label: 'Java', icon: FaJava },
      { label: 'C', icon: SiC },
      { label: 'Visual Basic', icon: SiDotnet },
      { label: 'Go', icon: SiGo },
    ],
  },
  {
    group: 'frameworks & data',
    items: [
      { label: 'Node.js', icon: SiNodedotjs },
      { label: 'Express.js', icon: SiExpress },
      { label: 'Supabase', icon: SiSupabase },
      { label: 'PostgreSQL', icon: SiPostgresql },
      { label: 'React', icon: SiReact },
      { label: 'Redis', icon: SiRedis },
    ],
  },
  {
    group: 'ai / ml',
    items: [
      { label: 'NumPy', icon: SiNumpy },
      { label: 'Pandas', icon: SiPandas },
      { label: 'TensorFlow', icon: SiTensorflow },
      { label: 'Optimisation', icon: null },
    ],
  },
  {
    group: 'tools & systems',
    items: [
      { label: 'Git', icon: SiGit },
      { label: 'GitHub', icon: SiGithub },
      { label: 'Linux', icon: SiLinux },
      { label: 'Docker', icon: SiDocker },
      { label: 'Unix Shell', icon: null },
      { label: 'KDE Plasma', icon: SiKde },
    ],
  },
  {
    group: 'operating systems',
    items: [
      { label: 'Kali Linux', icon: SiKalilinux },
      { label: 'Pop!_OS', icon: SiPopos },
      { label: 'Windows', icon: FaWindows },
      { label: 'TempleOS', icon: null },
    ],
  },
];


export const commands = [
  { label: 'Start the desktop (startx)', desktop: true },
  { label: 'Go to Projects', section: 'building' },
  { label: 'Go to About & now', section: 'now' },
  { label: 'Go to Log', section: 'log' },
  { label: 'Go to My code, drawn', section: 'art' },
  { label: 'Terminal: sprout --entry', terminal: 'sprout --entry' },
  { label: 'Terminal: help', terminal: 'help' },
  { label: 'Life: next rule', life: { action: 'rule' } },
  { label: 'Life: drop a glider gun', life: { action: 'drop', value: 'gun' } },
  { label: 'Life: pause or resume', life: { action: 'pause' } },
  { label: 'Life: reseed', life: { action: 'reseed' } },
  { label: 'Open Flow', href: '/projects/flow/' },
  { label: 'Open Atmos', href: '/projects/atmos/' },
  { label: 'Open Velora', href: '/projects/velora/' },
  { label: 'Open Sprout', href: '/projects/sprout/' },
  { label: 'Install Sprout', href: 'https://sprout-devlabs.github.io/sprout-web/' },
  { label: 'Go to Skills', section: 'skills' },
  { label: 'Go to Activity', section: 'activity' },
  { label: 'Go to Writing', section: 'writing' },
  { label: 'Go to Contributions', section: 'proof-of-work' },
  { label: 'Open Analogue Risk', href: '/projects/analogue-risk/' },
  { label: 'Open résumé (PDF)', href: '/Manas_resume.pdf' },
  { label: 'Open GitHub', href: 'https://github.com/ManasDasri' },
  { label: 'Send an email', href: 'mailto:dasarimanas049@gmail.com' },
];

// Dated milestones, newest first. Dates for projects are when the repo was created.
export const log = [
  { date: 'upcoming', title: 'IndiaFOSS 2026, Bengaluru', note: 'attending' },
  { date: '2026-09', title: 'Shipped Sprout v0.1.0 and v0.2.0', note: 'Homebrew tap, Scoop bucket and Linux packages', href: 'https://github.com/Sprout-DevLabs/sprout/releases' },
  { date: '2026-09', title: 'Smart India Hackathon: FieldLensAI', note: 'problem statement SIH26122', href: 'https://github.com/ManasDasri/FieldLensAI' },
  { date: '2026-08', title: 'Kaggle: kaggriculture', note: 'learning ML fundamentals from scratch through a real competition', href: '/writing/starting-ai-ml-from-zero-again/' },
  { date: '2026-08', title: 'Started contributing to Exercism’s VB.NET track', href: 'https://github.com/exercism/vbnet' },
  { date: '2026-08', title: 'Built Velora', note: 'Monte Carlo market forecasting', href: '/projects/velora/' },
  { date: '2026-06', title: 'Started Flow', note: 'virtual study rooms', href: '/projects/flow/' },
  { date: '2026-03', title: 'Guidewire DEVTrails 2026: GigShield', note: 'phase 1 submission, parametric income protection for delivery riders', href: 'https://github.com/ManasDasri/GigShield' },
  { date: '2025-12', title: 'Started Atmos', note: 'air quality sensor placement', href: '/projects/atmos/' },
  { date: '2025-11', title: 'Attended Bangalore Tech Summit 2025' },
];

// URL of the now-playing function (see now-playing/README.md), e.g.
// 'https://manas-now-playing.vercel.app/api/now-playing'. Empty hides the widget.
export const nowPlayingEndpoint = '';
