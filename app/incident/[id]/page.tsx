import type { Metadata } from "next";
import { ReportLoader } from "@/components/report/report-loader";

export const metadata: Metadata = {
  title: "Evidence locker incident",
  robots: { index: false },
};

export default async function IncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportLoader id={id} />;
}
