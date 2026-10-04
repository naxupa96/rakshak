"use client";

import { useState } from "react";
import { useApp } from "@/components/app-providers";
import { LANGS } from "@/lib/localization";
import { clearIncidents } from "@/lib/storage/locker";
import { Section } from "@/components/ui";

export function Settings() {
  const { dict, lang, setLang, simple, setSimple } = useApp();
  const [cleared, setCleared] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <p className="kicker">{dict.nav.settings}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-bone">{dict.settings.title}</h1>

      <div className="mt-8">
        <Section title={dict.settings.language} hint={dict.settings.languageHint}>
          <div className="grid gap-3 sm:grid-cols-3">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={`panel-flat px-4 py-4 text-left transition-colors ${
                  lang === l.code ? "border-azure/60" : "hover:border-line-2"
                }`}
              >
                <span className="block text-[11px] uppercase tracking-[0.16em] text-dim">{l.code}</span>
                <span className="mt-1 block text-[17px] font-medium text-bone" lang={l.code}>
                  {l.native}
                </span>
                <span className="mt-0.5 block text-[12.5px] text-mist">{l.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title={dict.settings.simple} hint={dict.settings.simpleHint}>
          <label className="panel-flat flex cursor-pointer items-start gap-3 px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[#f2a93b]"
              checked={simple}
              onChange={(e) => setSimple(e.target.checked)}
            />
            <span className="text-sm text-bone">{dict.settings.simple}</span>
          </label>
        </Section>

        <Section title={dict.settings.privacy} hint={dict.settings.privacyHint}>
          <ul className="space-y-2.5 text-[13.5px] leading-relaxed text-bone">
            {dict.settings.privacyPoints.map((point) => (
              <li key={point} className="flex gap-2.5">
                <span className="text-emerald" aria-hidden>
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(dict.settings.clearConfirm)) {
                  clearIncidents();
                  setCleared(true);
                }
              }}
            >
              {dict.settings.clearData}
            </button>
            {cleared ? <span className="text-sm text-emerald">{dict.settings.cleared}</span> : null}
          </div>
        </Section>

        <Section title={dict.settings.roadmap} hint={dict.settings.roadmapHint}>
          <div className="flex flex-wrap gap-2">
            {["Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Punjabi"].map((name) => (
              <span key={name} className="chip">
                {name}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
