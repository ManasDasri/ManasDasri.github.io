import Scramble from './Scramble';

export default function SectionHeading({ children, className = 'mb-6' }) {
  return (
    <h2 className={`font-display text-sm text-signal ${className}`}>
      <Scramble text={`// ${children}`} trigger="view" />
      <span className="caret" aria-hidden="true" />
    </h2>
  );
}
