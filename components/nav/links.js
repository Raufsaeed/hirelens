import { Briefcase, FileText, Kanban, LayoutDashboard, Search, Users } from "lucide-react";

// Navigation links. Each feature adds its page here when it is built.
export const HR_LINKS = [
  { href: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hr/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/hr/candidates", label: "Candidates", icon: Users },
  { href: "/hr/pipeline", label: "Pipeline", icon: Kanban },
];

export const CANDIDATE_LINKS = [
  { href: "/jobs", label: "Jobs", icon: Search },
  { href: "/my-applications", label: "My Applications", icon: FileText },
];
