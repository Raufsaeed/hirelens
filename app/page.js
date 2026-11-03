import Link from "next/link";

// Temporary home page until the landing page feature is built.
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-form flex-col gap-4 px-4 py-10">
      <h1 className="page-title">HireLens</h1>
      <p className="body text-ink-muted">Project setup is ready.</p>
      <Link
        href="/dev-check"
        className="body-medium inline-flex min-h-touch items-center self-start rounded-control text-primary underline hover:text-primary-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        Open the setup check
      </Link>
    </main>
  );
}
