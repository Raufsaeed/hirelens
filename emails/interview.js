import { renderEmail } from "@/emails/layout";

// Sent to the candidate when an interview is scheduled, rescheduled or cancelled (Feature 23). Always sent.
const KINDS = {
  scheduled: { subject: (company) => `Interview scheduled with ${company}`, line: "Your interview is booked." },
  rescheduled: { subject: (company) => `Interview rescheduled with ${company}`, line: "Your interview has moved to a new time." },
  cancelled: { subject: (company) => `Interview cancelled with ${company}`, line: "Your interview has been cancelled." },
};

// when: "17 Oct, 2:00 pm" (Pakistan time).
export function interviewEmail({ kind, candidateName, companyName, jobTitle, when, durationMinutes, meetingLink, location, applicationId, origin }) {
  const details =
    kind === "cancelled"
      ? [["Was planned for", when]]
      : [
          ["Date and time", `${when} (Pakistan time)`],
          ["Duration", `${durationMinutes} minutes`],
          meetingLink && ["Meeting link", meetingLink],
          location && ["Address", location],
        ].filter(Boolean);
  return renderEmail({
    subject: KINDS[kind].subject(companyName),
    heading: `Hi ${candidateName},`,
    lines: [`${KINDS[kind].line} This is for ${jobTitle} at ${companyName}.`],
    details,
    button: { label: "View your application", url: `${origin}/my-applications/${applicationId}` },
  });
}
