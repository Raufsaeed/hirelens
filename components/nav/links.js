import { Briefcase, Building2, CalendarClock, FileText, Kanban, LayoutDashboard, Search, Settings, Users } from "lucide-react";

// Navigation links. Each feature adds its page here when it is built.
export const HR_LINKS = [
  { href: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hr/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/hr/candidates", label: "Candidates", icon: Users },
  { href: "/hr/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/hr/interviews", label: "Interviews", icon: CalendarClock },
];

export const CANDIDATE_LINKS = [
  { href: "/jobs", label: "Jobs", icon: Search },
  { href: "/my-applications", label: "My Applications", icon: FileText },
];

// Account links at the bottom of the HR sidebar and in the candidate user menu (Features 06 and 22).
export const HR_ACCOUNT_LINKS = [
  { href: "/hr/settings", label: "Settings", icon: Settings },
  { href: "/hr/company", label: "Company settings", icon: Building2 },
];

export const CANDIDATE_ACCOUNT_LINKS = [{ href: "/settings", label: "Settings", icon: Settings }];
