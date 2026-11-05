"use client";

import { useRef, useState, useTransition } from "react";
import { CloudUpload, FileText, Trash2 } from "lucide-react";
import CvDropzone from "@/components/applications/CvDropzone";
import { uploadWithProgress } from "@/components/forms/upload";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { checkCvFile } from "@/lib/applications/validation";
import { deleteDefaultCv } from "@/lib/profile/actions";

// The default CV on My Profile (Feature 20): upload, replace or delete one PDF under 5 MB.
// The file is checked here and again on the server. CVs already sent never change.
export default function DefaultCvBox({ initialFileName }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(initialFileName);
  const [uploading, setUploading] = useState(null); // { file, progress }
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();

  async function upload(file) {
    if (!file) return;
    const error = checkCvFile(file);
    if (error) return setResult({ error }); // the old default CV stays
    const formData = new FormData();
    formData.set("cv", file);
    setResult(null);
    setUploading({ file, progress: 0 });
    const outcome = await uploadWithProgress("/api/profile/cv", formData, (progress) => setUploading({ file, progress }));
    setUploading(null);
    setResult(outcome);
    if (outcome.fileName) setFileName(outcome.fileName);
  }

  function remove() {
    startDelete(async () => {
      const outcome = await deleteDefaultCv();
      if (outcome.message) {
        setFileName(null);
        setConfirming(false);
      }
      setResult(outcome);
    });
  }

  let box;
  if (uploading) {
    box = <CvDropzone file={uploading.file} progress={uploading.progress} disabled onChange={() => {}} />;
  } else if (fileName) {
    box = (
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-primary-tint text-on-primary-tint">
          <FileText className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold">{fileName}</span>
          <span className="small text-ink-muted">Default CV · PDF</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={CloudUpload} onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      </div>
    );
  } else {
    box = <CvDropzone file={null} onChange={upload} />;
  }

  return (
    <section aria-labelledby="default-cv-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="default-cv-title" className="card-title">
          Default CV
        </h2>
        <p className="small text-ink-muted">Used with one click when you apply. You can still send a different CV for one job.</p>
      </div>
      {box}
      {result?.error && <Alert tone="error">{result.error}</Alert>}
      {result?.message && <Alert tone="success">{result.message}</Alert>}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete your default CV?"
        icon={Trash2}
        tone="danger"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} loading={deleting} onClick={remove}>
              Delete CV
            </Button>
          </>
        }
      >
        <p className="text-ink-muted">CVs you already sent to companies are not affected.</p>
        {result?.error && confirming && <Alert tone="error">{result.error}</Alert>}
      </Dialog>
    </section>
  );
}
