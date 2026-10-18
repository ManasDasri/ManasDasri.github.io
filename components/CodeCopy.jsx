'use client';

import { useEffect } from 'react';

// Adds a language label and a copy button to every code block in a post.
export default function CodeCopy() {
  useEffect(() => {
    const blocks = [...document.querySelectorAll('.post-body pre')];
    for (const pre of blocks) {
      if (pre.querySelector('.code-tools')) continue;
      const lang = pre.querySelector('code')?.className.match(/language-(\w+)/)?.[1];
      const bar = document.createElement('div');
      bar.className = 'code-tools';
      if (lang) bar.append(Object.assign(document.createElement('span'), { textContent: lang }));
      const btn = Object.assign(document.createElement('button'), { type: 'button', textContent: 'copy' });
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
          btn.textContent = 'copied ✓';
          setTimeout(() => (btn.textContent = 'copy'), 1600);
        } catch {}
      });
      bar.append(btn);
      pre.prepend(bar);
    }
  }, []);
  return null;
}
