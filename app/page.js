import Topbar from '@/components/Topbar';
import HeroBanner from '@/components/HeroBanner';
import FetchPanel from '@/components/FetchPanel';
import HeroCta from '@/components/HeroCta';
import Socials from '@/components/Socials';
import About from '@/components/About';
import Building from '@/components/Building';
import Skills from '@/components/Skills';
import GithubActivity from '@/components/GithubActivity';
import Writing from '@/components/Writing';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import { GlassDock } from '@/components/ui/glass-dock';

// Titles matching 'home' | 'blog' | 'marker' | 'email' | 'linkedin' | 'x' | 'github'
// (case-insensitive) get the built-in animated morph icon automatically —
// no icon component needed for those. Swap the placeholder hrefs for your
// real links/handles.
const dockItems = [
  { title: 'Home', href: '#hero' },
  { title: 'Blog', href: '#writing' },
  { title: 'Email', href: 'mailto:YOUR-EMAIL@example.com' },
  { title: 'LinkedIn', href: 'https://linkedin.com/in/YOUR-LINKEDIN', external: true },
  { title: 'X', href: 'https://twitter.com/YOUR-HANDLE', external: true },
  { title: 'GitHub', href: 'https://github.com/ManasDasri', external: true },
];

export default function Home() {
  return (
    <main>
      <HeroBanner />
      <Topbar />

      <section id="hero" className="px-6 pt-8 pb-16 flex flex-col items-center gap-9">
        <FetchPanel />
        <HeroCta />
      </section>

      <Socials />
      <About />
      <Building />
      <Skills />
      <GithubActivity />
      <Writing />
      <Footer />

      <CommandPalette />

      {/* Floating glass dock, pinned to the bottom of the viewport */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <GlassDock items={dockItems} />
      </div>
    </main>
  );
}
