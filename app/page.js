import SiteNav from '@/components/SiteNav';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import Upstream from '@/components/Upstream';
import Timeline from '@/components/Timeline';
import { PostList } from '@/components/Writing';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import { getTickerData } from '@/lib/ticker';

// only the home page is canonical for '/' (set here, not in the layout, or every page would claim it)
export const metadata = {
  alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'Manas Dasari · Writing' }] } },
};

export default async function Home() {
  const { sprout, mergedPRs } = await getTickerData();
  // three facts for someone skimming; any that failed to load at build are left out
  const highlights = [
    mergedPRs && { value: `${mergedPRs} PRs`, label: 'merged into open source', href: '#open-source' },
    sprout && { value: `Sprout ${sprout}`, label: 'latest release', href: 'https://github.com/Sprout-DevLabs/sprout/releases' },
    { value: 'BERT 0.879 F1', label: 'on held-out contracts', href: '/projects/clause-risk-review/' },
  ].filter(Boolean);

  return (
    <>
      <SiteNav home />
      <main id="main">
        <Hero highlights={highlights} />
        <Work />
        <Upstream mergedPRs={mergedPRs} />
        <Timeline />
        <section id="writing" className="wrap section">
          <header className="section-head">
            <h2>Writing</h2>
            <p>Notes from building things, some with demos you can play with.</p>
          </header>
          <div className="writing">
            <PostList />
          </div>
        </section>
        <Contact />
      </main>
      <div className="wrap">
        <Footer />
      </div>
      <CommandPalette />
    </>
  );
}
