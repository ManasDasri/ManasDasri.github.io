import HeroBanner from '@/components/HeroBanner';
import Dock from '@/components/Dock';
import Hero from '@/components/Hero';
import Building from '@/components/Building';
import Now from '@/components/Now';
import Reading from '@/components/Reading';
import Log from '@/components/Log';
import Skills from '@/components/Skills';
import GithubActivity from '@/components/GithubActivity';
import ProofOfWork from '@/components/ProofOfWork';
import TabbedSection from '@/components/TabbedSection';
import { Band } from '@/components/Section';
import { reading } from '@/lib/data';
import Writing from '@/components/Writing';
import Contact from '@/components/Contact';
import CodeArt from '@/components/CodeArt';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import { getLeetCodeStats } from '@/lib/leetcode';
import { getPosts } from '@/lib/posts';
import { getTickerData } from '@/lib/ticker';
import { log } from '@/lib/data';
import Desktop from '@/components/desktop/Desktop';

// only the home page is canonical for '/' (set here, not in the layout, or every page would claim it)
export const metadata = {
  alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'Manas Dasari · Writing' }] } },
};

export default async function Home() {
  const leetcode = await getLeetCodeStats('ManasDasari');
  const { sprout, mergedPRs, sproutStats } = await getTickerData();
  const milestone = log.find((e) => e.date !== 'upcoming');
  // three facts for someone skimming; any that failed to load at build are left out
  const highlights = [
    sprout && { value: `Sprout ${sprout}`, label: 'shipped', href: 'https://github.com/Sprout-DevLabs/sprout/releases' },
    mergedPRs && { value: `${mergedPRs} PRs`, label: 'merged', href: '#proof-of-work' },
    milestone && { value: milestone.title.replace(/,.*$/, ''), label: milestone.note ?? '', href: '#log' },
  ].filter(Boolean);

  return (
    <>
      <Dock />
      <div className="relative z-[2] max-w-4xl mx-auto">
        <Band className="!h-10" />
      </div>
      <HeroBanner />
      <main id="main" className="max-w-4xl mx-auto border-x border-dashed border-line/70 relative">
        <Hero highlights={highlights} />

        <Building stats={sproutStats} />
        <TabbedSection
          id="now"
          index={2}
          title="Now"
          tabs={[
            { id: 'now-plate', label: 'this semester', note: "what's on my plate this semester", content: <Now /> },
            ...(reading.length
              ? [{ id: 'reading', label: 'reading', note: "books I've finished this year, and papers worth your time", content: <Reading /> }]
              : []),
            { id: 'log', label: 'log', note: 'dated milestones, newest first', content: <Log /> },
          ]}
        />
        <Skills />
        <TabbedSection
          id="activity"
          index={4}
          title="Activity"
          tabs={[
            { id: 'contributions', label: 'contributions', note: 'GitHub live; LeetCode as of the last daily build', content: <GithubActivity leetcode={leetcode} /> },
            { id: 'proof-of-work', label: 'pull requests', note: 'my pull requests, live from GitHub', content: <ProofOfWork /> },
          ]}
        />
        <CodeArt />
        <Writing />
        <Contact />

        <Footer />
        <CommandPalette />
      </main>
      <Desktop posts={getPosts().map(({ slug, title, date, readMins }) => ({ slug, title, date, readMins }))} />
    </>
  );
}
