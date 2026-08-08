import Hero from '@/components/Hero';
import Building from '@/components/Building';
import Skills from '@/components/Skills';
import GithubActivity from '@/components/GithubActivity';
import ProofOfWork from '@/components/ProofOfWork';
import Writing from '@/components/Writing';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import IndexNav from '@/components/IndexNav';

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto border-x border-line/60 relative">
      <Hero />

      <Building />
      <Skills />
      <GithubActivity />
      <ProofOfWork />
      <Writing />

      <Footer />

      <IndexNav />
      <CommandPalette />
    </main>
  );
}
