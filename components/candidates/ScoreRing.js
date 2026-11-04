import { BadgeCheck, CircleAlert, CircleMinus, ThumbsUp } from "lucide-react";
import Badge from "@/components/ui/Badge";

// The screening score out of 100 as a ring (design/components/ScoreRing). HR only.
// size "sm" (44px, tables) or "lg" (144px, candidate detail with the band label).

export function scoreBand(score) {
  if (score >= 85) return { label: "Excellent", tone: "success", icon: BadgeCheck };
  if (score >= 70) return { label: "Good", tone: "primary", icon: ThumbsUp };
  if (score >= 50) return { label: "Average", tone: "warning", icon: CircleMinus };
  return { label: "Poor", tone: "danger", icon: CircleAlert };
}

const SIZES = {
  sm: { box: 44, stroke: 4, number: "text-[13px] font-extrabold" },
  lg: { box: 144, stroke: 11, number: "numeric-xl" },
};

export default function ScoreRing({ score, size = "sm" }) {
  const { box, stroke, number } = SIZES[size];
  const radius = (box - stroke) / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const band = scoreBand(score);
  const gradientId = `score-gradient-${size}`;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        role="img"
        aria-label={`Score ${score} out of 100, ${band.label}`}
        className="relative grid place-items-center"
        style={{ width: box, height: box }}
      >
        <svg viewBox={`0 0 ${box} ${box}`} className="absolute inset-0 -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary-soft)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <circle cx={box / 2} cy={box / 2} r={radius} fill="none" stroke="var(--surface-sunken)" strokeWidth={stroke} />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 100)}
            className="transition-[stroke-dashoffset] duration-(--duration-score) ease-out"
          />
        </svg>
        <span className={`relative tabular-nums ${number}`}>
          {score}
          {size === "lg" && <span className="small block text-center font-medium text-ink-muted">/ 100</span>}
        </span>
      </div>
      {size === "lg" && (
        <Badge tone={band.tone} icon={band.icon}>
          {band.label}
        </Badge>
      )}
    </div>
  );
}
