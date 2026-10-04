"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnalysisReport } from "@/types";
import { useApp } from "@/components/app-providers";
import { readLiveReport, getIncident } from "@/lib/storage/locker";
import { useAfterMount } from "@/lib/hooks";
import { ReportView } from "@/components/report/report-view";

export function ReportLoader({ id }: { id: string }) {
  const { dict } = useApp();
  const [state, setState] = useState<{ report: AnalysisReport | null; incident?: string; ready: boolean }>({
    report: null,
    ready: false,
  });

  useAfterMount(() => {
    if (id === "live") {
      setState({ report: readLiveReport(), ready: true });
      return;
    }
    const entry = getIncident(id);
    setState({ report: entry?.report ?? null, incident: entry?.incident, ready: true });
  });

  if (!state.ready) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-sm text-dim">{dict.common.loading}</p>
      </div>
    );
  }

  if (!state.report) {
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-20 text-center">
        <p className="kicker">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-bone">{dict.errors.notFound}</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist">{dict.errors.notFoundBody}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="btn btn-primary" href="/investigate">
            {dict.common.analyzeSomething}
          </Link>
          <Link className="btn btn-ghost" href="/">
            {dict.errors.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return <ReportView report={state.report} incident={state.incident} />;
}
