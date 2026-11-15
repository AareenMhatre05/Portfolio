import { cacheLife } from "next/cache";
import { nav, site } from "@/data";

// Cached so the page stays static (cacheComponents forbids a bare new Date() in prerender); refreshes daily.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1200px] px-4 pb-10 md:px-8 lg:px-14">
      <div className="flex flex-col gap-4 border-t border-line pt-8 text-sm text-mist md:flex-row md:items-center md:justify-between">
        <p>© <CurrentYear /> {site.name}</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-bone">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
