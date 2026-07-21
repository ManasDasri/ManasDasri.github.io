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
    </main>
  );
}
