import { projects, socials } from '@/lib/data';
import { getTickerData } from '@/lib/ticker';
import PrintButton from '@/components/PrintButton';

// The one-page summary for someone with a minute: who, what for, the evidence, and how to
// reach me. Static, no canvas, no motion, nothing fetched in the browser; every project
// line comes from lib/data.js, so it can't drift from the full case studies.
export const metadata = {
  title: 'Recruiter view · Manas Dasari',
  description: 'Manas Dasari in one page: AI/ML and research internships, three projects with their results, open-source work, resume and contact.',
  alternates: { canonical: '/recruiter/' },
  openGraph: {
    title: 'Manas Dasari · Recruiter view',
    description: 'AI/ML and research internships, and freelance work. Three projects with their results, open-source work, resume and contact.',
    url: '/recruiter/',
    images: [{ url: '/og/recruiter.png', width: 1200, height: 630, alt: 'Manas Dasari: recruiter view' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og/recruiter.png'] },
};

const EMAIL = 'dasarimanas049@gmail.com';
const REVIEWED = '2026-11-08';
const FEATURED = ['clause-risk-review', 'med-eeg', 'sprout'];
const SKILLS = [
  { group: 'Machine learning', items: [['Python'], ['PyTorch', 'clause-risk-review'], ['Transformers', 'clause-risk-review'], ['scikit-learn', 'med-eeg'], ['held-out and cross-subject evaluation', 'med-eeg'], ['leakage prevention', 'clause-risk-review']] },
  { group: 'Research and signals', items: [['MNE (EEG)', 'med-eeg'], ['spectral analysis', 'med-eeg'], ['mixed-effects models (statsmodels)', 'med-eeg'], ['permutation tests', 'med-eeg'], ['pre-registration', 'med-eeg']] },
  { group: 'Engineering', items: [['Go', 'sprout'], ['JavaScript / TypeScript', 'forme'], ['React', 'forme'], ['FastAPI', 'atmos'], ['Git, Linux, CI'], ['MCP', 'sprout']] },
];
const OSS = [
  { repo: 'exercism/vbnet', href: 'https://github.com/exercism/vbnet/pulls?q=is%3Apr+is%3Amerged+author%3AManasDasri', what: '12 merged PRs syncing exercises and their tests with the canonical problem specifications (poker, linked-list, wordy, crypto-square and others)' },
  { repo: 'AnushreeKasturi/Survivorship', href: 'https://github.com/AnushreeKasturi/Survivorship/pulls?q=is%3Apr+is%3Amerged+author%3AManasDasri', what: '15 merged PRs as a contributor to a Scala + Spark study of whether news sentiment predicts startup survival: leak-free features and cross-validated evaluation, Scala CI, the web demo and its deployment' },
  { repo: 'gleam-lang/gleam', href: 'https://github.com/gleam-lang/gleam/pull/6361', what: '1 merged PR: link to the Hex diff for changed packages when updating dependencies' },
];
const WRITING = [
  { title: 'Building Sprout: a map of your codebase, for you and your AI agent', href: '/writing/building-sprout/' },
  { title: 'Starting AI/ML from zero (again)', href: '/writing/starting-ai-ml-from-zero-again/' },
];

const btn = 'inline-flex items-center rounded-md px-3.5 py-2 font-head text-sm font-semibold no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2';
const primary = `${btn} bg-signal text-ink hover:brightness-110`;
const secondary = `${btn} border border-line text-text hover:border-signal hover:text-signal`;
const link = 'text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal';
const h2 = 'font-mono text-xs uppercase tracking-wider text-mute mb-4';

export default async function Recruiter() {
  const { sprout: version } = await getTickerData();
  const featured = FEATURED.map((s) => projects.find((p) => p.slug === s)).filter(Boolean);
  const github = socials.find((s) => s.label === 'GitHub').href;
  const linkedin = socials.find((s) => s.label === 'LinkedIn').href;

  return (
    <main id="main" className="recruiter max-w-3xl mx-auto px-6 sm:px-9 py-10 sm:py-14">
      <nav aria-label="Site" className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-mute print:hidden">
        <a href="/" className="hover:text-signal">← explore the full portfolio</a>
        <PrintButton className="hover:text-signal" />
      </nav>

      <header className="mt-10">
        <h1 className="font-serif text-5xl sm:text-6xl leading-none m-0">Manas Dasari</h1>
        <p className="font-head text-lg sm:text-xl text-text mt-4 mb-0">AI/ML engineering · research · applied AI internships</p>
        <p className="text-mute mt-2 mb-0">CSE undergraduate (5th semester, class of 2028), Amrita School of Engineering · Bangalore, Karnataka, India</p>
        <p className="text-text/90 leading-relaxed mt-5 max-w-[60ch]">
          I run machine learning experiments built to be checked (held-out tests, baselines, null results reported) and build the tools around them.
        </p>
        <div className="flex flex-wrap gap-2.5 mt-6">
          <a href="/Manas_resume.pdf" className={primary}>Resume (PDF)</a>
          <a href={`mailto:${EMAIL}`} className={secondary}>Email</a>
          <a href={github} className={secondary}>GitHub</a>
          <a href={linkedin} className={secondary}>LinkedIn</a>
        </div>
      </header>

      <section aria-labelledby="evidence" className="mt-14">
        <h2 id="evidence" className={h2}>Selected evidence</h2>
        <ol className="list-none p-0 m-0 flex flex-col gap-4">
          {featured.map((p) => {
            const repo = p.repoUrl ?? (p.repo && `https://github.com/${p.repo}`);
            return (
              <li key={p.slug} className="rounded-lg border border-line bg-paper p-5 break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-serif text-3xl leading-none m-0">{p.name}</h3>
                  <span className="font-mono text-xs text-mute">
                    {p.kind}
                    {p.slug === 'sprout' && version ? ` · ${version}` : ''}
                  </span>
                </div>
                <p className="text-text/90 mt-2 mb-0">{p.tagline}</p>
                <ul className="list-disc marker:text-mute mt-3 mb-0 pl-5 flex flex-col gap-1.5 text-sm text-text/85 leading-relaxed">
                  {p.evidence.map((e) => <li key={e}>{e}</li>)}
                </ul>
                <p className="flex flex-wrap gap-x-5 gap-y-1 mt-4 mb-0 font-mono text-sm">
                  <a href={`/projects/${p.slug}/`} className={link}>{p.study ? 'read the case study' : 'project page'}</a>
                  {repo && <a href={repo} className={link}>code</a>}
                  {p.link && !p.link.includes('github.com') && <a href={p.link} className={link}>{p.linkLabel ?? 'live site'}</a>}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="font-mono text-xs text-mute mt-4">
          More: <a href="/projects/" className={link}>every project</a>, including Atmos, Forme and Flow.
        </p>
      </section>

      <section aria-labelledby="skills" className="mt-14">
        <h2 id="skills" className={h2}>Skills, and where they’re used</h2>
        <dl className="m-0 flex flex-col gap-4">
          {SKILLS.map((g) => (
            <div key={g.group} className="sm:grid sm:grid-cols-[180px_1fr] gap-4">
              <dt className="font-head text-sm font-semibold text-text">{g.group}</dt>
              <dd className="m-0 mt-1 sm:mt-0 text-sm text-text/85 leading-relaxed">
                {g.items.map(([label, slug], i) => (
                  <span key={label}>
                    {i > 0 && <span className="text-mute"> · </span>}
                    {slug ? <a href={`/projects/${slug}/`} className="text-text underline decoration-mute/50 underline-offset-4 hover:text-signal">{label}</a> : label}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="oss" className="mt-14">
        <h2 id="oss" className={h2}>Open source, in other people’s projects</h2>
        <ul className="list-none p-0 m-0 flex flex-col gap-3">
          {OSS.map((o) => (
            <li key={o.repo} className="text-sm leading-relaxed">
              <a href={o.href} className={`${link} font-mono`}>{o.repo}</a>
              <span className="text-text/85"> · {o.what}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="writing" className="mt-14">
        <h2 id="writing" className={h2}>Writing</h2>
        <ul className="list-none p-0 m-0 flex flex-col gap-2 text-sm">
          {WRITING.map((w) => (
            <li key={w.href}><a href={w.href} className={link}>{w.title}</a></li>
          ))}
        </ul>
      </section>

      <footer className="mt-16 pt-8 border-t border-line">
        <p className="font-head text-lg text-text m-0">Get in touch</p>
        <div className="flex flex-wrap gap-2.5 mt-4">
          <a href={`mailto:${EMAIL}`} className={primary}>{EMAIL}</a>
          <a href="/Manas_resume.pdf" className={secondary}>Resume (PDF)</a>
          <a href={github} className={secondary}>GitHub</a>
        </div>
        <p className="font-mono text-[11px] text-mute mt-8 mb-0">
          Results are as published in each project’s repository, last checked {REVIEWED}. Full detail and limitations are on each case study.
        </p>
      </footer>
    </main>
  );
}
