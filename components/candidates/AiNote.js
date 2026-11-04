import { Sparkles } from "lucide-react";

// "AI only advises, HR decides" at the top of every AI result (design/components/AiNote).
export default function AiNote({ children }) {
  return (
    <p className="small flex items-start gap-2 rounded-control border border-primary-faint bg-primary-tint p-3 text-on-primary-tint">
      <Sparkles className="mt-0.5 size-icon-sm shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span>
        <strong>AI only advises, HR decides.</strong>{" "}
        {children || "Scores and reasons help you review faster. You make every shortlist, reject and hire decision."}
      </span>
    </p>
  );
}
