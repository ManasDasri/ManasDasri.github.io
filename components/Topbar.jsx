export default function Topbar() {
  return (
    <header className="flex justify-between items-center px-6 sm:px-[6vw] py-7 relative z-20">
      <span className="font-display font-bold text-signal tracking-wide">M_</span>
      <nav className="flex">
        {['about', 'building', 'skills', 'activity', 'writing'].map((s) => (
          <a
            key={s}
            href={`#${s}`}
            className="font-display text-xs sm:text-sm text-mute hover:text-text ml-5 sm:ml-7 no-underline"
          >
            {s}
          </a>
        ))}
      </nav>
    </header>
  );
}
