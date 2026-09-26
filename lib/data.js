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
    avatar: '/IMG_0205.jpg',
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
      { text: 'Velora' },
      { text: 'A live 3D physics engine' },
      { text: 'An ML life simulator', note: 'simple survival rules, like the grid up top', href: '#hero' },
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
    repo: 'Sprout-DevLabs/sprout',
    version: 'v0.2.0', // fallback; the card fetches the latest release
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

// live
export const writing = [
  { title: 'Starting AI/ML From Zero (Again)', meta: 'Why I am learning AI/ML fundamentals from scratch through a real competition instead of leaning on past project experience', href: 'https://daily.dev/posts/starting-ai-ml-from-zero-again--ub2rifw2n' },
  { title: 'The Boring, Reliable Way to Start Contributing to Open Source', meta:'You do not need a better repo list. You need to know where to actually look. A practical guide to your first open source PR', href: 'https://daily.dev/posts/the-boring-reliable-way-to-start-contributing-to-open-source-6fnu8qi38' },
  { title: '// working on new blogs!', meta: 'post is still in the works', href: '#writing' },
];

export const commands = [
  { label: 'Go to Building', section: 'building' },
  { label: 'Go to Now', section: 'now' },
  { label: 'Install Sprout', href: 'https://sprout-devlabs.github.io/sprout-web/' },
  { label: 'Go to Skills', section: 'skills' },
  { label: 'Go to Activity', section: 'activity' },
  { label: 'Go to Writing', section: 'writing' },
  { label: 'Open GitHub', href: 'https://github.com/ManasDasri' },
  { label: 'Send an email', href: 'mailto:dasarimanas049@gmail.com' },
];
