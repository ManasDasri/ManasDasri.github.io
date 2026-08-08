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
  SiTensorflow
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

export const about = [
  'Building Flow — a virtual study room web app (Express.js, Supabase, WebRTC), with real-time video over Cloudflare Realtime TURN',
  'CS undergrad at Amrita School of Engineering, 5th semester',
  'Fintech enthusiast — following markets, trading systems, and where finance meets software',
  'Writing and creating Art digitally',
  'Coordinating weekend animal welfare outreach events through Barket',
  'Attending IndiaFOSS 2026 — Bengaluru',
  'Sharpening DSA fundamentals daily on LeetCode (Python)',
  'Linux enthusiast — deep into desktop ricing with KDE Plasma',
];

export const projects = [
  {
    name: 'Flow',
    status: 'live in dev',
    active: true,
    description:
      'A virtual study room web app for focused, shared work sessions — task tracking, live presence, and cross-network video calling built on Express.js, vanilla JS, Supabase, and WebRTC (with Cloudflare Realtime TURN for reliable connections across networks).',
    tags: ['Express.js', 'Supabase', 'WebRTC', 'Cloudflare'],
    link: 'https://flow-study.me',
  },
  // Placeholder card — replace name/description/tags/link once you start
  // your next project, or delete this entry if you'd rather only show Flow.
  {
    name: 'new project',
    status: 'under production',
    active: false,
    description: 'Something new is currently in the works — details soon.',
    tags: [],
    link: '#',
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

// live. Add or remove entries here as your post count changes.
export const writing = [
  { title: 'Starting AI/ML From Zero (Again)', meta: 'Why I am learning AI/ML fundamentals from scratch through a real competition instead of leaning on past project experience', href: 'https://daily.dev/posts/starting-ai-ml-from-zero-again--ub2rifw2n' },
  { title: '// working on new blogs!', meta: 'post is still in the works', href: '#' },
];

export const commands = [
  { label: 'Go to About', section: 'about' },
  { label: 'Go to Building', section: 'building' },
  { label: 'Go to Skills', section: 'skills' },
  { label: 'Go to Activity', section: 'activity' },
  { label: 'Go to Writing', section: 'writing' },
  { label: 'Open GitHub', href: 'https://github.com/ManasDasri' },
  { label: 'Send an email', href: 'mailto:dasarimanas049@gmail.com' },
];
