import { skillGroups } from "@/data";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="mx-auto max-w-[1440px] px-4 pt-20 md:px-8 md:pt-28 lg:px-14">
      <div className="flex items-center gap-4">
        <h2 id="skills-title" className="text-sm text-mist">Stack</h2>
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* Static rows for now; Phase 2 turns each row into a marquee. */}
      <dl data-marquee className="mt-8 space-y-5">
        {skillGroups.map((g) => (
          <div key={g.label} className="grid gap-3 md:grid-cols-[10rem_1fr] md:items-center">
            <dt className="text-sm text-mist">{g.label}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2.5">
                {g.items.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-[0.9375rem]"
                  >
                    <span className="size-1 rounded-full bg-mist" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
