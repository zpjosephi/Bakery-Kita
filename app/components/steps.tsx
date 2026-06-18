"use client";

import { useI18n } from "../lib/i18n/context";

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
          <li
            key={label}
            className={"flex items-start " + (last ? "" : "flex-1")}
          >
            <div className="flex w-16 shrink-0 flex-col items-center gap-2">
              <span
                className={
                  "grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition " +
                  (done
                    ? "bg-brand-600 text-white"
                    : active
                      ? "border-2 border-brand-600 text-brand-700 dark:text-brand-300"
                      : "border-2 border-stone-200 text-stone-400 dark:border-stone-700")
                }
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={
                  "text-center text-xs leading-tight " +
                  (active
                    ? "font-medium text-stone-900 dark:text-stone-100"
                    : "text-stone-400")
                }
              >
                {label}
              </span>
            </div>
            {!last && (
              <span
                className={
                  "mt-4 h-0.5 flex-1 rounded transition " +
                  (done ? "bg-brand-600" : "bg-stone-200 dark:bg-stone-700")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
