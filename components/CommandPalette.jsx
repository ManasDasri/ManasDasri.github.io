'use client';

import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { commands } from '@/lib/data';

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
    if (cmd.life) {
      window.dispatchEvent(new CustomEvent('life', { detail: cmd.life }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (cmd.terminal) {
      document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.dispatchEvent(new CustomEvent('terminal-run', { detail: cmd.terminal }));
    } else if (cmd.href?.startsWith('/')) {
      window.location.href = cmd.href;
    } else if (cmd.href) {
      window.open(cmd.href, '_blank', 'noopener');
    } else if (cmd.section) {
      document.getElementById(cmd.section)?.scrollIntoView({ behavior: 'smooth' });
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
