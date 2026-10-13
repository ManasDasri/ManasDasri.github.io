import { skills } from '@/lib/data';
import Section from './Section';

export default function Skills() {
  return (
    <Section id="skills" index={4} title="Stack">
      <div className="flex flex-col">
        {skills.map((group) => (
          <div key={group.group} className="sm:grid sm:grid-cols-[150px_1fr] gap-4 py-4 border-b border-line/60 first:pt-0 last:border-none">
            <h3 className="font-mono text-xs text-mute mb-2.5 sm:mb-0 sm:pt-2">{group.group}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className="group font-display text-xs border border-line bg-paper rounded-md px-3 py-1.5 flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-[0_8px_24px_-10px_rgb(var(--c-signal)_/_0.6)]"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-mute transition-colors group-hover:text-signal" aria-hidden="true" />}
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
