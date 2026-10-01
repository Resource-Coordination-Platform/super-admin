import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  variant = "default",
  action,
}: {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: LucideIcon;
  variant?: "default" | "brand" | "warning" | "danger" | "success" | "purple";
  action?: React.ReactNode;
}) {
  const iconVariants = {
    default: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    brand: "bg-coral-50 text-coral-700 ring-1 ring-coral-200/80",
    purple: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };

  return (
    <div className="glass-stat relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            iconVariants[variant],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {subvalue && (
            <p className="mt-1 text-xs text-muted-foreground font-medium">
              {subvalue}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
