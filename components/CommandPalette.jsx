'use client';

import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { commands } from '@/lib/data';
import { THEME_ORDER } from '@/lib/themes';
import { setTheme, themeName } from './Daylight';

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
    // Child terminal/banner effects are ready after the current commit.
    const pending = setTimeout(() => {
      if (location.pathname !== '/') return;
      try {
        const cmd = JSON.parse(sessionStorage.getItem('portfolio-command'));
        sessionStorage.removeItem('portfolio-command');
        if (cmd?.life || cmd?.terminal) runCommand(cmd);
      } catch {}
    }, 0);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-palette', openPalette);
    return () => {
      clearTimeout(pending);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-palette', openPalette);
    };
  }, []);

  function runCommand(cmd) {
    setOpen(false);
    if (cmd.theme) {
      setTheme(cmd.theme);
    } else if (cmd.desktop) {
      if (location.pathname === '/') window.dispatchEvent(new Event('startx'));
      else location.href = '/?startx';
    } else if (cmd.life) {
      if (location.pathname !== '/') {
        sessionStorage.setItem('portfolio-command', JSON.stringify(cmd));
        location.href = '/#top';
      } else {
        window.dispatchEvent(new CustomEvent('life', { detail: cmd.life }));
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    } else if (cmd.terminal) {
      const terminal = document.getElementById('terminal');
      if (!terminal) {
        sessionStorage.setItem('portfolio-command', JSON.stringify(cmd));
        location.href = '/#building';
      } else {
        terminal.closest('details')?.setAttribute('open', '');
        terminal.scrollIntoView({ behavior: 'auto', block: 'center' });
        window.dispatchEvent(new CustomEvent('terminal-run', { detail: cmd.terminal }));
      }
    } else if (cmd.href?.startsWith('/')) {
      window.location.href = cmd.href;
    } else if (cmd.href) {
      window.open(cmd.href, '_blank', 'noopener');
    } else if (cmd.section) {
      if (location.pathname !== '/') location.href = `/#${cmd.section}`;
      else {
        const section = document.getElementById(cmd.section);
        if (cmd.section === 'activity') section?.querySelector('details')?.setAttribute('open', '');
        section?.scrollIntoView({ behavior: 'auto' });
      }
    }
  }

  return (
    <>
      <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette">
        <Command.Input placeholder="Search for a command…" />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          {[...commands, ...THEME_ORDER.map((theme) => ({ label: `Theme: ${themeName(theme)}`, theme }))].map((cmd) => (
            <Command.Item key={cmd.label} onSelect={() => runCommand(cmd)}>
              {cmd.label}
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
