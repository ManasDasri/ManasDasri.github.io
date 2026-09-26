import HeroBanner from '@/components/HeroBanner';
import Hero from '@/components/Hero';
import Building from '@/components/Building';
import Now from '@/components/Now';
import Skills from '@/components/Skills';
import GithubActivity from '@/components/GithubActivity';
import ProofOfWork from '@/components/ProofOfWork';
import Writing from '@/components/Writing';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import IndexNav from '@/components/IndexNav';

export default function Home() {
  return (
    <>
      <HeroBanner />
      <main className="max-w-5xl mx-auto border-x border-line/60 relative">
        <Hero />

        <Building />
        <Now />
        <Skills />
        <GithubActivity />
        <ProofOfWork />
        <Writing />

        <Footer />

        <IndexNav />
        <CommandPalette />
      </main>
    </>
  );
}
