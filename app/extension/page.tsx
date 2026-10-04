import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rakshak Shield — Browser Extension",
  description:
    "Real-time financial fraud, typo-squatting, and SEBI regulatory verifier browser extension for Chrome, Brave, and Edge.",
};

export default function ExtensionPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14">
      {/* Header */}
      <div className="border-b border-line pb-8">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
          <p className="kicker">CLIENT-SIDE BROWSER DEFENSE</p>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-bone sm:text-5xl">
          Rakshak Shield Browser Extension
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist">
          Real-time proactive protection. Monitors your browser navigation in the background, detecting typosquats of Indian brokerages and banking portals before you enter credentials or transfer funds.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="panel p-6 border-line-2 bg-surface-1/90 rounded-2xl glass-card-hover">
          <div className="text-2xl mb-3">🚨</div>
          <h3 className="text-base font-semibold text-bone">Real-Time Typo-Squat Warning</h3>
          <p className="mt-2 text-xs text-mist leading-relaxed">
            Instantly flags malicious lookalike domains mimicking Zerodha, Groww, Angel One, Upstox, SEBI, and NSE directly inside the active web page.
          </p>
        </div>

        <div className="panel p-6 border-line-2 bg-surface-1/90 rounded-2xl glass-card-hover">
          <div className="text-2xl mb-3">⚡</div>
          <h3 className="text-base font-semibold text-bone">1-Click Threat Triage</h3>
          <p className="mt-2 text-xs text-mist leading-relaxed">
            Found a suspicious investment site? Click the Rakshak popup badge to automatically dispatch a full forensic interrogation with WHOIS & SEBI registry verification.
          </p>
        </div>

        <div className="panel p-6 border-line-2 bg-surface-1/90 rounded-2xl glass-card-hover">
          <div className="text-2xl mb-3">🔒</div>
          <h3 className="text-base font-semibold text-bone">Zero Browsing History Upload</h3>
          <p className="mt-2 text-xs text-mist leading-relaxed">
            All heuristic pattern matching and domain token analysis runs locally on your machine. No telemetry or browsing history is ever transmitted or logged.
          </p>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="mt-12 panel p-8 border-line-2 bg-surface-1/95 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <h2 className="text-xl font-bold text-bone">Developer / Sideload Installation</h2>
            <p className="text-xs text-mist mt-1">Manifest V3 compatible with Chrome, Brave, Edge, and Arc.</p>
          </div>
          <span className="font-mono text-xs text-emerald bg-emerald/10 border border-emerald/30 px-3 py-1 rounded-full font-semibold">
            MANIFEST V3 READY
          </span>
        </div>

        <ol className="mt-6 space-y-4">
          {[
            {
              step: "01",
              title: "Open Extension Management",
              desc: "In Chrome / Brave / Edge, navigate to chrome://extensions or edge://extensions in your URL bar.",
            },
            {
              step: "02",
              title: "Enable Developer Mode",
              desc: "Toggle on the 'Developer mode' switch located in the top-right corner of the Extensions dashboard.",
            },
            {
              step: "03",
              title: "Load Unpacked Extension",
              desc: "Click 'Load unpacked' in the top-left corner, and select the folder:",
              code: "c:\\Users\\naksh\\Desktop\\rakshak\\extension",
            },
            {
              step: "04",
              title: "Active Protection Active",
              desc: "Rakshak Shield will appear in your browser toolbar, silently guarding you against spoofed stockbroker portals and fake regulatory certs.",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-4 p-4 rounded-xl bg-surface-0 border border-line-2">
              <span className="font-mono text-sm font-bold text-signal px-2.5 py-1 rounded bg-signal/10 border border-signal/30 shrink-0">
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-bone">{item.title}</h4>
                <p className="mt-1 text-xs text-mist leading-relaxed">{item.desc}</p>
                {item.code && (
                  <pre className="mt-2 p-2.5 rounded-lg bg-surface-2 border border-line font-mono text-xs text-azure select-all overflow-x-auto">
                    {item.code}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Directory Files Status */}
        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="font-mono text-xs text-dim">
            Extension Bundle: <span className="text-bone">manifest.json</span> · <span className="text-bone">content.js</span> · <span className="text-bone">popup.html</span> · <span className="text-bone">popup.js</span>
          </div>
          <Link
            href="/investigate"
            className="btn btn-primary shimmer-btn !py-2.5 !px-5 !text-xs font-semibold"
          >
            Launch Web Investigation →
          </Link>
        </div>
      </div>
    </div>
  );
}
