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
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function runCommand(cmd) {
    setOpen(false);
    if (cmd.href) {
      window.open(cmd.href, '_blank', 'noopener');
    } else if (cmd.section) {
      document.getElementById(cmd.section)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 font-display text-xs text-mute border border-line bg-paper rounded-lg px-3.5 py-2 hover:text-signal hover:border-signal transition-colors"
        aria-label="Open command palette"
      >
        ⌘K
      </button>

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
