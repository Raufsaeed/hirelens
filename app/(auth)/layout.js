import { CircleCheck } from "lucide-react";
import Brand from "@/components/ui/Brand";
import GradientMesh from "@/components/ui/GradientMesh";

// Split auth page (design/components/ScreenSignUp): purple art on the left, form on the right.
// On phones the art becomes a short band on top.

const PROMISES = [
  "Scores with reasons and evidence",
  "Personal details removed before AI",
  "You make every hiring decision",
];

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <aside className="relative flex flex-col gap-4 overflow-hidden px-4 py-5 text-on-primary md:justify-between md:gap-8 md:p-12">
        <GradientMesh />
        <div className="relative z-1">
          <Brand tone="gradient" layout="stacked" />
        </div>
        <div className="relative z-1 flex max-w-auth flex-col gap-6">
          <p className="body-lg font-bold text-on-primary md:hidden">Read every CV. Fairly. In seconds.</p>
          <p className="display-sm hidden text-on-primary md:block">
            Read every CV.
            <br />
            Fairly. In seconds.
          </p>
          <ul className="hidden flex-col gap-4 md:flex">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 size-icon-md shrink-0 text-primary-faint" strokeWidth={1.75} aria-hidden="true" />
                <span>{promise}</span>
              </li>
            ))}
          </ul>
        </div>
        <span aria-hidden="true" className="hidden md:block" />
      </aside>
      <main className="grid place-items-center bg-surface-page px-4 py-8 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
