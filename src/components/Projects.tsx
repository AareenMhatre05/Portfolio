import Image from "next/image";
import { projects, projectsIntro, site, type Project } from "@/data";
import { ArrowUpRight, GitHub } from "./icons";

function Media({ p }: { p: Project }) {
  const panel =
    "relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.75rem] border border-line bg-[radial-gradient(ellipse_70%_60%_at_50%_35%,#1b1e23_0%,#0b0c0f_75%)]";

  const { src, alt, width, height, kind } = p.image;
  return (
    <div className={panel}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 1024px) 45vw, 92vw"
        className={
          // absolute: percentage heights don't resolve on a grid child, but do against the relative panel
          kind === "phone"
            ? "absolute top-[7%] left-1/2 h-[86%] w-auto -translate-x-1/2 rounded-[1.4rem] border-4 border-[#1f2227] shadow-2xl shadow-black/60"
            : "absolute top-[9%] left-[7%] h-[82%] w-[86%] rounded-lg object-cover object-left-top shadow-2xl shadow-black/60"
        }
      />
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-40 lg:px-14">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
        <h2 id="projects-title" data-reveal className="text-[clamp(3.4rem,8vw,6.5rem)] leading-[0.9]">
          <span className="display chrome">Selected</span>{" "}
          <span className="font-serif text-bone/90">work</span>
        </h2>
        <div className="lg:justify-self-end">
          <p className="max-w-[46ch] text-lg leading-relaxed text-mist">{projectsIntro}</p>
          <a href={site.links.github} target="_blank" rel="noreferrer" className="pill pill-solid mt-6">
            All repositories <ArrowUpRight />
          </a>
        </div>
      </div>

      <ol className="mt-20 space-y-24 md:mt-28 md:space-y-36">
        {projects.map((p, i) => (
          <li key={p.title} data-project className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div data-project-media className={i % 2 ? "lg:order-2" : ""}>
              <Media p={p} />
            </div>

            <div data-project-text>
              <h3 className="display chrome text-[clamp(2rem,3.6vw,3.25rem)]">{p.title}</h3>
              <p className="mt-6 max-w-[60ch] text-[1.0625rem] leading-relaxed text-mist">{p.summary}</p>

              <ul aria-label="Built with" className="mt-6 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-full border border-line px-3 py-1 text-sm text-bone/75">{s}</li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer" className="pill pill-solid">
                    Live site <ArrowUpRight />
                  </a>
                )}
                {p.github ? (
                  <a href={p.github} target="_blank" rel="noreferrer" className="pill pill-ghost">
                    GitHub <GitHub />
                  </a>
                ) : (
                  <p className="text-sm text-mist">Private repository</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
