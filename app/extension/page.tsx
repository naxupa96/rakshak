import type { Metadata } from "next";
import { ExtensionClient } from "./extension-client";

export const metadata: Metadata = {
  title: "Rakshak Shield — Browser Extension Setup",
  description:
    "1-Click download and setup for Rakshak Shield browser extension. Real-time financial fraud, typo-squatting, and SEBI regulatory verifier.",
};

export default function ExtensionPage() {
  return <ExtensionClient />;
}
