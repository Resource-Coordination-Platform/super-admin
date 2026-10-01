import { cn, planBadgeInfo, formatRelativeDays } from "@/lib/format";

export function StatusBadge({
  status,
  isExpired,
}: {
  status: "active" | "suspended" | string;
  isExpired?: boolean;
}) {
  if (status === "suspended") {
    return (
      <span className="glass-badge inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Suspended
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="glass-badge inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Expired
      </span>
    );
  }

  return (
    <span className="glass-badge inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  );
}

export function SubscriptionPlanBadge({ plan }: { plan: string | null | undefined }) {
  const { label, className } = planBadgeInfo(plan);
  return (
    <span
      className={cn(
        "glass-badge inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-semibold border",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function ExpiryBadge({ days }: { days: number | null | undefined }) {
  const { text, variant } = formatRelativeDays(days);
  const styles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-300 font-medium",
    danger: "bg-rose-50 text-rose-800 border-rose-300 font-bold",
  };
  return (
    <span
      className={cn(
        "glass-badge inline-flex items-center rounded-md px-2 py-0.5 text-xs border",
        styles[variant],
      )}
    >
      {text}
    </span>
  );
}
