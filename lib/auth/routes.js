// Where each role lives, and which pages need a logged-in user.

export const HR_HOME = "/hr/dashboard";
export const CANDIDATE_HOME = "/my-applications";

// Logged-out users who open these pages are sent to Log in.
export const PROTECTED_PREFIXES = ["/hr", "/my-applications"];

export function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// The apply form for one job: /jobs/abc-tech-junior-web-developer/apply
export function isApplyPath(pathname) {
  return /^\/jobs\/[^/]+\/apply(\/|$)/.test(pathname);
}

export function isHrPath(pathname) {
  return pathname === "/hr" || pathname.startsWith("/hr/");
}

export function homeForRole(role) {
  return role === "hr" ? HR_HOME : CANDIDATE_HOME;
}

// Only allows paths inside this app ("/jobs/x"), never another site ("//evil.com").
export function safeNextPath(next) {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

// After sign up, log in or reset: go back to `next` if it fits the role, else the role's home.
export function redirectPathFor(role, next) {
  const path = safeNextPath(next);
  if (!path) return homeForRole(role);
  if (role === "hr" && !isHrPath(path)) return HR_HOME;
  if (role === "candidate" && isHrPath(path)) return CANDIDATE_HOME;
  return path;
}
