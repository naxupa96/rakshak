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

function NavLink({
  href,
  label,
  active,
  badge,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: string | number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
        active
          ? "text-bone font-semibold"
          : "text-mist hover:text-bone hover:bg-white/[0.04] rounded-md"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span className="font-mono text-[10px] text-dim bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.2 rounded">
          {badge}
        </span>
      )}
      {/* Subtle institutional active underline indicator */}
      {active && (
        <span
          className="absolute -bottom-[17px] left-2 right-2 h-[2px] bg-bone rounded-full transition-all"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

export function SiteNav() {
  const { dict, lang, setLang, simple, setSimple, ready } = useApp();
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/[0.08] bg-[#090b0e]/95 backdrop-blur-md">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-bone focus:px-4 focus:py-2 focus:text-xs focus:font-sans focus:text-ink"
      >
        {dict.common.skipToContent}
      </a>
      
      {/* 68px institutional header bar */}
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-6 font-sans">
        
        {/* LEFT: Brand area */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="group flex items-center gap-3 text-bone focus-visible:outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-[#12151b] transition-colors group-hover:border-white/[0.2]">
              <BrandMark size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14.5px] font-semibold tracking-tight text-bone font-sans leading-none">
                {dict.brand.name}
              </span>
              <span className="mt-1 text-[9.5px] font-medium tracking-[0.14em] uppercase text-dim leading-none">
                FINANCIAL THREAT INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Subtle vertical divider after brand */}
          <div className="hidden h-7 w-[1px] bg-white/[0.08] sm:block" aria-hidden="true" />
        </div>

        {/* CENTER: Primary Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink
            href="/investigate"
            label="Investigate"
            active={pathname.startsWith("/investigate")}
          />
          <NavLink
            href="/locker"
            label="Cases"
            active={pathname.startsWith("/locker") || pathname.startsWith("/incident")}
          />
          <NavLink
            href="/dashboard"
            label="Threat Center"
            active={pathname.startsWith("/dashboard")}
          />
          <NavLink
            href="/settings"
            label={dict.nav.settings}
            active={pathname.startsWith("/settings")}
          />
        </nav>

        {/* RIGHT: Actions & Utilities */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Extension / Shield Utility indicator */}
          <Link
            href="/extension"
            className={`hidden items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors lg:inline-flex ${
              pathname.startsWith("/extension")
                ? "bg-white/[0.08] text-bone border-white/[0.15]"
                : "text-mist hover:text-bone border-white/[0.06] hover:bg-white/[0.03]"
            }`}
            title="Browser Shield Extension status"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#35b779]" />
            <span>Shield</span>
          </Link>

          {/* Simple Mode Toggle */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              role="switch"
              aria-checked={simple}
              disabled={!ready}
              onClick={() => setSimple(!simple)}
              className="switch-toggle"
              data-checked={simple ? "true" : "false"}
              title="Toggle Simple Mode explanations"
            >
              <span className="switch-toggle-thumb" />
            </button>
            <span className="text-xs text-mist select-none font-medium">
              {dict.common.simpleMode}
            </span>
          </div>

          {/* Subtle vertical separator */}
          <div className="hidden h-4 w-[1px] bg-white/[0.08] sm:block" aria-hidden="true" />

          {/* Language Selector */}
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

          {/* Compact Premium Analyze CTA */}
          <Link
            href="/investigate"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.18] bg-bone px-3.5 py-1.5 text-xs font-semibold text-[#090b0e] transition-all hover:bg-white hover:border-white shadow-sm"
          >
            <span>Analyze</span>
            <span className="text-[11px] leading-none" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <nav className="flex items-center gap-2 overflow-x-auto border-t border-white/[0.06] px-5 py-2 md:hidden bg-[#0c0f14]">
        <NavLink href="/investigate" label="Investigate" active={pathname.startsWith("/investigate")} />
        <NavLink href="/locker" label="Cases" active={pathname.startsWith("/locker") || pathname.startsWith("/incident")} />
        <NavLink href="/dashboard" label="Threat Center" active={pathname.startsWith("/dashboard")} />
        <NavLink href="/extension" label="Shield" active={pathname.startsWith("/extension")} />
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
              <Link href="/extension" className="hover:text-bone text-azure flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{dict.nav.extension ?? "Shield Extension"}</span>
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
