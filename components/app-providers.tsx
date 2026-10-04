"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/types";
import { getDict, isLang, type Dict } from "@/lib/localization";
import { useAfterMount } from "@/lib/hooks";

const LANG_KEY = "rakshak.lang";
const SIMPLE_KEY = "rakshak.simple";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  simple: boolean;
  setSimple: (v: boolean) => void;
  dict: Dict;
  ready: boolean;
}

const AppContext = createContext<AppState | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [simple, setSimpleState] = useState(false);
  const [ready, setReady] = useState(false);

  useAfterMount(() => {
    try {
      const storedLang = window.localStorage.getItem(LANG_KEY);
      const storedSimple = window.localStorage.getItem(SIMPLE_KEY);
      if (isLang(storedLang)) setLangState(storedLang);
      if (storedSimple === "1") setSimpleState(true);
    } catch {
      /* storage may be blocked; defaults are fine */
    }
    setReady(true);
  });

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    document.documentElement.dataset.simple = simple ? "1" : "0";
    document.body.dataset.simple = simple ? "1" : "0";
    try {
      window.localStorage.setItem(LANG_KEY, lang);
      window.localStorage.setItem(SIMPLE_KEY, simple ? "1" : "0");
    } catch {
      /* ignore */
    }

    // Global keyboard listener: press "/" to jump/focus investigation
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        const inputEl = document.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea, input[type="text"], input[type="url"]');
        if (inputEl) {
          inputEl.focus();
        } else {
          window.location.href = "/investigate";
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lang, simple, ready]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setSimple = useCallback((v: boolean) => setSimpleState(v), []);

  const value = useMemo<AppState>(
    () => ({ lang, setLang, simple, setSimple, dict: getDict(lang), ready }),
    [lang, setLang, simple, setSimple, ready],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProviders");
  return ctx;
}

export function useDict(): Dict {
  return useApp().dict;
}
