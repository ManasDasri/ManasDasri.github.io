export const socials = [
  { label: 'GitHub', href: 'https://github.com/ManasDasri', type: 'github', username: 'ManasDasri' },
  {
    label: 'X',
    href: 'https://x.com/ManasDmg9',
    type: 'static',
    name: 'Manas D',
    handle: '@ManasDmg9',
    note: 'CS undergrad, Building Systems',
    avatar: '',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/manas-dasari-2a52163a5/',
    type: 'static',
    name: 'Manas',
    handle: 'CS undergrad · Amrita School of Engineering',
    note: 'Connect for work, internships, or collabs.',
    avatar: '',
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/ManasDasari/',
    type: 'static',
    name: 'Manas',
    handle: '@ManasDasari',
    note: 'Sharpening DSA fundamentals daily in Python.',
    avatar: '',
  },
  {
    label: 'Reddit',
    href: 'https://reddit.com/u/KenX049',
    type: 'static',
    name: 'Manas',
    handle: 'u/KenX049',
    note: 'Lurking in Linux and fintech subreddits.',
    avatar: '',
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
    link: 'https://flow-study-v2.onrender.com',
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
  { group: 'languages', items: ['Python', 'JavaScript', 'Node.js'] },
  { group: 'frameworks & data', items: ['Express.js', 'Supabase', 'PostgreSQL'] },
  { group: 'tools & systems', items: ['Git', 'GitHub', 'Linux', 'Unix Shell', 'KDE Plasma'] },
];

// Placeholder posts — swap title/meta/href for each real post once it's
// live. Add or remove entries here as your post count changes.
export const writing = [
  { title: '// nothing published yet', meta: 'first post is still in the works', href: '#' },
];

export const commands = [
  { label: 'Go to About', section: 'about' },
  { label: 'Go to Building', section: 'building' },
  { label: 'Go to Skills', section: 'skills' },
  { label: 'Go to Activity', section: 'activity' },
  { label: 'Go to Writing', section: 'writing' },
  { label: 'Open GitHub', href: 'https://github.com/ManasDasri' },
  { label: 'Send an email', href: 'mailto:YOUR-EMAIL@example.com' },
];
