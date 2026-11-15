import { certifications, education, experience } from "@/data";

const colTitle = "font-display text-sm font-bold text-mist [font-stretch:125%]";
const row = "border-t border-line py-5";

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="mx-auto max-w-[1440px] px-4 pt-28 md:px-8 md:pt-40 lg:px-14">
      <h2 id="experience-title" data-reveal className="display chrome text-[clamp(2.3rem,8vw,6.5rem)]">
        Experience &amp;<br />education
      </h2>

      <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-14">
        <div>
          <h3 className={colTitle}>Education</h3>
          <ul className="mt-4">
            {education.map((e) => (
              <li key={e.school} className={row}>
                <p className="text-lg font-semibold">{e.degree}</p>
                <p className="mt-1 text-bone/75">{e.school}, {e.place}</p>
                <p className="mt-2 text-sm text-mist">{e.when}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={colTitle}>Experience</h3>
          <ul className="mt-4">
            {experience.map((e) => (
              <li key={e.role + e.org} className={row}>
                <p className="text-lg font-semibold">{e.role}</p>
                <p className="mt-1 text-bone/75">{e.org}</p>
                {e.when && <p className="mt-2 text-sm text-mist">{e.when}</p>}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <h3 className={colTitle}>Certifications</h3>
          <ul className="mt-4">
            {certifications.map((c) => (
              <li key={c.name} className="border-t border-line py-4">
                <p className="font-medium">{c.name}</p>
                <p className="mt-1 text-sm text-mist">{c.issuer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
