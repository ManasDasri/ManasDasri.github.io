'use client';

import { useEffect, useState } from 'react';
import { FiType, FiCheck, FiCrosshair, FiPause, FiPlay, FiRefreshCw, FiShare2, FiShuffle, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { shareColony } from '@/lib/lifeShare';

// Phones have no keyboard shortcuts, so touch devices get the same controls as
// buttons. Each one sends the banner the same 'life' action its key does.
// The banner owns pause/sound state (the terminal and palette can change it
// too), so toggles flip whatever it reports rather than a local copy.
const life = (action, value) => {
  let status;
  window.dispatchEvent(new CustomEvent('life', { detail: { action, value, reply: (s) => (status = s) } }));
  return status;
};

export default function LifeTouchBar() {
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [shared, setShared] = useState(false);
  const sync = (s) => s && (setPaused(s.paused), setSound(s.sound));

  useEffect(() => sync(life('status')), []);

  const buttons = [
    { label: 'Pause', pressed: paused, Icon: paused ? FiPlay : FiPause, onClick: () => sync(life('pause')) },
    { label: 'Reseed', Icon: FiRefreshCw, onClick: () => sync(life('reseed')) },
    { label: 'Next rule', Icon: FiShuffle, onClick: () => sync(life('rule')) },
    { label: 'ASCII view', Icon: FiType, onClick: () => sync(life('view')) },
    { label: 'Drop a glider gun', Icon: FiCrosshair, onClick: () => sync(life('drop', 'gun')) },
    { label: 'Sound', pressed: sound, Icon: sound ? FiVolume2 : FiVolumeX, onClick: () => sync(life('sound')) },
    {
      label: 'Share this colony',
      Icon: shared ? FiCheck : FiShare2,
      onClick: async () => {
        if (await shareColony()) {
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        }
      },
    },
  ];

  return (
    <div role="toolbar" aria-label="Game of Life controls" className="absolute top-3 left-3 z-10 hidden [@media(hover:none)]:flex gap-1 rounded-xl bg-ink/70 backdrop-blur-sm border border-line/80 p-1">
      {buttons.map(({ label, pressed, Icon, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          aria-label={label}
          aria-pressed={pressed}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-mute active:text-signal active:bg-raised"
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
