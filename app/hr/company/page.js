import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import CompanySettingsForm from "@/components/company/CompanySettingsForm";
import LogoUploader from "@/components/company/LogoUploader";
import PageHeader from "@/components/nav/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import RetryButton from "@/components/ui/RetryButton";
import { getCurrentProfile } from "@/lib/auth/current-user";
import { getCompany } from "@/lib/companies/queries";

export const metadata = { title: "Company settings · HireLens" };

// Company Settings (Feature 06), HR only (the HR layout blocks candidates).
export default function CompanySettingsPage() {
  return (
    <div className="flex max-w-form flex-col gap-8">
      <Suspense fallback={<div className="h-120 animate-pulse rounded-card bg-surface-sunken" aria-busy="true" />}>
        <CompanySettings />
      </Suspense>
    </div>
  );
}

async function CompanySettings() {
  let company;
  try {
    const profile = await getCurrentProfile();
    company = await getCompany(profile.company_id);
  } catch {
    return <Alert tone="error" title="Couldn't load your company" action={<RetryButton />} />;
  }
  return (
    <>
      <PageHeader
        title="Company settings"
        subtitle="This is what candidates see on your company page and job pages."
        actions={
          <Button href={`/companies/${company.slug}`} variant="secondary" icon={ExternalLink} target="_blank">
            View company page
          </Button>
        }
      />
      <section className="flex flex-col gap-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <LogoUploader company={company} />
        <hr className="h-px border-0 bg-border" />
        <CompanySettingsForm company={company} />
      </section>
    </>
  );
}
