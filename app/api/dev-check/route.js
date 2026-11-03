import { connection } from "next/server";
import { runDevChecks } from "@/lib/dev-check";

// GET /api/dev-check: tests Gemini, Supabase and the storage buckets.
// Development only; returns just ok or a short error per check, never a key.
export async function GET() {
  // Run on every request instead of being prerendered at build time.
  await connection();

  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const checks = await runDevChecks();
    return Response.json({ checks });
  } catch {
    return Response.json(
      { error: "Checks could not run, try again" },
      { status: 500 }
    );
  }
}
