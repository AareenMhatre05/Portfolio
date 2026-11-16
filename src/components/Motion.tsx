"use client";

// All Phase 2 motion. Sections stay server-rendered static HTML; this only enhances
// them, so the site works unchanged if JS fails. Effects with movement run only under
// prefers-reduced-motion: no-preference.
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

type Cleanup = () => void;

// 1. Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync.
function smoothScroll(): Cleanup {
  // anchors: in-page links scroll smoothly; Lenis honours scroll-margin-top for the sticky nav.
  const lenis = new Lenis({ anchors: true, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  // Scroll stays locked while the intro plays.
  const resume = () => lenis.start();
  if (document.documentElement.dataset.intro === "play") {
    lenis.stop();
    addEventListener("intro:done", resume, { once: true });
  }
  return () => {
    removeEventListener("intro:done", resume);
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}

// 2. Navbar: mark the link for the section in view, and grow the progress line with scroll.
function navState(): Cleanup {
  const links = gsap.utils.toArray<HTMLAnchorElement>("[data-nav]");
  const sections = [...new Set(links.map((a) => a.hash))]
    .map((hash) => document.querySelector<HTMLElement>(hash))
    .filter((el): el is HTMLElement => el !== null);

  sections.forEach((section, i) => {
    const next = sections[i + 1];
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      // Each link stays active until the next nav section arrives (About covers Stack too).
      // The last one ends when its bottom leaves the top, which max scroll never reaches.
      endTrigger: next ?? section,
      end: next ? "top center" : "bottom top",
      onToggle: ({ isActive }) =>
        links
          .filter((a) => a.hash === `#${section.id}`)
          .forEach((a) => (isActive ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"))),
    });
  });

  gsap.fromTo("[data-progress]", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  // Close the mobile menu once a link is picked.
  const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
  const close = () => menu?.removeAttribute("open");
  links.forEach((a) => a.addEventListener("click", close));
  return () => links.forEach((a) => a.removeEventListener("click", close));
}

// 3. About card: each word brightens from 20% to full opacity as the card scrolls through.
function wordReveal() {
  const card = document.querySelector("[data-words]");
  if (!card) return;
  const { words } = SplitText.create(card.querySelectorAll("p"), { type: "words", tag: "span" });
  gsap.fromTo(words, { opacity: 0.2 }, {
    opacity: 1,
    ease: "none",
    stagger: 0.1,
    scrollTrigger: { trigger: card, start: "top 75%", end: "bottom 45%", scrub: true },
  });
}

// 4. Stack rows become endless marquees: alternate direction, edge fade (CSS), pause on hover.
function marquees(contextSafe: (fn: () => void) => () => void): Cleanup {
  const list = document.querySelector<HTMLElement>("[data-marquee]");
  if (!list) return () => {};
  const undo: Cleanup[] = [];

  list.querySelectorAll<HTMLElement>("dd").forEach((row, i) => {
    const track = row.querySelector("ul")!;
    const originals = Array.from(track.children);
    row.classList.add("marquee");
    const copy = (nodes: Element[]) =>
      nodes.forEach((n) => {
        const c = n.cloneNode(true) as HTMLElement;
        c.setAttribute("aria-hidden", "true"); // screen readers hear each skill once
        c.dataset.clone = "";
        track.appendChild(c);
      });

    // One "set" must be at least as wide as the row; then a second identical set loops seamlessly.
    while (track.offsetWidth < row.clientWidth) copy(originals);
    const setSize = track.children.length;
    copy(Array.from(track.children));
    const distance = (track.children[setSize] as HTMLElement).offsetLeft - (track.children[0] as HTMLElement).offsetLeft;

    // xPercent -50 = exactly one set (the track's right padding equals the gap), so a late font swap can't cause a jump.
    const leftward = i % 2 === 0;
    const loop = gsap.fromTo(track, { xPercent: leftward ? 0 : -50 }, {
      xPercent: leftward ? -50 : 0,
      duration: distance / 40, // ~40px per second
      ease: "none",
      repeat: -1,
      paused: true,
    });
    // Only run while the Stack is on screen.
    ScrollTrigger.create({ trigger: list, start: "top bottom", end: "bottom top", onToggle: ({ isActive }) => (isActive ? loop.resume() : loop.pause()) });

    const slow = contextSafe(() => gsap.to(loop, { timeScale: 0, duration: 0.4, overwrite: true }));
    const go = contextSafe(() => gsap.to(loop, { timeScale: 1, duration: 0.4, overwrite: true }));
    row.addEventListener("mouseenter", slow);
    row.addEventListener("mouseleave", go);

    undo.push(() => {
      row.removeEventListener("mouseenter", slow);
      row.removeEventListener("mouseleave", go);
      row.classList.remove("marquee");
      track.querySelectorAll("[data-clone]").forEach((c) => c.remove());
    });
  });
  return () => undo.forEach((fn) => fn());
}

// 5. What I do: rows open and close with an animated height; the arrow turns with them.
// (Hover fill is a CSS colour transition in Services.tsx.) Without JS the native <details> still works.
function accordion(contextSafe: (fn: (e: Event) => void) => (e: Event) => void): Cleanup {
  const rows = gsap.utils.toArray<HTMLDetailsElement>("#what-i-do details");
  const group = rows[0]?.getAttribute("name");
  // We run exclusivity ourselves so the row that closes can animate too.
  rows.forEach((d) => d.removeAttribute("name"));

  const toggle = (d: HTMLDetailsElement, open: boolean) => {
    const body = d.querySelector<HTMLElement>("[data-service-body]")!;
    const arrow = d.querySelector(".service-arrow");
    d.dataset.state = open ? "open" : "closed";
    gsap.to(arrow, { rotation: open ? -90 : 0, duration: 0.45, ease: "power3.out", overwrite: true });
    if (open) {
      if (!d.open) {
        d.open = true;
        gsap.set(body, { height: 0 });
      }
      gsap.to(body, { height: "auto", duration: 0.55, ease: "power3.inOut", overwrite: true, clearProps: "height" });
    } else {
      gsap.to(body, {
        height: 0,
        duration: 0.45,
        ease: "power3.inOut",
        overwrite: true,
        onComplete: () => {
          d.open = false;
          gsap.set(body, { clearProps: "height" });
        },
      });
    }
  };

  const onClick = contextSafe((e: Event) => {
    e.preventDefault();
    const d = (e.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
    const opening = (d.dataset.state ?? (d.open ? "open" : "closed")) !== "open";
    if (opening) rows.filter((r) => r !== d && (r.dataset.state ?? (r.open ? "open" : "closed")) === "open").forEach((r) => toggle(r, false));
    toggle(d, opening);
  });
  const summaries = rows.map((d) => d.querySelector("summary")!);
  summaries.forEach((s) => s.addEventListener("click", onClick));

  return () => {
    summaries.forEach((s) => s.removeEventListener("click", onClick));
    rows.forEach((d) => {
      delete d.dataset.state;
      if (group) d.setAttribute("name", group);
    });
  };
}

// 6. Projects: media slides in from its own side, then the text rises in.
function projectRows(desktop: boolean) {
  gsap.utils.toArray<HTMLElement>("[data-project]").forEach((row, i) => {
    const media = row.querySelector("[data-project-media]");
    const text = row.querySelector("[data-project-text]")!;
    // Horizontal slides only on desktop, where media and text sit side by side.
    const fromSide = desktop ? { x: i % 2 ? 80 : -80 } : { y: 50 };
    gsap
      .timeline({ scrollTrigger: { trigger: row, start: "top 80%" }, defaults: { ease: "power3.out" } })
      .from(media, { ...fromSide, autoAlpha: 0, duration: 1.1 })
      .from(text.children, { y: 36, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, "<0.2");
  });
}

// 7. Section headings rise and fade in as they enter.
function headingReveals() {
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((h) =>
    gsap.from(h, { y: 70, autoAlpha: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 88%" } }),
  );
}

export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const mm = gsap.matchMedia();

    // Always on: these show state (where you are), not motion.
    mm.add("all", () => navState());

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" }, (ctx, contextSafe) => {
      if (!ctx.conditions?.motion) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- GSAP types contextSafe as returning Function
      const safe = contextSafe as any;
      // No pinning anywhere, so ScrollTrigger creation order doesn't affect layout.
      const cleanups = [smoothScroll()];
      wordReveal();
      cleanups.push(marquees(safe));
      cleanups.push(accordion(safe));
      projectRows(!!ctx.conditions.desktop);
      headingReveals();
      return () => cleanups.forEach((fn) => fn());
    });

    return () => mm.revert();
  }, []);

  return null;
}
