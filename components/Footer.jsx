import Scramble from './Scramble';

export default function Footer() {
  return (
    <footer className="text-center px-6 py-20">
      <p className="font-display text-base max-w-lg mx-auto mb-2.5">
        <Scramble text="“You have power over your mind - not outside events.”" trigger="view" duration={1400} />
      </p>
      <p className="font-display text-xs text-mute tracking-wide">— MARCUS AURELIUS</p>
    </footer>
  );
}
