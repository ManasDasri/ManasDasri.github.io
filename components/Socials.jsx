'use client';

import { socials } from '@/lib/data';
import GithubHoverCard from './GithubHoverCard';
import RedditHoverCard from './RedditHoverCard';
import LeetCodeHoverCard from './LeetCodeHoverCard';
import SocialHoverCard from './SocialHoverCard';

export default function Socials() {
  return (
    <section className="text-center px-6 pb-16 font-display text-sm text-mute overflow-visible">
      {socials.map((s, i) => {
        const link = (
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-signal no-underline hover:no-underline"
          >
            {s.label}
          </a>
        );

        let card;
        if (s.type === 'github') {
          card = <GithubHoverCard username={s.username}>{link}</GithubHoverCard>;
        } else if (s.type === 'reddit') {
          card = <RedditHoverCard username={s.username}>{link}</RedditHoverCard>;
        } else if (s.type === 'leetcode') {
          card = <LeetCodeHoverCard username={s.username}>{link}</LeetCodeHoverCard>;
        } else {
          card = (
            <SocialHoverCard name={s.name} handle={s.handle} note={s.note} avatar={s.avatar}>
              {link}
            </SocialHoverCard>
          );
        }

        return (
          <span key={s.label}>
            {card}
            {i < socials.length - 1 && <span className="mx-3 text-line">·</span>}
          </span>
        );
      })}
    </section>
  );
}
