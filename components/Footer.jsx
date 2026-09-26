import Scramble from './Scramble';

export default function Footer() {
  return (
    <footer className="text-center px-6 py-24 border-t border-line/60">
      <p className="font-head text-2xl sm:text-3xl font-semibold tracking-tight max-w-xl mx-auto mb-4 text-balance">
        <Scramble text="“You have power over your mind - not outside events.”" trigger="view" duration={1400} />
      </p>
      <p className="font-mono text-xs text-mute">Marcus Aurelius</p>
    </footer>
  );
}
