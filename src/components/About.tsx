import Image from "next/image";
import { about } from "@/data";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-[1440px] px-4 pt-24 md:px-8 md:pt-36 lg:px-14">
      <h2 data-reveal className="display chrome text-[clamp(4.5rem,13vw,10.5rem)]">{about.heading}</h2>

      {/* Desktop: one row, photo beside the text card, tops aligned and the photo stretched to the card's height
          (cropped to fit, kept on the face). Phones: the photo stacks above the text at its own 4:5 ratio. */}
      <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[20rem_1fr] lg:gap-8">
        <div className="relative aspect-[550/688] w-full max-w-[22rem] overflow-hidden rounded-[1.75rem] border border-line lg:aspect-auto lg:max-w-none">
          <Image
            src={about.photo.src}
            alt={about.photo.alt}
            fill
            sizes="(min-width: 1024px) 20rem, (min-width: 768px) 22rem, calc(100vw - 2rem)"
            className="object-cover object-[50%_30%]"
          />
        </div>

        <div data-words className="glass space-y-4 rounded-[1.75rem] p-6 text-[1.0625rem] leading-relaxed text-bone/85 md:p-10 md:text-lg">
          {about.body.map((p) => (
            <p key={p.slice(0, 24)} className="max-w-[60ch]">{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
