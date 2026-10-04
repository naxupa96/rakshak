import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

export const metadata: Metadata = {
  title: "Rakshak — Verify before you trust",
  description:
    "AI financial threat intelligence for Indian investors. Analyze suspicious messages, screenshots and websites, then see the evidence behind every risk signal.",
};

export default function HomePage() {
  return <Landing />;
}
