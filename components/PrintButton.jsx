'use client';

export default function PrintButton({ className }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Print / save as PDF
    </button>
  );
}
