"use client";

import { useRef, useState } from "react";
import { CircleAlert, CircleCheck, CloudUpload, FileText, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { CV_TOO_BIG_ERROR, PDF_ONLY_ERROR, checkCvFile } from "@/lib/applications/validation";

// The only way to attach a CV: one PDF up to 5 MB (design/components/UploadDropzone).
// The file is checked here before upload, and again on the server.

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const ERROR_HELP = {
  [PDF_ONLY_ERROR]: (file) => `${file.name} isn't a PDF. Save it as PDF and try again.`,
  [CV_TOO_BIG_ERROR]: (file) => `This PDF is ${formatSize(file.size)}. Try a smaller export.`,
};

export default function CvDropzone({ file, onChange, progress, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(null); // { file, message }

  function choose(picked) {
    if (!picked) return;
    const message = checkCvFile(picked);
    if (message) {
      setRejected({ file: picked, message });
      onChange(null);
    } else {
      setRejected(null);
      onChange(picked);
    }
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(event) => {
        choose(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );

  // A valid PDF is chosen: show its row (with the upload progress while sending).
  if (file) {
    const uploading = typeof progress === "number";
    return (
      <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
        {input}
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-success-bg text-success-text">
          {uploading ? (
            <FileText className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <CircleCheck className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-bold">{file.name}</span>
            {uploading && <span className="small text-ink-muted tabular-nums">{progress}%</span>}
          </div>
          {uploading ? (
            <div
              role="progressbar"
              aria-label={`Uploading ${file.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-2 overflow-hidden rounded-pill bg-surface-sunken"
            >
              <span
                className="block h-full rounded-pill bg-primary transition-[width] duration-(--duration-base) ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <span className="small text-ink-muted">{formatSize(file.size)} · PDF</span>
          )}
        </div>
        {!uploading && (
          <Button variant="ghost" size="sm" icon={X} onClick={() => onChange(null)} disabled={disabled}>
            Remove
          </Button>
        )}
      </div>
    );
  }

  // The last file was refused: say why and what to do.
  if (rejected) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-danger bg-danger-bg p-6 text-center">
        {input}
        <span className="grid size-12 place-items-center rounded-pill bg-surface text-danger">
          <CircleAlert className="size-icon-lg" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <strong role="alert" className="text-danger-text">
          {rejected.message}
        </strong>
        <span className="small text-danger-text">{ERROR_HELP[rejected.message]?.(rejected.file)}</span>
        <Button variant="secondary" size="sm" onClick={openPicker}>
          Choose another file
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload your CV, PDF up to 5 MB"
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        choose(event.dataTransfer.files?.[0]);
      }}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-card border-[1.5px] border-dashed p-6 text-center transition-colors duration-(--duration-fast) ease-out focus-visible:shadow-focus focus-visible:outline-none ${
        dragging ? "border-primary bg-primary-tint" : "border-border-control bg-surface hover:border-primary"
      }`}
    >
      {input}
      <span className="grid size-12 place-items-center rounded-pill bg-primary-tint text-on-primary-tint">
        <CloudUpload className="size-icon-lg" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <strong>{dragging ? "Drop to upload" : <>Drag your PDF CV here or <span className="text-primary">choose a file</span></>}</strong>
      <span className="small text-ink-muted">PDF only · up to 5 MB</span>
    </div>
  );
}
