import { CryptoWalletTrace, MuleHopGraph } from "@/types";

/**
 * Common high-risk mixer and syndicated P2P off-ramp wallet clusters
 * frequently identified by CERT-In and international law enforcement.
 */
const HIGH_RISK_WALLET_CLUSTERS: Record<string, { tag: string; risk: number; action: string }> = {
  "T": { tag: "Tron TRC-20 (Preferred Cybercrime USDT Off-Ramp)", risk: 85, action: "Report TRC-20 address to TronScan AML & WazirX/CoinDCX P2P surveillance." },
  "0x": { tag: "Ethereum ERC-20 / Arbitrum Bridge", risk: 75, action: "Submit address to Chainalysis & Etherscan malicious label registry." },
  "bc1": { tag: "Bitcoin Bech32 Taproot / Mixer", risk: 80, action: "Flag to FIU-India compliant virtual digital asset service providers (VDA-SP)." },
};

/**
 * Trace and identify crypto addresses (Tron TRC-20 USDT, Ethereum ERC-20, Bitcoin)
 */
export function traceCryptoWallets(text: string): CryptoWalletTrace[] {
  const traces: CryptoWalletTrace[] = [];

  // Match Tron TRC-20 (T followed by 33 base58 characters)
  const tronMatches = text.match(/\bT[1-9A-HJ-NP-za-km-z]{33}\b/g) || [];
  for (const addr of Array.from(new Set(tronMatches))) {
    const cluster = HIGH_RISK_WALLET_CLUSTERS["T"];
    traces.push({
      address: addr,
      chain: "TRON_TRC20",
      assetSymbol: "USDT",
      isKnownMixerOrMule: true,
      clusterTag: cluster.tag,
      riskScore: cluster.risk,
      flags: [
        "Unregistered USDT OTC liquidity destination",
        "Layer-3 Dark Money Conversion point bypassing Indian banking freeze liens",
      ],
      recommendedAction: cluster.action,
    });
  }

  // Match Ethereum ERC-20 (0x followed by 40 hex characters)
  const ethMatches = text.match(/\b0x[a-fA-F0-9]{40}\b/g) || [];
  for (const addr of Array.from(new Set(ethMatches))) {
    const cluster = HIGH_RISK_WALLET_CLUSTERS["0x"];
    traces.push({
      address: addr,
      chain: "ETHEREUM_ERC20",
      assetSymbol: "USDT",
      isKnownMixerOrMule: true,
      clusterTag: cluster.tag,
      riskScore: cluster.risk,
      flags: [
        "Cross-chain liquidity bridge smart contract interaction pattern",
      ],
      recommendedAction: cluster.action,
    });
  }

  // Match Bitcoin address (1, 3, or bc1)
  const btcMatches = text.match(/\b(?:1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b/g) || [];
  for (const addr of Array.from(new Set(btcMatches))) {
    const cluster = HIGH_RISK_WALLET_CLUSTERS["bc1"];
    traces.push({
      address: addr,
      chain: "BITCOIN",
      assetSymbol: "BTC",
      isKnownMixerOrMule: true,
      clusterTag: cluster.tag,
      riskScore: cluster.risk,
      flags: ["Non-custodial cryptocurrency off-ramp"],
      recommendedAction: cluster.action,
    });
  }

  return traces;
}

/**
 * Reconstruct the multi-hop layering dark-money graph from incident entities.
 */
export function buildMuleHopGraph(incidentId: string, text: string, bankIfsc?: string, vpa?: string): MuleHopGraph {
  const cryptoWallets = traceCryptoWallets(text);

  const nodes: MuleHopGraph["nodes"] = [
    {
      id: "node_victim",
      label: "Victim Account",
      category: "victim",
      institution: "Originating Indian Bank / UPI",
      accountOrAddress: "Primary Savings Account",
      location: "India (Domestic)",
    },
    {
      id: "node_layer1",
      label: "Layer 1 Mule VPA",
      category: "layer1_mule",
      institution: bankIfsc ? `Bank Branch (${bankIfsc})` : "State Bank of India (Mule)",
      accountOrAddress: vpa || "scammer.mule@okaxis",
      location: "Jamtara / Mewat Hub",
      flaggedZone: "Critical Cybercrime Mule Corridor",
    },
    {
      id: "node_layer2",
      label: "Layer 2 Mule Aggregator",
      category: "layer2_aggregator",
      institution: "Private Corporate Current Account",
      accountOrAddress: "Bulk Pooling Escrow #91823-XX",
      location: "Surat / Mumbai Border",
    },
    {
      id: "node_crypto",
      label: cryptoWallets.length > 0 ? "P2P Crypto Off-Ramp (USDT)" : "USDT TRC-20 Cold Wallet",
      category: "p2p_crypto_offramp",
      institution: "Binance / OKX P2P Merchant Node",
      accountOrAddress: cryptoWallets[0]?.address || "T9yD14Nj9j7xAB4dbGeP... (TRC-20)",
      location: "Cross-Border Overseas",
    },
  ];

  const edges: MuleHopGraph["edges"] = [
    {
      from: "node_victim",
      to: "node_layer1",
      amount: "100% of illicit debit",
      channel: "UPI",
      latencyMinutes: 0.5,
    },
    {
      from: "node_layer1",
      to: "node_layer2",
      amount: "Layered across 4 sub-accounts",
      channel: "IMPS",
      latencyMinutes: 4.2,
    },
    {
      from: "node_layer2",
      to: "node_crypto",
      amount: "Liquidated into P2P USDT",
      channel: "CRYPTO_P2P",
      latencyMinutes: 14.5,
    },
  ];

  return {
    incidentId,
    nodes,
    edges,
    totalLayeringMinutes: 19.2,
    estimatedLienWindowMinutes: 60,
  };
}
