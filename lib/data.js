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
  SiCloudflare,
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
    tagline: 'Map your codebase, for you and your AI agent.',
    description:
      'A fast, single-binary directory explorer in Go, built around how developers actually read projects. Trees that respect .gitignore, pull requests rendered as trees, commit hotspots, a suggested reading order, token-budgeted project maps for LLMs, and an MCP server so coding agents can use it directly.',
    tags: [
      { label: 'Go', icon: SiGo },
      { label: 'CLI', icon: null },
      { label: 'MCP', icon: null },
      { label: 'LLM tooling', icon: null },
    ],
    link: 'https://sprout-devlabs.github.io/sprout-web/',
    statusUrl: 'https://sprout-devlabs.github.io/sprout-web/',
    repo: 'Sprout-DevLabs/sprout',
    version: 'v0.2.0', // fallback; the card fetches the latest release
    slug: 'sprout',
    started: '2026-09',
    kind: 'Developer tool',
    features: [
      'Trees that respect .gitignore (it asks git itself, so nested ignores and negations work) and say how much they hid',
      'Git changes, 90-day commit hotspots and true folder sizes shown in the tree',
      'Pull requests rendered as trees: sprout --diff main...HEAD',
      'A suggested reading order for an unfamiliar project: sprout --entry',
      '--ai: a structure-first project map for LLMs, sized to a token budget, with the most-used files and their signatures',
      'Runs as an MCP server so coding agents can call it directly',
      'Works on repos you have not cloned: sprout github.com/owner/repo',
    ],
    layers: [
      { label: 'Input', nodes: ['your project, or a GitHub URL', 'git: ignores, changes, 90-day history'] },
      { label: 'Analysis', nodes: ['gitignore-aware walk', 'hotspots and sizes', 'usage graph: key files and signatures'] },
      { label: 'Output', nodes: ['terminal tree', '--ai project map', 'MCP server for agents'] },
    ],
  },
  {
    name: 'Flow',
    pattern: 'glider',
    status: 'live in dev',
    active: true,
    description:
      'A virtual study room web app for focused, shared work sessions — task tracking, live presence, and cross-network video calling built on Express.js, vanilla JS, Supabase, and WebRTC (with Cloudflare Realtime TURN for reliable connections across networks).',
    tags: [
      {label: 'Express.js', icon: SiExpress},
      {label: 'Supabase', icon: SiSupabase},
      {label: 'WebRTC', icon: null},
      {label: 'Cloudflare', icon: SiCloudflare}
    ],
    link: 'https://flow-study.me',
    statusUrl: 'https://flow-study.me/',
    repoUrl: 'https://github.com/ManasDasri/Flow-study',
    slug: 'flow',
    started: '2026-06',
    kind: 'Real-time web app',
    tagline: 'Study better, together.',
    features: [
      'Rooms you join with a 6-character code; state syncs through Supabase Realtime instead of a WebSocket server',
      'Peer-to-peer WebRTC video, relayed through Cloudflare Realtime TURN when networks block direct connections',
      'A synchronised pomodoro timer: if one person pauses, everyone pauses',
      'Shared tasks with a live progress bar, stored in Postgres',
      'Type /ai in the room chat and a Groq-hosted Llama 3 model answers for the whole room',
      'Built-in lo-fi music through Spotify',
    ],
    layers: [
      { label: 'Browser', nodes: ['vanilla JS app (ES modules)', 'WebRTC video, peer to peer'] },
      { label: 'Realtime', nodes: ['Supabase Realtime: room state, chat, signalling', 'Cloudflare Realtime TURN relay'] },
      { label: 'Server and data', nodes: ['Express: static files and the /ai endpoint', 'Groq: Llama 3', 'Supabase Postgres: rooms, tasks, sessions (row-level security)'] },
    ],
  },

  {
    name: 'Atmos',
    pattern: 'toad',
    status: 'live in dev',
    active: true,
    description: 'Atmos is a Python + FastAPI project that simulates and optimizes air quality sensor placement across the city. The system combines real-time WAQI data, traffic-weighted zone analysis, and optimization algorithms to propose an efficient sensor network that is cheaper and more effective than the existing CAAQMS stations.',
    tags: [
      {label: 'Python', icon: SiPython},
      {label: 'FastAPI',  icon: SiFastapi},
      {label: 'JavaScript', icon: SiJavascript},
    ],
    link: 'https://github.com/ManasDasri/Atmos',
    slug: 'atmos',
    started: '2025-12',
    kind: 'Optimisation model',
    tagline: 'A cheaper, denser air quality network for Bengaluru.',
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
      'A stochastic market forecasting platform. It models a stock’s terminal price distribution with Monte Carlo simulation (up to 1,000 paths), Geometric Brownian Motion and a 3-state Markov chain, then adjusts its risk assumptions using LLaMA 3.3 sentiment on live headlines.',
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
    tagline: 'Probability cones for stock prices.',
    features: [
      'Live OHLCV prices from Twelve Data, plus quotes and headlines from Finnhub',
      'Monte Carlo engine with regime-switching volatility and jump-shock stress events',
      'Groq LLaMA 3.3-70B reads recent headlines and shifts the drift and volatility assumptions',
      'Fan chart and histogram drawn on a plain HTML canvas, no charting library',
      'Risk numbers: expected terminal price, upside probability, VaR and CVaR at 95%',
      'Scenario presets (Base, Risk-On, Risk-Off, Black Swan) and a regime heatmap with the Markov transition matrix',
      'Runs in demo mode on synthetic data when API keys are missing',
    ],
    layers: [
      { label: 'Data', nodes: ['Twelve Data: OHLCV', 'Finnhub: quotes and headlines'] },
      { label: 'Model', nodes: ['GBM Monte Carlo, up to 1,000 paths', '3-state Markov regimes + jump shocks', 'LLaMA 3.3 sentiment → drift and volatility'] },
      { label: 'Output', nodes: ['canvas fan chart and histogram', 'VaR / CVaR (95%), upside probability', 'scenario presets'] },
    ],
  },

  {
    name: 'Analogue Risk',
    pattern: 'clock',
    status: 'in research',
    badge: 'for publication',
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
    tagline: 'Forecasting market risk from historical analogues.',
  },
];

export const skills = [
  {
    group: 'languages',
    items: [
      { label: 'Python', icon: SiPython },
      { label: 'JavaScript', icon: SiJavascript },
      { label: 'Node.js', icon: SiNodedotjs },
      { label: 'Java', icon: FaJava },
      { label: 'C', icon: SiC },
      { label: 'Visual Basic (currently exploring)', icon: SiDotnet },
      { label: 'Go (learning..)', icon: SiGo },
    ],
  },
  {
    group: 'frameworks & data',
    items: [
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
      { label: 'AI / ML', icon: null },
      { label: 'Numpy', icon: SiNumpy },
      { label: 'Pandas', icon: SiPandas },
      { label: 'Tensorflow', icon: SiTensorflow },
      { label: 'Optimisation-modelling', icon: null },
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
  { label: 'Go to Building', section: 'building' },
  { label: 'Go to Now', section: 'now' },
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
