export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 animate-pulse">
      <div className="h-4 w-32 rounded bg-charcoal mb-4" />
      <div className="h-8 w-64 rounded bg-charcoal mb-8" />
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <div className="h-24 rounded-xl border border-line bg-panel p-4" />
        <div className="h-24 rounded-xl border border-line bg-panel p-4" />
        <div className="h-24 rounded-xl border border-line bg-panel p-4" />
        <div className="h-24 rounded-xl border border-line bg-panel p-4" />
      </div>
      <div className="h-64 rounded-xl border border-line bg-panel p-6" />
    </div>
  );
}
