import "server-only";

// The app's public address, for links in emails, password reset, email change and the job link.
// It comes from NEXT_PUBLIC_SITE_URL (on Vercel, for example https://hirelens.vercel.app), never from the
// request's headers, which anyone can fake. Without it (local development) it is http://localhost:3000.
const LOCAL_URL = "http://localhost:3000";

export function siteOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    // Forgetting it on Vercel would send every link to localhost, so say so in the logs.
    if (process.env.NODE_ENV === "production") console.error("NEXT_PUBLIC_SITE_URL is not set; links use http://localhost:3000");
    return LOCAL_URL;
  }
  try {
    const url = new URL(value);
    if (["http:", "https:"].includes(url.protocol)) return url.origin;
  } catch {
    // Not a full address; fall through.
  }
  console.error("NEXT_PUBLIC_SITE_URL is not a valid http(s) address; using http://localhost:3000");
  return LOCAL_URL;
}
