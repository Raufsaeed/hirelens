import { initials } from "@/components/nav/Avatar";

// Company logo from the public logos bucket, or an initials monogram on primary-deep.
// alt: set it where the logo stands alone (company page); next to the name it is decorative.
export default function CompanyLogo({ company, size = "md", alt = "" }) {
  const box = size === "lg" ? "size-18 rounded-card text-2xl" : "size-12 rounded-[12px] text-[17px]";
  if (company?.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element -- small logo from Supabase Storage
    return <img src={company.logo_url} alt={alt} className={`${box} shrink-0 bg-surface object-cover`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} grid shrink-0 place-items-center bg-primary-deep font-extrabold tracking-[-0.02em] text-on-primary`}
    >
      {initials(company?.name)}
    </span>
  );
}
