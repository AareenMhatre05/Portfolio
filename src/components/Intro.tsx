"use client";

// Intro (frames 01-04): a ball drops, the first name falls in, morphs into the hero word,
// then slides onto the real hero word so the hand-off has no jump. Whether it plays is
// decided by the inline script in layout.tsx (data-intro="play" on <html>).
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { site } from "@/data";

declare global {
  interface Window { __introFailsafe?: ReturnType<typeof setTimeout> }
}

const NAME = site.name.split(" ")[0].toUpperCase();
const WORD = site.heroWord;
const SLOTS = Math.max(NAME.length, WORD.length);
// Same type classes as the hero <h1>, so size and gradient match exactly at the hand-off.
const TYPE = "display uppercase whitespace-nowrap text-[min(12.3vw,11.2rem)]";

// Box of the glyphs themselves (not the element), so both words are compared like for like.
const textRect = (el: Element) => {
  const r = document.createRange();
  r.selectNodeContents(el.lastChild!);
  return r.getBoundingClientRect();
};

export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const root = ref.current;
    const hero = document.querySelector("#top h1");
    if (html.dataset.intro !== "play" || !root || !hero) return;
    clearTimeout(window.__introFailsafe); // we're running, so the failsafe isn't needed
    window.scrollTo(0, 0);

    let alive = true, finished = false;
    const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root);
    const lettersRow = root.querySelector("[data-letters]");
    const final = root.querySelector("[data-final]")!;
    const ball = root.querySelector("[data-ball]");

    const done = () => {
      if (finished) return;
      finished = true;
      html.removeAttribute("data-intro"); // hides the overlay and unlocks scrolling
      dispatchEvent(new Event("intro:done")); // starts Lenis and the hero particles
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, onComplete: done });
      tl.fromTo(ball, { opacity: 1, xPercent: -50, y: () => -innerHeight * 0.6 }, { y: 0, duration: 0.9, ease: "bounce.out" }, 0.15)
        .fromTo(
          letters.slice(0, NAME.length),
          { opacity: 1, y: () => -innerHeight * 0.8, rotation: () => gsap.utils.random(-28, 28) },
          { y: 0, rotation: 0, duration: 0.8, ease: "bounce.out", stagger: 0.07 },
          0.75,
        )
        .to(ball, { scale: 0, opacity: 0, duration: 0.3 }, 1.6);

      // Morph letter by letter: each slot flips over and comes back as the next word's letter.
      letters.forEach((el, i) => {
        const at = 1.9 + i * 0.08;
        tl.to(el, { rotationX: 90, duration: 0.12, ease: "power1.in" }, at)
          .call(() => { el.textContent = WORD[i] ?? ""; }, undefined, at + 0.12)
          .fromTo(el, { rotationX: -90, opacity: 1 }, { rotationX: 0, duration: 0.14, ease: "power1.out", immediateRender: false }, at + 0.12);
      });

      // Swap the split letters for one unsplit word (true kerning, same as the hero), then slide onto the hero word.
      tl.set(final, { opacity: 1 }, 2.85)
        .set(lettersRow, { opacity: 0 }, 2.85)
        .to(final, {
          x: () => textRect(hero).left - textRect(final).left,
          y: () => textRect(hero).top - textRect(final).top,
          duration: 0.75,
          ease: "power3.inOut",
        }, 2.9)
        // The overlay fades over an identical word underneath, revealing the navbar and the rest of the hero.
        .to(root, { opacity: 0, duration: 0.5, ease: "power1.out" }, 3.65);

      // Fonts must be ready before anything is measured or laid out.
      document.fonts.ready.then(() => { if (alive) tl.play(); });

      const skip = () => {
        if (finished) return;
        tl.kill();
        gsap.to(root, { opacity: 0, duration: 0.3, onComplete: done });
      };
      root.addEventListener("click", skip);
      addEventListener("keydown", skip);
      return () => {
        root.removeEventListener("click", skip);
        removeEventListener("keydown", skip);
      };
    }, root);

    return () => {
      alive = false;
      ctx.revert();
    };
  }, []);

  return (
    <div ref={ref} className="intro fixed inset-0 z-[60] place-items-center bg-[radial-gradient(circle_at_50%_50%,#202226_0%,#050506_55%,#000_100%)]">
      <div aria-hidden className="relative grid place-items-center">
        <p data-letters className={`${TYPE} [grid-area:1/1] [perspective:800px]`}>
          {Array.from({ length: SLOTS }, (_, i) => (
            <span key={i} data-letter className="chrome inline-block">{NAME[i] ?? ""}</span>
          ))}
        </p>
        <p data-final className={`${TYPE} chrome [grid-area:1/1]`}>{WORD}</p>
        <span data-ball className="absolute top-full left-1/2 mt-3 size-[clamp(14px,2vw,28px)] rounded-full bg-bone" />
      </div>
      <button type="button" className="pill pill-ghost fixed right-4 bottom-4 bg-ink/60 text-sm md:right-6 md:bottom-6">
        Skip intro
      </button>
    </div>
  );
}
