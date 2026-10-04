import type { Metadata } from "next";
import { InvestigateApp } from "@/components/investigate/investigate-app";

export const metadata: Metadata = {
  title: "Investigate",
  description: "Check a suspicious investment message, screenshot or website with Rakshak.",
};

export default function InvestigatePage() {
  return <InvestigateApp />;
}
