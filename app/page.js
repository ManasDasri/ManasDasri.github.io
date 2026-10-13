import HeroBanner from '@/components/HeroBanner';
import Dock from '@/components/Dock';
import Hero from '@/components/Hero';
import Building from '@/components/Building';
import Now from '@/components/Now';
import Log from '@/components/Log';
import Skills from '@/components/Skills';
import GithubActivity from '@/components/GithubActivity';
import ProofOfWork from '@/components/ProofOfWork';
import Writing from '@/components/Writing';
import CodeArt from '@/components/CodeArt';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import { getLeetCodeStats } from '@/lib/leetcode';
import { getPosts } from '@/lib/posts';
import Desktop from '@/components/desktop/Desktop';

export default async function Home() {
  const leetcode = await getLeetCodeStats('ManasDasari');

  return (
    <>
      <Dock />
      <HeroBanner />
      <main id="main" className="max-w-5xl mx-auto border-x border-line/60 relative">
        <Hero />

        <Building />
        <Now />
        <Log />
        <Skills />
        <GithubActivity leetcode={leetcode} />
        <CodeArt />
        <ProofOfWork />
        <Writing />

        <Footer />
        <CommandPalette />
      </main>
      <Desktop posts={getPosts().map(({ slug, title, date, readMins }) => ({ slug, title, date, readMins }))} />
    </>
  );
}
