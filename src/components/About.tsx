import { about } from "@/data";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8 md:pt-36 lg:px-14">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <h2 data-reveal className="display chrome text-[clamp(4.5rem,13vw,10.5rem)]">{about.heading}</h2>

        <div data-words className="glass space-y-4 rounded-[1.75rem] p-6 text-[1.0625rem] leading-relaxed text-bone/85 md:p-10 md:text-lg">
          {about.body.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[60ch]">{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
