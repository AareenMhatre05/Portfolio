import { services } from "@/data";
import { ArrowDownRight } from "./icons";

export default function Services() {
  return (
    <section id="what-i-do" aria-labelledby="what-i-do-title" className="pt-28 md:pt-40">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-14">
        <h2 id="what-i-do-title" data-reveal className="display chrome text-right text-[clamp(3.6rem,10vw,8.5rem)]">
          What I<br />do
        </h2>
      </div>

      <div className="mt-12 border-b border-line md:mt-16">
        {services.map((s, i) => (
          // `name` makes the rows an exclusive accordion: opening one closes the other.
          <details key={s.title} name="services" open={i === 0} className="service group border-t border-line">
            <summary className="cursor-pointer list-none transition-colors duration-300 motion-reduce:transition-none hover:bg-sand hover:text-ink group-open:bg-sand group-open:text-ink">
              <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-4 py-6 md:gap-12 md:px-8 md:py-8 lg:px-14">
                <span className="w-8 text-xl tabular-nums md:w-12 md:text-2xl">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="flex-1 font-display text-lg font-extrabold [font-stretch:125%] md:text-2xl">{s.title}</h3>
                <ArrowDownRight className="service-arrow size-6" />
              </div>
            </summary>

            <div data-service-body className="overflow-hidden bg-sand text-ink">
              <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-10 md:grid-cols-2 md:gap-12 md:px-8 md:pl-[calc(2rem+3rem+3rem)] lg:px-14 lg:pl-[calc(3.5rem+3rem+3rem)]">
                <ul className="space-y-2.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3 text-ink/80">
                      <span className="mt-[0.55em] size-1.5 shrink-0 bg-ink/70" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="max-w-[52ch] text-lg leading-relaxed text-ink/80">{s.description}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
