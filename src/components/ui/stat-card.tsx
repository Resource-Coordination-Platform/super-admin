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
    default: "bg-slate-100 text-slate-700",
    brand: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subvalue}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
