import { site } from "@/data";
import { ArrowDownRight, Download } from "./icons";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end overflow-hidden bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,#16181c_0%,transparent_70%)] pb-10 md:pb-14"
    >
      {/* Upper area stays empty: the Phase 2 particle portrait renders here. */}
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-14">
        <h1 className="display chrome -ml-[0.04em] text-[min(12.3vw,11.2rem)] uppercase">
          <span className="sr-only">{site.name}, </span>
          {site.heroWord}
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[clamp(1.35rem,2.6vw,2.1rem)] leading-tight">
            <span className="font-semibold">{site.role.plain}</span>{" "}
            <span className="font-serif text-bone/75">{site.role.italic}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#about"
              aria-label="Skip to About"
              className="grid size-11 place-items-center rounded-full border border-white/18 hover:border-bone"
            >
              <ArrowDownRight className="size-4" />
            </a>
            <a href="#contact" className="pill pill-ghost">Contact</a>
            <a href={site.resume} download className="pill pill-solid">
              Download resume <Download />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
