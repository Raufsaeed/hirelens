import { spawnSync } from "node:child_process";

// Playwright globalSetup and globalTeardown: removes @example.com test data before every run (leftovers
// from a stopped run) and after every run, even when tests fail. It runs tests/cleanup-test-data.mjs,
// which only ever deletes @example.com test users and their test companies, jobs and files.
// A failed cleanup only prints a warning; it never stops or fails the test run.
export default function runTestCleanup() {
  const result = spawnSync(process.execPath, ["tests/cleanup-test-data.mjs"], { encoding: "utf8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (result.status === 0) {
    const removedUsers = output.match(/Test users \(@example\.com\): (\d+)/)?.[1] ?? "0";
    console.log(`Test data cleanup: removed ${removedUsers} @example.com test user(s) and their data.`);
  } else {
    console.warn(`Test data cleanup didn't finish, so nothing more was deleted:\n${output}`);
  }
}
