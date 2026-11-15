import { nav, site } from "@/data";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8 lg:px-14">
        <a href="#top" className="font-display text-[0.95rem] font-extrabold tracking-[0.08em] [font-stretch:125%]">
          {site.name}
        </a>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-8 text-sm text-bone/80">
            {nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} data-nav className="nav-link hover:text-bone">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* No-JS mobile menu */}
        <details data-menu className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-white/15 px-4 py-2 text-sm [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav aria-label="Main" className="glass absolute right-0 mt-3 w-52 rounded-2xl bg-ink/95 p-2">
            <ul>
              {nav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    data-nav
                    className="block rounded-xl px-4 py-3 text-bone/85 hover:bg-white/5 hover:text-bone aria-[current=true]:bg-white/5 aria-[current=true]:text-bone"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>

      {/* Scroll progress line, scaled by Motion.tsx; hidden without JS. */}
      <span data-progress aria-hidden className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-bone/60" />
    </header>
  );
}
