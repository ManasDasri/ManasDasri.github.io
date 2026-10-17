'use client';

import { useEffect, useRef, useState } from 'react';
import Section, { InTab } from './Section';

// One section holding several smaller ones behind tabs. Each tab's id still works as
// a link (/#log opens the Log tab and scrolls to it). Panels stay mounted, so a tab's
// live data loads once and switching is instant.
export default function TabbedSection({ id, index, title, tabs }) {
  const [active, setActive] = useState(tabs[0].id);
  const buttons = useRef({});

  useEffect(() => {
    const open = () => {
      const tab = tabs.find((t) => `#${t.id}` === window.location.hash);
      if (!tab) return;
      setActive(tab.id);
      document.getElementById(id)?.scrollIntoView();
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, [id, tabs]);

  // arrow keys move between tabs, as screen-reader users expect
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === active);
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const next = tabs[(i + d + tabs.length) % tabs.length].id;
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <Section id={id} index={index} title={title} note={tabs.find((t) => t.id === active).note}>
      <div role="tablist" aria-label={title} onKeyDown={onKey} className="flex flex-wrap gap-1 p-1 mb-8 w-fit rounded-lg border border-line bg-paper">
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => (buttons.current[t.id] = el)}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            className={`font-mono text-xs px-3 py-1.5 rounded-md transition-colors ${
              active === t.id ? 'bg-raised text-signal' : 'text-mute hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <InTab.Provider value={true}>
        {tabs.map((t) => (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id}>
            {t.content}
          </div>
        ))}
      </InTab.Provider>
    </Section>
  );
}
