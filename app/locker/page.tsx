import type { Metadata } from "next";
import { LockerApp } from "@/components/locker/locker-app";

export const metadata: Metadata = {
  title: "Evidence Locker",
  robots: { index: false },
};

export default function LockerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <LockerApp />
    </div>
  );
}
