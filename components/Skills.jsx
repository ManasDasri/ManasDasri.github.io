import { skills } from '@/lib/data';

export default function Skills() {
  return (
    <section id="skills" className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="font-display text-sm text-signal mb-6">// stack</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
        {skills.map((group) => (
          <div key={group.group}>
            <h3 className="font-display text-xs text-mute mb-3">{group.group}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="font-display text-xs border border-line bg-paper rounded-md px-3 py-1.5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
