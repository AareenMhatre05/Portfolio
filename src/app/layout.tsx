import type { Metadata } from "next";
import { Archivo, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "Aareen Mhatre | Portfolio",
  description:
    "Computer Engineering student in Mumbai building database-first apps, data pipelines and cloud projects.",
};

// Runs while the HTML is parsed, before first paint, so the intro covers the page without a flash.
// Once per session, never for reduced motion; with JS off it never runs, so the intro never shows.
// The timeout releases the page even if the app's JS fails to load.
const introGate = `try{if(!sessionStorage.getItem("intro-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){sessionStorage.setItem("intro-seen","1");var d=document.documentElement;d.dataset.intro="play";window.__introFailsafe=setTimeout(function(){d.removeAttribute("data-intro");dispatchEvent(new Event("intro:done"))},7000)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // data-intro is set by the inline script before hydration
      suppressHydrationWarning
      className={`${archivo.variable} ${instrumentSans.variable} ${instrumentSerif.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
