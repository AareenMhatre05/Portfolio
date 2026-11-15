import { contact, site } from "@/data";
import { Download, GitHub, LinkedIn, Mail } from "./icons";

const label = "text-xs tracking-[0.18em] text-mist";

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="mt-28 bg-[radial-gradient(ellipse_70%_60%_at_30%_40%,#15171b_0%,transparent_70%)] py-24 md:mt-40 md:py-36"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-14">
        <div>
          <p className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm">
            <span className="size-2 rounded-full bg-sand" aria-hidden />
            {contact.status}
          </p>
          <h2 id="contact-title" data-reveal className="display chrome mt-6 text-[clamp(3.2rem,7vw,5.5rem)]">
            {contact.heading}
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-bone/80">{contact.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${site.email}`} className="pill pill-solid">
              Email me <Mail />
            </a>
            <a href={site.resume} download className="pill pill-ghost">
              Download resume <Download />
            </a>
          </div>
        </div>

        <dl className="glass divide-y divide-line rounded-[1.75rem]">
          <div className="p-6 md:p-8">
            <dt className={label}>Email</dt>
            <dd className="mt-2 break-all text-lg">
              <a href={`mailto:${site.email}`} className="hover:text-sand">{site.email}</a>
            </dd>
          </div>
          <div className="p-6 md:p-8">
            <dt className={label}>Based in</dt>
            <dd className="mt-2 text-lg">{site.location}</dd>
          </div>
          <div className="p-6 md:p-8">
            <dt className={label}>Elsewhere</dt>
            <dd className="mt-4 flex gap-3">
              <a href={site.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-11 place-items-center rounded-full border border-white/18 hover:border-bone">
                <LinkedIn />
              </a>
              <a href={site.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-11 place-items-center rounded-full border border-white/18 hover:border-bone">
                <GitHub />
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
