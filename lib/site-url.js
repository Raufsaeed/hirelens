import "server-only";
import { headers } from "next/headers";

// The address the app is running on (for example http://localhost:3000), from the request.
export async function siteOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}
