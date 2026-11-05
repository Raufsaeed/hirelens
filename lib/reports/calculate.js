// Every Reports number (Feature 19), worked out in code from real rows. No AI is used here.

export const FUNNEL_STAGES = [
  { status: "applied", label: "Applied" },
  { status: "shortlisted", label: "Shortlisted" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "hired", label: "Hired" },
];
const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_MISSING = 5;

const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

// One screening per application; Supabase may return it as an object or a one-item list.
function screeningOf(application) {
  return Array.isArray(application.screenings) ? application.screenings[0] : application.screenings;
}

// Pending and failed screenings have no score, so only "done" ones count.
function doneScreening(application) {
  const screening = screeningOf(application);
  return application.screening_status === "done" && screening?.score != null ? screening : null;
}

function perJob(jobs, applications) {
  return jobs.map((job) => {
    const mine = applications.filter((application) => application.job_id === job.id);
    const scores = mine.map(doneScreening).filter(Boolean).map((screening) => screening.score);
    return { label: job.title, applicants: mine.length, averageScore: average(scores) };
  });
}

// How many applications ever reached each stage, from status history.
// Every application starts at Applied, so that stage counts them all.
function funnel(applications) {
  return FUNNEL_STAGES.map(({ status, label }) => ({
    label,
    value:
      status === "applied"
        ? applications.length
        : applications.filter((application) => (application.status_history || []).some((row) => row.to_status === status)).length,
  }));
}

// Average days from applying to the first move to Hired. Null when nobody was hired.
function timeToHire(applications) {
  const days = applications
    .map((application) => {
      const hiredAt = (application.status_history || [])
        .filter((row) => row.to_status === "hired")
        .map((row) => Date.parse(row.changed_at))
        .sort((a, b) => a - b)[0];
      return hiredAt ? Math.max(0, (hiredAt - Date.parse(application.applied_at)) / DAY_MS) : null;
    })
    .filter((value) => value !== null);
  const result = average(days);
  return result === null ? null : Math.round(result * 10) / 10;
}

// The five requirements most often marked missing. Names are grouped without caring about case.
function topMissing(applications) {
  const counts = new Map();
  for (const application of applications) {
    const results = doneScreening(application)?.requirements_result;
    for (const item of Array.isArray(results) ? results : []) {
      if (item?.found !== false || typeof item.name !== "string" || !item.name.trim()) continue;
      const key = item.name.trim().toLowerCase();
      const entry = counts.get(key) || { label: item.name.trim(), value: 0 };
      entry.value += 1;
      counts.set(key, entry);
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, TOP_MISSING);
}

export function buildReport(jobs, applications) {
  const jobRows = perJob(jobs, applications);
  const needsAttention = applications.filter((application) =>
    ["pending", "failed"].includes(application.screening_status)
  ).length;
  const allScores = applications.map(doneScreening).filter(Boolean).map((screening) => screening.score);
  const overall = average(allScores);

  return {
    totalApplicants: applications.length,
    averageScore: overall === null ? null : Math.round(overall),
    applicantsPerJob: jobRows
      .map((row) => ({ label: row.label, value: row.applicants }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    averageScorePerJob: jobRows
      .filter((row) => row.averageScore !== null)
      .map((row) => ({ label: row.label, value: Math.round(row.averageScore) }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    funnel: funnel(applications),
    timeToHireDays: timeToHire(applications),
    topMissing: topMissing(applications),
    screeningHealth: {
      needsAttention,
      percent: applications.length ? Math.round((needsAttention / applications.length) * 100) : 0,
    },
  };
}
