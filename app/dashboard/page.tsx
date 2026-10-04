import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Your Investor Safety Center",
  robots: { index: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
