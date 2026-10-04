"use client";

import { useEffect } from "react";

/**
 * Runs a callback once after the first paint. Used for reading browser-only
 * state (localStorage, URL search params) without hydrating mismatched HTML.
 */
export function useAfterMount(callback: () => void): void {
  useEffect(() => {
    const timer = window.setTimeout(callback, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
