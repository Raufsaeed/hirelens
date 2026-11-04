"use client";

import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import CompanyLogo from "@/components/jobs/CompanyLogo";
import { uploadWithProgress } from "@/components/forms/upload";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { LOGO_ERROR, MAX_LOGO_BYTES } from "@/lib/companies/validation";

// Company logo upload (Feature 06): PNG or JPG under 2 MB, checked here and again on the server.
// A new upload replaces the old logo.
export default function LogoUploader({ company }) {
  const inputRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(company.logo_url);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);

  async function upload(file) {
    if (!file) return;
    const looksRight = ["image/png", "image/jpeg"].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
    if (!looksRight || file.size > MAX_LOGO_BYTES) {
      setResult({ error: LOGO_ERROR });
      return;
    }
    const formData = new FormData();
    formData.set("logo", file);
    setResult(null);
    setProgress(0);
    const outcome = await uploadWithProgress("/api/company/logo", formData, setProgress);
    setProgress(null);
    setResult(outcome);
    if (outcome.logoUrl) setLogoUrl(outcome.logoUrl);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="label text-ink">
        Logo <span className="font-medium text-ink-muted">(optional)</span>
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <CompanyLogo company={{ ...company, logo_url: logoUrl }} size="lg" />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <div className="flex flex-col gap-1">
          <Button variant="secondary" icon={ImageUp} loading={progress !== null} onClick={() => inputRef.current?.click()}>
            {logoUrl ? "Replace logo" : "Upload logo"}
          </Button>
          <span className="small text-ink-muted">PNG or JPG, under 2 MB</span>
        </div>
      </div>
      {progress !== null && (
        <div
          role="progressbar"
          aria-label="Uploading logo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 max-w-90 overflow-hidden rounded-pill bg-surface-sunken"
        >
          <span className="block h-full rounded-pill bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
      {result?.error && <Alert tone="error">{result.error}</Alert>}
      {result?.message && <Alert tone="success">{result.message}</Alert>}
    </div>
  );
}
