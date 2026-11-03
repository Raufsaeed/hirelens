import Link from "next/link";

// Segmented "Sign up / Log in" switch at the top of the auth card.
// They are links, because each one opens its own page. `next` is kept so the user doesn't lose their place.
export default function AuthTabs({ active, next, role }) {
  const query = new URLSearchParams();
  if (next) query.set("next", next);
  const loginHref = `/login${query.size ? `?${query}` : ""}`;
  if (role) query.set("role", role);
  const signupHref = `/signup${query.size ? `?${query}` : ""}`;

  const tabs = [
    { id: "signup", label: "Sign up", href: signupHref },
    { id: "login", label: "Log in", href: loginHref },
  ];

  return (
    <nav aria-label="Sign up or log in" className="inline-flex gap-1 self-start rounded-[12px] bg-surface-sunken p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-[9px] px-4.5 text-sm font-bold no-underline transition-colors duration-(--duration-base) ease-out focus-visible:shadow-focus focus-visible:outline-none ${
              isActive ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
