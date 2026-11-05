import { renderEmail } from "@/emails/layout";

// Sent to the candidate when an application is submitted (Feature 23). Always sent.
export function applicationReceivedEmail({ candidateName, companyName, jobTitle, origin }) {
  return renderEmail({
    subject: `Your application to ${companyName} was received`,
    heading: `Thanks, ${candidateName}!`,
    lines: [
      `Your application for ${jobTitle} at ${companyName} was received.`,
      `${companyName}'s HR team will review it. We'll email you when your status changes.`,
    ],
    button: { label: "Go to My Applications", url: `${origin}/my-applications` },
  });
}
