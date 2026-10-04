"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TopologyNode {
  id: string;
  x: number;
  y: number;
  label: string;
  kind: "ENTITY" | "CLAIM" | "REGULATOR" | "WEBSITE" | "CONTACT" | "PAYMENT";
  status: "suspicious" | "unverified" | "verified";
  color: string;
  evidence: string;
  details: string;
}

const TOPOLOGY_NODES: TopologyNode[] = [
  {
    id: "n-0",
    x: 120,
    y: 135,
    label: "Apex Alpha VIP",
    kind: "ENTITY",
    status: "suspicious",
    color: "#ff4336",
    evidence: "Unregistered Investment Club soliciting retail funds without portfolio manager license.",
    details: "Claims institutional endorsement but utilizes personal P2P communication channels.",
  },
  {
    id: "n-1",
    x: 350,
    y: 60,
    label: "30% Monthly ROI",
    kind: "CLAIM",
    status: "suspicious",
    color: "#ff4336",
    evidence: "Guaranteed fixed market returns strictly prohibited under SEBI IA Regulations 2013.",
    details: "Unrealistic return multiplier designed to induce FOMO cognitive bias.",
  },
  {
    id: "n-2",
    x: 350,
    y: 210,
    label: "SEBI / INH00008892",
    kind: "REGULATOR",
    status: "suspicious",
    color: "#e69d27",
    evidence: "SEBI registration number fabricated or misappropriated from legitimate entity.",
    details: "Intermediary database search yields zero matches for this entity name.",
  },
  {
    id: "n-3",
    x: 580,
    y: 60,
    label: "sebi-portal-verify.in",
    kind: "WEBSITE",
    status: "suspicious",
    color: "#ff4336",
    evidence: "Typo-squatting domain registered 48 hours ago via privacy registrar in Iceland.",
    details: "Hosts cloned login portal with phishing harvest scripts.",
  },
  {
    id: "n-4",
    x: 580,
    y: 210,
    label: "apex-invest@okaxis",
    kind: "PAYMENT",
    status: "suspicious",
    color: "#ff4336",
    evidence: "Mule VPA associated with 6 recent 1930 cyber fraud complaints in Maharashtra.",
    details: "P2P personal bank account masking as corporate depository.",
  },
];

const TOPOLOGY_EDGES: { from: number; to: number; label: string }[] = [
  { from: 0, to: 1, label: "PROMISES" },
  { from: 0, to: 2, label: "CLAIMS LICENSE" },
  { from: 1, to: 3, label: "VERIFIES VIA" },
  { from: 0, to: 4, label: "EXFILTRATES TO" },
];

export function HeroInteractiveGraph() {
  const [activeNode, setActiveNode] = useState<TopologyNode>(TOPOLOGY_NODES[0]);

  return (
    <div className="relative rounded-2xl border border-line-2 bg-surface-1 p-5 shadow-2xl backdrop-blur-xl">
      {/* Topology Header */}
      <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
          <p className="kicker !text-bone">Interactive Threat Topology</p>
        </div>
        <span className="text-[11px] font-mono text-azure bg-azure/10 px-2 py-0.5 rounded border border-azure/20">
          HOVER OR CLICK NODES
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden rounded-xl bg-surface-0 border border-line-2 p-2">
        <svg viewBox="0 0 700 270" className="h-auto w-full select-none" role="img" aria-label="interactive threat graph">
          {/* Directed Connections */}
          {TOPOLOGY_EDGES.map((edge, idx) => {
            const from = TOPOLOGY_NODES[edge.from];
            const to = TOPOLOGY_NODES[edge.to];
            const isHighlighted = activeNode.id === from.id || activeNode.id === to.id;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g key={idx}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isHighlighted ? "#4d88ff" : "#2a313c"}
                  strokeWidth={isHighlighted ? 2 : 1.2}
                  strokeDasharray={isHighlighted ? "none" : "4 4"}
                  className="transition-all duration-300"
                />
                <rect
                  x={midX - 44}
                  y={midY - 9}
                  width="88"
                  height="18"
                  rx="6"
                  fill="#07080a"
                  stroke="#1f242c"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={isHighlighted ? "#4d88ff" : "#646d7a"}
                  fontFamily="var(--font-jetbrains)"
                  fontWeight="600"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Interactive Nodes */}
          {TOPOLOGY_NODES.map((node) => {
            const isSelected = activeNode.id === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setActiveNode(node)}
                onMouseEnter={() => setActiveNode(node)}
              >
                {/* Outer Glow on Selected */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="46"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}
                {/* Node Pill Box */}
                <rect
                  x={node.x - 68}
                  y={node.y - 20}
                  width="136"
                  height="40"
                  rx="12"
                  fill={isSelected ? "#15191f" : "#0f1216"}
                  stroke={isSelected ? node.color : "#2a313c"}
                  strokeWidth={isSelected ? 1.8 : 1.2}
                  className="transition-all duration-200"
                />
                <text
                  x={node.x}
                  y={node.y - 4}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#646d7a"
                  fontFamily="var(--font-jetbrains)"
                  letterSpacing="1.2"
                >
                  {node.kind}
                </text>
                <text
                  x={node.x}
                  y={node.y + 11}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill={isSelected ? "#f0f2f5" : node.color}
                  fontWeight="600"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Telemetry Strip */}
      <div className="mt-3.5 rounded-xl bg-surface-2 p-3.5 border border-line-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
              style={{ color: activeNode.color, borderColor: `${activeNode.color}40`, backgroundColor: `${activeNode.color}15` }}
            >
              {activeNode.kind}
            </span>
            <span className="text-xs font-semibold text-bone truncate">{activeNode.label}</span>
          </div>
          <p className="mt-1 text-[11.5px] text-mist leading-relaxed line-clamp-1">
            {activeNode.evidence}
          </p>
        </div>
        <Link
          href="/investigate"
          className="btn btn-ghost !py-1.5 !px-3 !text-[11px] shrink-0 font-mono text-azure border-azure/30 hover:bg-azure/10"
        >
          Investigate →
        </Link>
      </div>
    </div>
  );
}
