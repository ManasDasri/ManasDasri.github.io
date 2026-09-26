import { skills } from '@/lib/data';
import SectionHeading from './SectionHeading';

export default function Skills() {
  return (
    <section id="skills" className="max-w-3xl mx-auto px-6 py-16">
      <SectionHeading>stack</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
        {skills.map((group) => (
          <div key={group.group}>
            <h3 className="font-display text-xs text-mute mb-3">{group.group}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className="group font-display text-xs border border-line bg-paper rounded-md px-3 py-1.5 flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-[0_8px_24px_-10px_rgba(79,209,165,0.6)]"
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
    </section>
  );
}
