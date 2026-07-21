export const socials = [
  { label: 'GitHub', href: 'https://github.com/ManasDasri', type: 'github', username: 'ManasDasri' },
  {
    label: 'X',
    href: 'https://twitter.com/ManasDasri',
    type: 'static',
    name: 'Manas',
    handle: '@ManasDasri',
    note: 'Twitter.',
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
    href: 'https://leetcode.com/ManasDasari',
    type: 'static',
    name: 'Manas',
    handle: '@ManasDasari',
    note: 'Grinding DSA in Python.',
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
  'Building Flow, Atmos and a Bunch of other small projects in my free time',
  'CS undergrad at Amrita School of Engineering, 5th semester',
  'Fintech enthusiast — following markets, trading systems, and where finance meets software',
  'Writing code and Creating Art digitally - exploring the intersection of logic and creativity',
  'Coordinating weekend animal welfare outreach events through Barket',
  'Attending IndiaFOSS 2026 — Bengaluru',
  'Sharpening DSA fundamentals daily on LeetCode (Python)',
  'Linux enthusiast: deep into desktop ricing with KDE Plasma',
];

export const projects = [
  {
    name: 'Flow',
    status: 'live in dev',
    active: true,
    description:
      'A virtual study room web app for focused, shared work sessions — task tracking, live presence, and cross-network video calling built on Express.js, vanilla JS, Supabase, and WebRTC (with Cloudflare Realtime TURN for reliable connections across networks).',
    tags: ['Express.js', 'Supabase', 'WebRTC', 'Cloudflare'],
    link: 'YOUR-FLOW-LINK',
  },
  // Placeholder card — replace name/description/tags/link once you start
  // your next project, or delete this entry if you'd rather only show Flow.
//  {
//    name: 'your-next-project',
//    status: 'up next',
//    active: false,
//    description: 'Swap this card for whatever you build next.',
//    tags: [],
//    link: '#',
//  },
];

export const skills = [
  { group: 'languages', items: ['Python', 'JavaScript', 'Node.js'] },
  { group: 'frameworks & data', items: ['Express.js', 'Supabase', 'PostgreSQL'] },
  { group: 'tools & systems', items: ['Git', 'GitHub', 'Linux', 'Unix Shell', 'KDE Plasma'] },
];

// Placeholder posts — swap title/meta/href for each real post once it's
// live. Add or remove entries here as your post count changes.
//export const writing = [
//  { title: 'Your first post title goes here', meta: 'add a date and a one-line summary', href: '#' },
//  { title: 'Second post title', meta: "swap these placeholders once you've got posts live", href: '#' },
// ];

export const commands = [
  { label: 'Go to About', section: 'about' },
  { label: 'Go to Building', section: 'building' },
  { label: 'Go to Skills', section: 'skills' },
  { label: 'Go to Activity', section: 'activity' },
  { label: 'Go to Writing', section: 'writing' },
  { label: 'Open GitHub', href: 'https://github.com/ManasDasri' },
  { label: 'Send an email', href: 'mailto:YOUR-EMAIL@example.com' },
];
