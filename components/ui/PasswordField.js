"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import TextField from "@/components/ui/TextField";
import { PASSWORD_RULES } from "@/lib/auth/password";

// Password input with a show/hide button and, when `showRules` is on, the three
// requirements that tick live as the user types (design/components/PasswordField).

function RequirementTicks({ id, value }) {
  return (
    <ul id={id} aria-label="Password requirements" aria-live="polite" className="flex flex-col gap-1.5">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.id}
            data-met={met}
            className={`flex items-center gap-2 text-[13px] leading-5 transition-colors duration-(--duration-base) ease-out ${
              met ? "font-medium text-success-text" : "text-ink-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`grid size-4.5 shrink-0 place-items-center rounded-pill border-[1.5px] transition-[background-color,border-color,transform] duration-(--duration-base) ease-out ${
                met ? "scale-108 border-success bg-success" : "border-border-control"
              }`}
            >
              <svg viewBox="0 0 12 12" className="size-2.75 fill-none stroke-on-primary">
                <path
                  d="M2.5 6.2l2.3 2.3 4.7-4.9"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-[stroke-dashoffset] delay-80 duration-(--duration-slow) ease-out [stroke-dasharray:18] ${
                    met ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:18]"
                  }`}
                />
              </svg>
            </span>
            {rule.label}
            <span className="sr-only">{met ? "met" : "not met"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function PasswordField({ id, label = "Password", value, showRules = false, ...props }) {
  const [visible, setVisible] = useState(false);
  const rulesId = `${id}-rules`;

  return (
    <TextField
      id={id}
      label={label}
      icon={Lock}
      type={visible ? "text" : "password"}
      value={value}
      describedBy={showRules ? rulesId : undefined}
      inputClassName="pr-13"
      trailing={
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 grid size-touch place-items-center rounded-control text-ink-muted transition-colors duration-(--duration-fast) ease-out hover:text-primary focus-visible:shadow-focus focus-visible:outline-none"
        >
          {visible ? (
            <EyeOff className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye className="size-icon-md" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      }
      {...props}
    >
      {showRules && <RequirementTicks id={rulesId} value={value || ""} />}
    </TextField>
  );
}
