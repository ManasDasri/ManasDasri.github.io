import { now } from '@/lib/data';
import Section from './Section';

export default function Now() {
  return (
    <Section id="now" index={2} title="Now" note="what's on my plate this semester">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {now.map((group) => (
          <div key={group.label}>
            <h3 className="font-mono text-xs text-signal mb-3">{group.label}</h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {group.items.map((item) => {
                const label = item.href ? (
                  <a
                    href={item.href}
                    {...(item.href.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                    className="text-text underline decoration-line underline-offset-4 hover:decoration-signal hover:text-signal transition-colors"
                  >
                    {item.text}
                  </a>
                ) : (
                  <span className="text-text">{item.text}</span>
                );
                return (
                  <li key={item.text} className="text-sm leading-relaxed">
                    {label}
                    {item.note && <span className="text-mute">, {item.note}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
