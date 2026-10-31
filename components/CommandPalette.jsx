'use client';

import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { commands } from '@/lib/data';
import { toggleMotion } from './KoiPond';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    const openPalette = () => setOpen(true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-palette', openPalette);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-palette', openPalette);
    };
  }, []);

  function runCommand(cmd) {
    setOpen(false);
    if (cmd.motion) {
      toggleMotion();
    } else if (cmd.terminal) {
      // the terminal lives on Sprout's page
      const term = document.getElementById('terminal');
      if (!term) return (location.href = '/projects/sprout/#try');
      term.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.dispatchEvent(new CustomEvent('terminal-run', { detail: cmd.terminal }));
    } else if (cmd.href?.startsWith('/')) {
      window.location.href = cmd.href;
    } else if (cmd.href) {
      window.open(cmd.href, '_blank', 'noopener');
    } else if (cmd.section) {
      // via the hash, so tabbed sections (Log, Pull requests) open the right tab; the
      // sections are on the homepage
      if (location.pathname === '/') window.location.hash = cmd.section;
      else location.href = `/#${cmd.section}`;
    }
  }

  return (
    <>
      <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette">
        <Command.Input placeholder="Search for a command…" />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          {commands.map((cmd) => (
            <Command.Item key={cmd.label} onSelect={() => runCommand(cmd)}>
              {cmd.label}
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
