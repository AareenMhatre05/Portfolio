"use client";

// Slow dark smoke behind the contact section (frame 20). WebGL fragment shader of
// domain-warped noise. Renders only while the section is on screen. Reduced motion,
// no WebGL, a lost context or no JS all leave the section's static CSS gradient.
import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y * 1.6;
  float t = uTime * 0.025;
  // Two rounds of domain warping give the curling, swirling look.
  vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(uv + 3.5 * q + vec2(1.7, 9.2) + 0.6 * t), fbm(uv + 3.5 * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = fbm(uv + 3.5 * r);
  float smoke = smoothstep(0.42, 0.95, f);
  // Ink (#07080a) up to a dim steel grey: kept low so text and card stay readable.
  vec3 ink = vec3(0.027, 0.031, 0.039);
  vec3 col = mix(ink, vec3(0.16, 0.165, 0.175), smoke * (0.6 + 0.4 * length(q)));
  // Soft fade into the page at top and bottom, done here: a CSS mask on this canvas dropped frames while scrolling.
  float y = gl_FragCoord.y / uRes.y;
  col = mix(ink, col, smoothstep(0.0, 0.18, y) * smoothstep(1.0, 0.82, y));
  gl_FragColor = vec4(col, 1.0);
}`;

const SCALE = 0.5; // render at half resolution; the smoke is soft, so it doesn't show

export default function Smoke() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // static gradient stays

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return; // fall back quietly
    gl.useProgram(prog);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one full-screen triangle
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let elapsed = 0; // seconds of on-screen time, so the smoke resumes where it paused
    let last = 0;
    const frame = (now: number) => {
      elapsed += Math.min(0.1, (now - (last || now)) / 1000);
      last = now;
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (canvas.dataset.state !== "running") canvas.dataset.state = "running";
      raf = requestAnimationFrame(frame);
    };
    const stop = (state: string) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      canvas.dataset.state = state;
    };

    // Draw only while the section is on screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame);
      else if (!e.isIntersecting && raf) stop("paused");
    });
    io.observe(canvas);

    const lost = (e: Event) => {
      e.preventDefault();
      io.disconnect();
      stop("static");
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      stop("static");
      // Free GL objects but keep the context: a remount (e.g. React dev double-mount) reuses this canvas's context.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-state="static"
      // Hidden until the first frame draws, so the CSS gradient shows in every fallback case.
      className="pointer-events-none absolute inset-0 -z-10 size-full opacity-0 transition-opacity duration-1000 data-[state=paused]:opacity-100 data-[state=running]:opacity-100"
    />
  );
}
