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

const ALPHA_MIN = 192; // cells less opaque than this are the cut-out's soft edge: no dot, so no halo
const DOT_MIN = 0.18; // dimmest dot for any opaque pixel: the near-black jacket still shows as an outline
// Head levels: lenses at DOT_MIN (darkest), hair dim, skin stretched over mid-to-light so features separate.
// Photo luminance (0-255) thresholds inside the head. GLASS_LUM is high because on phones each dot averages
// ~6 photo px, mixing the dark lenses with frame glints; skin is 110+ so it stays out.
const HAIR_LUM = 55, GLASS_LUM = 95, SKIN_TOP = 150;
const HAIR = [0.26, 0.4], SKIN = [0.5, 0.9];
const BLACK = 20, WHITE = 235; // photo luminance (0-255) mapped to the dimmest and brightest dots
const LIFT = 0.75; // < 1 lifts midtones: face and hands land around 0.65, between jacket and shirt
const SHADOW_LUM = 14; // inside portrait.shadow, pixels darker than this are the shadow blob (jacket is 22+)

// Sample the photo's crop rectangle. Returns home points (CSS px) with brightness alpha.
function samplePortrait(img: HTMLImageElement, w: number, h: number, mobile: boolean, maxY: number) {
  const { x, y, width, height } = portrait.crop;
  const crop = { x, y, w: width, h: height };
  // Head and shoulders fill the area above the hero word; the waist fades out behind it.
  // Phones: as wide as the screen allows (arms reach the edges), so the head stays large.
  let ph = h * (mobile ? 0.6 : 0.82);
  let pw = ph * (crop.w / crop.h);
  const maxW = w * (mobile ? 1 : 0.95);
  if (pw > maxW) { pw = maxW; ph = pw * (crop.h / crop.w); }
  const left = (w - pw) / 2, top = h * (mobile ? 0.06 : 0.05);
  // The crop sets the scale; below the waist, rows continue down to the fade line (or the photo's end),
  // so the figure always runs behind the hero word and fades out instead of stopping at a hard edge.
  const scale = ph / crop.h;
  crop.h = Math.min(portrait.height - crop.y, (maxY - top) / scale);
  ph = crop.h * scale;

  const step = mobile ? 8 : 6; // grid spacing in CSS px: fewer particles on phones; ~10k on desktop keeps scrolling smooth
  const cols = Math.round(pw / step), rows = Math.round(ph / step);
  const c = document.createElement("canvas");
  c.width = cols; c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;

  const { shadow: sh, head: hd, glasses: gl } = portrait;
  const inBox = (b: { x: number; y: number; width: number; height: number }, x: number, y: number) =>
    x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
  const pts: { x: number; y: number; a: number }[] = [];
  for (let r = 0; r < rows; r++)
    for (let q = 0; q < cols; q++) {
      // Only cells above the fade line become dots, so the figure ends cleanly below the hero word.
      if (top + r * step > maxY) continue;
      const i = (r * cols + q) * 4;
      if (data[i + 3] < ALPHA_MIN) continue; // transparent or soft edge
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      const px = crop.x + ((q + 0.5) / cols) * crop.w, py = crop.y + ((r + 0.5) / rows) * crop.h;
      if (lum < SHADOW_LUM && inBox(sh, px, py)) continue;
      let a: number;
      if (inBox(hd, px, py)) {
        if (lum < GLASS_LUM && inBox(gl, px, py)) a = DOT_MIN;
        else if (lum < HAIR_LUM) a = HAIR[0] + (HAIR[1] - HAIR[0]) * (lum / HAIR_LUM);
        else a = SKIN[0] + (SKIN[1] - SKIN[0]) * Math.min(1, (lum - HAIR_LUM) / (SKIN_TOP - HAIR_LUM));
      } else {
        const t = Math.min(1, Math.max(0, (lum - BLACK) / (WHITE - BLACK)));
        a = DOT_MIN + (1 - DOT_MIN) * Math.pow(t, LIFT);
      }
      pts.push({ x: left + q * step, y: top + r * step, a });
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
    // Particles fade out below the hero word (keeps role line and buttons readable). Done per particle:
    // a CSS mask on this animating canvas dropped frames while scrolling.
    // Floor 0: with 8 alpha levels, a non-zero floor let only the brightest dots survive past the
    // fade line, which showed up as stray dots below the rectangle.
    let fadeFrom = 0, fadeTo = 1;
    const mouse = { x: -1e4, y: -1e4 };
    const img = new window.Image();
    img.src = portrait.src;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = w < 768;
      [fadeFrom, fadeTo] = mobile ? [h * 0.62, h * 0.8] : [h * 0.8, h * 0.92];
      const { pts, size: s } = samplePortrait(img, w, h, mobile, fadeTo);
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
        const fade = p.y < fadeFrom ? 1 : p.y > fadeTo ? 0 : 1 - (p.y - fadeFrom) / (fadeTo - fadeFrom);
        const b = Math.min(BUCKETS - 1, Math.round(p.a * fade * (BUCKETS - 1)));
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

  const { crop } = portrait;
  return (
    <div ref={wrap} data-state="static" aria-hidden className="group pointer-events-none absolute inset-0 -z-10 [container-type:size]">
      {/* Static fallback: dimmed photo, hidden once the particles run. Shows the same waist crop, at the same size
          and position as the dot figure (sizes in .portrait-fallback, globals.css), in CSS so it works without JS. */}
      <div
        style={{
          aspectRatio: `${crop.width} / ${crop.height}`,
          height: `min(var(--fh), calc(var(--fw) * ${crop.height / crop.width}))`,
          top: "var(--ft)",
        }}
        className="portrait-fallback absolute left-1/2 -translate-x-1/2 overflow-hidden opacity-20 grayscale [mask-image:linear-gradient(#000_65%,transparent)] group-data-[state=running]:opacity-0"
      >
        <Image
          src={portrait.src}
          alt=""
          width={portrait.width}
          height={portrait.height}
          // Same file the particle sampler loads, so the photo downloads once; above the fold, so eager.
          unoptimized
          loading="eager"
          style={{ width: `${(portrait.width / crop.width) * 100}%`, left: `${(-crop.x / crop.width) * 100}%`, top: `${(-crop.y / crop.height) * 100}%` }}
          className="absolute h-auto max-w-none"
        />
      </div>
      {/* Fades out below the hero word so the role line and buttons stay readable. */}
      <canvas
        ref={ref}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 group-data-[state=running]:opacity-100"
      />
    </div>
  );
}
