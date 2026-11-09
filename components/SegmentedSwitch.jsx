'use client';

import { useId, useState } from 'react';

// Forme's segmented switch (github.com/ManasDasri/forme, src/registry/segmented-switch):
// native radios behind a spring-eased thumb, so arrow keys and forms just work. Styled in
// app/globals.css (.segmented) with the site's palette.
export default function SegmentedSwitch({ options, label, value, defaultValue, onChange, name, className = '' }) {
  const auto = useId();
  const [own, setOwn] = useState(defaultValue ?? options[0]);
  const current = value ?? own;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`segmented ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, '--seg-count': options.length, '--seg-index': Math.max(0, options.indexOf(current)) }}
    >
      <span className="segmented-thumb" aria-hidden="true" />
      {options.map((option) => (
        <label key={option} data-active={option === current || undefined}>
          <input
            type="radio"
            name={name || auto}
            value={option}
            checked={option === current}
            onChange={() => {
              setOwn(option);
              onChange?.(option);
            }}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
