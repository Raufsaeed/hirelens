// Shown while a protected layout checks who is logged in. It never shows any data.
export default function ShellSkeleton() {
  return (
    <div className="min-h-dvh bg-surface-page" aria-busy="true" aria-label="Loading">
      <div className="h-nav bg-nav-bg" />
      <div className="mx-auto flex max-w-hr flex-col gap-4 px-4 py-10 md:px-8">
        <div className="h-9 w-1/3 animate-pulse rounded-sm bg-surface-sunken" />
        <div className="h-40 w-full animate-pulse rounded-card bg-surface-sunken" />
      </div>
    </div>
  );
}
