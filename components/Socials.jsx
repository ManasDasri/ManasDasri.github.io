'use client';

import { socials } from '@/lib/data';
import { SiGithub, SiX, SiLinkedin, SiLeetcode, SiReddit } from 'react-icons/si';
import GithubHoverCard from './GithubHoverCard';
import RedditHoverCard from './RedditHoverCard';
import LeetCodeHoverCard from './LeetCodeHoverCard';
import SocialHoverCard from './SocialHoverCard';

const ICONS = {
  GitHub: SiGithub,
  X: SiX,
  LinkedIn: SiLinkedin,
  LeetCode: SiLeetcode,
  Reddit: SiReddit,
};

export default function Socials() {
  return (
    <div>
      <p className="font-display text-xs text-mute mb-3">// here are my socials</p>
      <div className="flex flex-wrap gap-2.5">
        {socials.map((s) => {
          const Icon = ICONS[s.label];
          const pill = (
            
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-display text-xs text-text border border-line bg-paper rounded-full px-4 py-2 hover:border-signal hover:text-signal transition-colors no-underline"
            >
              {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
              {s.label}
            </a>
          );

          let card;
          if (s.type === 'github') {
            card = <GithubHoverCard username={s.username}>{pill}</GithubHoverCard>;
          } else if (s.type === 'reddit') {
            card = <RedditHoverCard username={s.username}>{pill}</RedditHoverCard>;
          } else if (s.type === 'leetcode') {
            card = <LeetCodeHoverCard username={s.username}>{pill}</LeetCodeHoverCard>;
          } else {
            card = (
              <SocialHoverCard name={s.name} handle={s.handle} note={s.note} avatar={s.avatar}>
                {pill}
              </SocialHoverCard>
            );
          }

          return <span key={s.label}>{card}</span>;
        })}
      </div>
    </div>
  );
}
