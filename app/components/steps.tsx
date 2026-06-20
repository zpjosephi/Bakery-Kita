"use client";

import { useI18n } from "../lib/i18n/context";
import { Check } from "./icons";

export default function Steps({ current }: { current: number }) {
  const { t } = useI18n();
  const labels = t.steps;

  return (
    <ol className="mx-auto mb-10 flex max-w-xl items-start">
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === labels.length - 1;
        return (
          <li key={label} className={"flex items-start " + (last ? "" : "flex-1")}>
            <div className="flex w-16 shrink-0 flex-col items-center gap-2">
              <span
                className={
                  "grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition-colors duration-300 " +
                  (done
                    ? "bg-brand-600 text-white shadow-brand"
                    : active
                      ? "border-2 border-brand-500 bg-brand-50 text-brand-700"
                      : "border-2 border-border text-muted")
                }
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check width={15} height={15} strokeWidth={2.4} /> : i + 1}
              </span>
              <span
                className={
                  "text-center text-xs leading-tight " +
                  (active ? "font-semibold text-foreground" : "text-muted")
                }
              >
                {label}
              </span>
            </div>
            {!last && (
              <span
                className={
                  "mt-4 h-0.5 flex-1 rounded-full transition-colors duration-300 " +
                  (done ? "bg-brand-500" : "bg-border")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
