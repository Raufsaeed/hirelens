import { renderEmail } from "@/emails/layout";

// Sent to the candidate when HR moves their application (Feature 23). Optional ("Status updates").
const MESSAGES = {
  shortlisted: "Good news: you've been shortlisted.",
  interview: "You've moved to the interview stage. Look out for your interview details.",
  offer: "Great news: you've reached the offer stage.",
  hired: "Congratulations, you've been hired!",
  rejected: "Thank you for applying. The company has decided not to move forward with your application this time.",
};

export const STATUS_EMAIL_STATUSES = Object.keys(MESSAGES);

export function statusChangedEmail({ candidateName, companyName, jobTitle, status, applicationId, origin }) {
  return renderEmail({
    subject: `Update on your application to ${companyName}`,
    heading: `Hi ${candidateName},`,
    lines: [`There's an update on your application for ${jobTitle} at ${companyName}.`, MESSAGES[status]],
    button: { label: "View your application", url: `${origin}/my-applications/${applicationId}` },
  });
}
