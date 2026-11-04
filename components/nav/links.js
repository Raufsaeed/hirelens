import { Briefcase, FileText, LayoutDashboard, Search } from "lucide-react";

// Navigation links. Each feature adds its page here when it is built.
export const HR_LINKS = [
  { href: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hr/jobs", label: "My Jobs", icon: Briefcase },
];

export const CANDIDATE_LINKS = [
  { href: "/jobs", label: "Jobs", icon: Search },
  { href: "/my-applications", label: "My Applications", icon: FileText },
];
