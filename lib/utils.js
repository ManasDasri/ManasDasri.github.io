// Minimal className joiner in the spirit of shadcn's cn() helper —
// skips falsy values, no extra dependency needed (no clsx/tailwind-merge).
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
