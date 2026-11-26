'use client';

import { useState } from 'react';
import DocLink from './DocLink';
import Socials from './Socials';

const EMAIL = 'dasarimanas049@gmail.com';

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
    <section id="contact" className="wrap section contact">
      <header className="section-head">
        <h2>Contact</h2>
        <p>Internships, research, or a model you need built. Email reaches me fastest.</p>
      </header>
      <a href={`mailto:${EMAIL}`} className="contact-mail">{EMAIL}</a>
      <div className="contact-tools">
        <button onClick={copy} className="btn" aria-live="polite">{copied ? 'Copied' : 'Copy address'}</button>
        <DocLink doc="resume" className="btn">Résumé</DocLink>
      </div>
      <p className="contact-studio">
        Need a model built or evaluated for a team?{' '}
        <a href="https://gradientworksai.in/" target="_blank" rel="noopener noreferrer">Gradient Works</a>, my applied AI
        studio, does fixed-scope builds with a written result.
      </p>
      <Socials />
    </section>
  );
}
