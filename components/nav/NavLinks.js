"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CANDIDATE_LINKS, HR_LINKS } from "@/components/nav/links";

const GROUPS = { hr: HR_LINKS, candidate: CANDIDATE_LINKS };

// The navigation links for "hr" or "candidate"; the current page gets aria-current="page".
export default function NavLinks({ group, linkClassName, onNavigate }) {
  const pathname = usePathname();
  return GROUPS[group].map(({ href, label, icon: Icon }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={linkClassName}
        onClick={onNavigate}
      >
        <Icon className="size-icon-md shrink-0" strokeWidth={1.75} aria-hidden="true" />
        {label}
      </Link>
    );
  });
}
