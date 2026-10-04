"use client";

import { useMemo, useState } from "react";
import type { AnalysisReport, GraphNode } from "@/types";
import { useApp } from "@/components/app-providers";
import { edgeLabel } from "@/lib/localization";
import { Badge } from "@/components/ui";

const W = 760;
const H = 420;

function statusTone(status: GraphNode["status"]): { stroke: string; fill: string; text: string } {
  if (status === "verified") return { stroke: "#35c08a", fill: "rgba(53,192,138,0.14)", text: "#7ce0b8" };
  if (status === "suspicious") return { stroke: "#ff4d3d", fill: "rgba(255,77,61,0.16)", text: "#ffb4ac" };
  return { stroke: "#2d333b", fill: "rgba(255,255,255,0.04)", text: "#98a0ab" };
}

export function TrustGraphView({ report }: { report: AnalysisReport }) {
  const { dict } = useApp();
  const [mode, setMode] = useState<"graph" | "list">("graph");
  const [selected, setSelected] = useState<string | null>(null);

  const { nodes, edges } = report.graph;

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (!nodes.length) return map;
    const primary = nodes.find((n) => n.primary) ?? nodes[0];
    map.set(primary.id, { x: W / 2, y: H / 2 });
    const others = nodes.filter((n) => n.id !== primary.id);
    const ring = others.filter((_, i) => i % 2 === 0);
    const outer = others.filter((_, i) => i % 2 === 1);
    ring.forEach((n, i) => {
      const angle = (i / Math.max(1, ring.length)) * Math.PI * 2 - Math.PI / 2;
      map.set(n.id, {
        x: W / 2 + Math.cos(angle) * 215,
        y: H / 2 + Math.sin(angle) * 118,
      });
    });
    outer.forEach((n, i) => {
      const angle = (i / Math.max(1, outer.length)) * Math.PI * 2 + Math.PI / 4;
      map.set(n.id, {
        x: W / 2 + Math.cos(angle) * 318,
        y: H / 2 + Math.sin(angle) * 172,
      });
    });
    return map;
  }, [nodes]);

  const selectedNode = nodes.find((n) => n.id === selected) ?? null;

  const related = selectedNode
    ? edges
        .filter((e) => e.from === selectedNode.id || e.to === selectedNode.id)
        .map((e) => {
          const outgoing = e.from === selectedNode.id;
          const other = nodes.find((n) => n.id === (outgoing ? e.to : e.from));
          return {
            id: e.id,
            outgoing,
            label: edgeLabel(dict, e.label),
            otherLabel: other?.label ?? "—",
            otherStatus: other?.status ?? null,
          };
        })
    : [];

  if (!nodes.length) {
    return <p className="text-sm text-dim">{dict.graph.empty}</p>;
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-3 text-[11.5px] text-mist">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald" aria-hidden />
            {dict.status.verified}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-mist" aria-hidden />
            {dict.status.unknown}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-signal" aria-hidden />
            {dict.status.suspicious}
          </span>
        </div>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={mode === "graph"} onClick={() => setMode("graph")}>
            {dict.graph.graphView}
          </button>
          <button role="tab" aria-selected={mode === "list"} onClick={() => setMode("list")}>
            {dict.graph.listView}
          </button>
        </div>
      </div>

      {mode === "graph" ? (
        <div className="overflow-x-auto">
          <p className="px-4 pt-2.5 text-[12px] text-dim md:hidden">{dict.graph.scrollHint}</p>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full min-w-[680px]"
            role="img"
            aria-label={dict.graph.title}
          >
            <defs>
              <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" fill="#3a414b" />
              </marker>
            </defs>

            {edges.map((e) => {
              const from = positions.get(e.from);
              const to = positions.get(e.to);
              if (!from || !to) return null;
              const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
              const active = selected === e.from || selected === e.to;
              return (
                <g key={e.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={active ? "#5b93ff" : "#3a414b"}
                    strokeWidth={active ? 1.6 : 1.1}
                    strokeDasharray="4 4"
                    markerEnd="url(#arrow)"
                  />
                  {active ? (
                    <g>
                      <rect
                        x={mid.x - 62}
                        y={mid.y - 9}
                        width="124"
                        height="18"
                        rx="9"
                        fill="#0d0f12"
                        stroke="#2d333b"
                      />
                      <text
                        x={mid.x}
                        y={mid.y + 4}
                        textAnchor="middle"
                        fontSize="10.5"
                        fill="#98a0ab"
                        fontFamily="var(--font-jetbrains)"
                      >
                        {edgeLabel(dict, e.label)}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}

            {nodes.map((n) => {
              const p = positions.get(n.id);
              if (!p) return null;
              const tone = statusTone(n.status);
              const label = n.label.length > 24 ? n.label.slice(0, 23) + "…" : n.label;
              const width = Math.max(78, Math.min(190, label.length * 7.2 + 34));
              const isSelected = selected === n.id;
              return (
                <g
                  key={n.id}
                  className="gnode"
                  transform={`translate(${p.x}, ${p.y})`}
                  onClick={() => setSelected(isSelected ? null : n.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${dict.graph.kinds[n.kind]}: ${n.label} — ${dict.status[n.status]}`}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelected(isSelected ? null : n.id);
                  }}
                >
                  <rect
                    x={-width / 2}
                    y={-19}
                    width={width}
                    height="38"
                    rx="12"
                    fill={tone.fill}
                    stroke={isSelected ? "#5b93ff" : tone.stroke}
                    strokeWidth={isSelected ? 1.8 : 1.3}
                  />
                  <text
                    x={0}
                    y={-3}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#6b737e"
                    fontFamily="var(--font-jetbrains)"
                    letterSpacing="1"
                  >
                    {dict.graph.kinds[n.kind].toUpperCase()}
                  </text>
                  <text x={0} y={11} textAnchor="middle" fontSize="11.5" fill={tone.text} fontWeight="600">
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {nodes.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-[13px]">
              <span className="kicker w-24 shrink-0">{dict.graph.kinds[n.kind]}</span>
              <span className="min-w-0 flex-1 break-words text-bone">{n.label}</span>
              <Badge tone={n.status === "suspicious" ? "bad" : n.status === "verified" ? "good" : "neutral"}>
                {dict.status[n.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-line px-4 py-3">
        {selectedNode ? (
          <div className="border-l-2 pl-3" style={{ borderColor: statusTone(selectedNode.status).stroke }}>
            <div className="flex flex-wrap items-center gap-3 text-[13px]">
              <span className="kicker">{dict.graph.kinds[selectedNode.kind]}</span>
              <span className="font-medium text-bone">{selectedNode.label}</span>
              <Badge
                tone={selectedNode.status === "suspicious" ? "bad" : selectedNode.status === "verified" ? "good" : "neutral"}
              >
                {dict.status[selectedNode.status]}
              </Badge>
              <span className="text-[12.5px] text-dim">
                {dict.graph.connections}: {related.length}
              </span>
            </div>
            {related.length ? (
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {related.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.03] px-2.5 py-1 text-[12px] text-mist"
                  >
                    <span className="text-dim" aria-hidden>
                      {r.outgoing ? "→" : "←"}
                    </span>
                    <span>{r.label}</span>
                    <span className="text-dim">·</span>
                    <span className="text-bone">{r.otherLabel}</span>
                    {r.otherStatus ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        aria-hidden
                        style={{
                          background:
                            r.otherStatus === "suspicious"
                              ? "#ff4d3d"
                              : r.otherStatus === "verified"
                                ? "#35c08a"
                                : "#98a0ab",
                        }}
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12.5px] text-dim">{dict.graph.empty}</p>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-dim">{dict.graph.selectPrompt}</p>
        )}
      </div>
    </div>
  );
}
