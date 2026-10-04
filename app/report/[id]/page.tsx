import type { Metadata } from "next";
import { ReportLoader } from "@/components/report/report-loader";

export const metadata: Metadata = {
  title: "Analysis report",
  robots: { index: false },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportLoader id={id} />;
}
