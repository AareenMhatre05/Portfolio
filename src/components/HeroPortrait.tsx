"use client";

// Hero particles (frames 05-08): a starfield that gathers into a portrait sampled from
// the photo, scatters from the pointer and drifts back. Runs only while the hero is on
// screen. Reduced motion, no canvas or no JS show a static dimmed photo instead.
import Image from "next/image";
import { useEffect, useRef } from "react";
import { portrait } from "@/data";

type P = { x: number; y: number; vx: number; vy: number; sx: number; sy: number; hx: number; hy: number; a: number; ha: number; delay: number; tw: number; star: boolean };

const GATHER_AT = 1.4; // seconds of starfield before the portrait forms
const BUCKETS = 8; // alpha levels; particles are drawn in batches per level (one fillStyle each)
const K = 0.018; // spring strength toward the target
const DAMP = 0.86;
const RADIUS = 90; // pointer push radius, CSS px
const PUSH = 2.2;

// Sample the photo inside the traced outline. Returns home points (CSS px) with brightness alpha.
function samplePortrait(img: HTMLImageElement, w: number, h: number, mobile: boolean) {
  const xs = portrait.outline.map(([x]) => x), ys = portrait.outline.map(([, y]) => y);
  const crop = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  // Desktop: head near the top, torso running down behind the hero word.
  // Phones: smaller and higher, so it sits behind the word and stays clear of the buttons.
  let ph = h * (mobile ? 0.7 : 0.94);
  let pw = ph * (crop.w / crop.h);
  const maxW = w * (mobile ? 0.8 : 0.95);
  if (pw > maxW) { pw = maxW; ph = pw * (crop.h / crop.w); }
  const left = (w - pw) / 2, top = mobile ? h * 0.06 : h - ph;

  const step = mobile ? 7 : 5; // grid spacing in CSS px: fewer particles on phones
  const cols = Math.round(pw / step), rows = Math.round(ph / step);
  const c = document.createElement("canvas");
  c.width = cols; c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  const sx = cols / crop.w, sy = rows / crop.h;
  ctx.beginPath();
  portrait.outline.forEach(([x, y], i) => ctx[i ? "lineTo" : "moveTo"]((x - crop.x) * sx, (y - crop.y) * sy));
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;

  const pts: { x: number; y: number; a: number }[] = [];
  for (let r = 0; r < rows; r++)
    for (let q = 0; q < cols; q++) {
      const i = (r * cols + q) * 4;
      if (data[i + 3] < 128) continue; // outside the outline
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      // Stretch contrast so the face and shirt read bright and the dark jacket stays faint (frame 08).
      const l = Math.min(1, Math.max(0, (lum - 0.1) / 0.72));
      pts.push({ x: left + q * step, y: top + r * step, a: 0.08 + 0.92 * Math.pow(l, 1.7) });
    }
  return { pts, size: step * 0.55 };
}

export default function HeroPortrait() {
  const wrap = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current, box = wrap.current;
    if (!canvas || !box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // static photo stays

    let alive = true, raf = 0, last = 0, t = 0, size = 3, gathered = false;
    let parts: P[] = [];
    let w = 0, h = 0;
    const mouse = { x: -1e4, y: -1e4 };
    const img = new window.Image();
    img.src = portrait.src;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = w < 768;
      const { pts, size: s } = samplePortrait(img, w, h, mobile);
      size = s;
      const rand = (n: number) => Math.random() * n;
      const star = (home?: { x: number; y: number; a: number }): P => {
        const sx = rand(w), sy = rand(h);
        // After a resize, portrait particles start home (no replay of the gather).
        const at = home && gathered ? home : { x: sx, y: sy };
        return { x: at.x, y: at.y, vx: 0, vy: 0, sx, sy, hx: home?.x ?? sx, hy: home?.y ?? sy, a: 0, ha: home?.a ?? 0.25 + rand(0.5), delay: rand(1.2), tw: rand(6.28), star: !home };
      };
      // Portrait particles plus a sparse field of stars that stay put (frames 07-08).
      parts = [...pts.map((p) => star(p)), ...Array.from({ length: mobile ? 140 : 320 }, () => star())];
      box.dataset.particles = String(parts.length);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now; t += dt;
      const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const home = !p.star && t > GATHER_AT + p.delay;
        const tx = home ? p.hx : p.sx + Math.sin(t * 0.3 + p.tw) * 4;
        const ty = home ? p.hy : p.sy + Math.cos(t * 0.25 + p.tw) * 4;
        p.vx += (tx - p.x) * K; p.vy += (ty - p.y) * K;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < RADIUS * RADIUS && d2 > 0.01) {
          const d = Math.sqrt(d2), f = (1 - d / RADIUS) * PUSH;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
        p.vx *= DAMP; p.vy *= DAMP;
        p.x += p.vx; p.y += p.vy;
        // Fade in on load; stars twinkle; portrait particles settle to their photo brightness.
        const target = home ? p.ha : p.ha * (0.55 + 0.45 * Math.sin(t * 1.5 + p.tw)) * (p.star ? 1 : 0.6);
        p.a += (Math.min(target, t / 1.2) - p.a) * 0.08;
        const b = Math.min(BUCKETS - 1, Math.round(p.a * (BUCKETS - 1)));
        if (b > 0) buckets[b].push(i);
      }
      if (!gathered && t > GATHER_AT + 2.5) gathered = true;
      ctx.clearRect(0, 0, w, h);
      for (let b = 1; b < BUCKETS; b++) {
        ctx.fillStyle = `rgba(226,230,238,${b / (BUCKETS - 1)})`;
        for (const i of buckets[b]) {
          const p = parts[i];
          const s = p.star ? 1.6 : size;
          ctx.fillRect(p.x, p.y, s, s);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!raf && alive) { raf = requestAnimationFrame(frame); canvas.dataset.anim = "on"; } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; canvas.dataset.anim = "off"; };
    // Draw only while the hero is on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    const ro = new ResizeObserver(() => { if (parts.length) build(); });
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -1e4; };

    const go = () => {
      if (!alive) return;
      build();
      box.dataset.state = "running";
      io.observe(canvas);
      ro.observe(canvas);
      addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    };
    img.decode().then(() => {
      // While the intro plays, wait so the starfield fades in after it rather than behind it.
      if (document.documentElement.dataset.intro === "play") addEventListener("intro:done", go, { once: true });
      else go();
    }).catch(() => { /* photo failed to load: static fallback stays */ });

    return () => {
      alive = false;
      removeEventListener("intro:done", go);
      stop();
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      box.dataset.state = "static";
    };
  }, []);

  return (
    <div ref={wrap} data-state="static" aria-hidden className="group pointer-events-none absolute inset-0 -z-10">
      {/* Static fallback: dimmed photo, hidden once the particles run. Box matches the photo so the fade hides its edges. */}
      <div
        style={{ aspectRatio: `${portrait.width} / ${portrait.height}` }}
        className="absolute bottom-0 left-1/2 h-full max-w-full -translate-x-1/2 opacity-20 grayscale [mask-image:radial-gradient(ellipse_55%_60%_at_50%_40%,#000_40%,transparent_75%)] group-data-[state=running]:opacity-0"
      >
        <Image
          src={portrait.src}
          alt=""
          fill
          // Same file the particle sampler loads, so the photo downloads once; above the fold, so eager.
          unoptimized
          loading="eager"
          className="object-cover"
        />
      </div>
      {/* Fades out below the hero word so the role line and buttons stay readable. */}
      <canvas
        ref={ref}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 [mask-image:linear-gradient(#000_62%,rgba(0,0,0,0.2)_80%,rgba(0,0,0,0.08))] group-data-[state=running]:opacity-100 md:[mask-image:linear-gradient(#000_80%,rgba(0,0,0,0.25)_92%,rgba(0,0,0,0.1))]"
      />
    </div>
  );
}
