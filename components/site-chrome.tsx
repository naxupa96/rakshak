"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { LANGS } from "@/lib/localization";

export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2.5 4.5 7v9.2c0 6.6 4.7 11.9 11.5 13.3 6.8-1.4 11.5-6.7 11.5-13.3V7L16 2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9.8 16.4 14 20.6l8.2-8.4" stroke="#ff4d3d" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active ? "text-bone" : "text-mist hover:text-bone"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteNav() {
  const { dict, lang, setLang, simple, setSimple, ready } = useApp();
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-bone focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
      >
        {dict.common.skipToContent}
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5">
        <Link href="/" className="flex items-center gap-2.5 text-bone">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight">{dict.brand.name}</span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-dim sm:inline">
            {dict.brand.positioning.split(" ").slice(-3).join(" ")}
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-5 md:flex">
          <NavLink href="/investigate" label={dict.nav.investigate} active={pathname.startsWith("/investigate")} />
          <NavLink href="/locker" label={dict.nav.locker} active={pathname.startsWith("/locker")} />
          <NavLink href="/dashboard" label={dict.nav.dashboard} active={pathname.startsWith("/dashboard")} />
          <NavLink href="/settings" label={dict.nav.settings} active={pathname.startsWith("/settings")} />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <label className="hidden cursor-pointer items-center gap-2 text-xs text-mist sm:flex">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-[#f2a93b]"
              checked={simple}
              onChange={(e) => setSimple(e.target.checked)}
              disabled={!ready}
            />
            {dict.common.simpleMode}
          </label>

          <div className="seg" role="tablist" aria-label={dict.common.language}>
            {LANGS.map((l) => (
              <button
                key={l.code}
                role="tab"
                aria-selected={lang === l.code}
                onClick={() => setLang(l.code)}
                lang={l.code}
                title={l.label}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/investigate" className="btn btn-primary hidden !py-2 !text-[13px] sm:inline-flex">
            {dict.nav.cta}
          </Link>
        </div>
      </div>

      <nav className="flex items-center gap-5 border-t border-line px-5 py-2.5 md:hidden">
        <NavLink href="/investigate" label={dict.nav.investigate} active={pathname.startsWith("/investigate")} />
        <NavLink href="/locker" label={dict.nav.locker} active={pathname.startsWith("/locker")} />
        <NavLink href="/dashboard" label={dict.nav.dashboard} active={pathname.startsWith("/dashboard")} />
        <NavLink href="/settings" label={dict.nav.settings} active={pathname.startsWith("/settings")} />
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const { dict } = useApp();
  return (
    <footer className="no-print mt-24 border-t border-line bg-ink-2">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-bone">
            <BrandMark size={22} />
            <span className="text-sm font-semibold">{dict.brand.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">{dict.footer.disclaimer}</p>
        </div>

        <div>
          <p className="kicker">{dict.footer.resources}</p>
          <ul className="mt-3 space-y-2 text-sm text-mist">
            <li>
              <Link href="/investigate" className="hover:text-bone">
                {dict.nav.investigate}
              </Link>
            </li>
            <li>
              <Link href="/locker" className="hover:text-bone">
                {dict.locker.title}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-bone">
                {dict.nav.dashboard}
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-bone">
                {dict.nav.settings}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker">{dict.footer.legal}</p>
          <ul className="mt-3 space-y-2 text-sm text-mist">
            <li>{dict.footer.privacyNotice}</li>
            <li>{dict.footer.safetyNote}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-5 py-5">
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-dim">{dict.footer.built}</p>
      </div>
    </footer>
  );
}
