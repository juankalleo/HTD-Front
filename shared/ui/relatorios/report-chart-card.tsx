import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ReportChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-lg border border-base-300 bg-base-100", className)}>
      <div className="border-b border-base-300 px-4 py-3">
        <h2 className="text-sm font-semibold text-base-content">{title}</h2>
        {description && <p className="mt-1 text-xs text-base-content/60">{description}</p>}
      </div>
      <div className="h-80">{children}</div>
    </article>
  );
}
