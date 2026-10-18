'use client';

import { useState } from 'react';
import { status } from '@/lib/data';
import Section from './Section';
import Socials from './Socials';

const EMAIL = 'dasarimanas049@gmail.com';

// The last stop before the footer: availability, email (with a copy button), résumé, socials.
export default function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <Section id="contact" index={7} title="Contact" note="email is the fastest way to reach me">
      {status && <p className="font-head text-2xl sm:text-3xl font-semibold tracking-tight text-text m-0">{status[0].toUpperCase() + status.slice(1)}.</p>}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <a href={`mailto:${EMAIL}`} className="font-mono text-sm sm:text-base text-signal underline decoration-signal/40 underline-offset-4 hover:decoration-signal">
          {EMAIL}
        </a>
        <button
          onClick={copy}
          className="font-mono text-xs text-mute border border-line rounded-md px-2.5 py-1 hover:text-signal hover:border-signal transition-colors"
          aria-live="polite"
        >
          {copied ? 'copied ✓' : 'copy'}
        </button>
        <a
          href="/Manas_resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-mute border border-line rounded-md px-2.5 py-1 no-underline hover:text-signal hover:border-signal transition-colors"
        >
          résumé (PDF) ↗
        </a>
      </div>
      <div className="mt-8">
        <Socials />
      </div>
    </Section>
  );
}
