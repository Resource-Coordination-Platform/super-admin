import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

export function formatRelativeDays(days: number | null | undefined): {
  text: string;
  variant: "default" | "warning" | "danger" | "success";
} {
  if (days === null || days === undefined) {
    return { text: "No Expiry", variant: "default" };
  }
  if (days < 0) {
    const abs = Math.abs(days);
    return {
      text: `Expired ${abs} day${abs === 1 ? "" : "s"} ago`,
      variant: "danger",
    };
  }
  if (days === 0) {
    return { text: "Expires Today", variant: "warning" };
  }
  if (days <= 7) {
    return {
      text: `${days} day${days === 1 ? "" : "s"} left`,
      variant: "warning",
    };
  }
  return {
    text: `${days} days left`,
    variant: "success",
  };
}

export function planBadgeInfo(plan: string | null | undefined): {
  label: string;
  className: string;
} {
  const p = (plan || "pro").toLowerCase();
  switch (p) {
    case "enterprise":
      return {
        label: "Enterprise",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      };
    case "pro":
      return {
        label: "Professional",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "starter":
      return {
        label: "Starter",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "trial":
    case "free":
      return {
        label: "Free Trial",
        className: "bg-slate-100 text-slate-800 border-slate-200",
      };
    default:
      return {
        label: plan || "Pro",
        className: "bg-slate-100 text-slate-800 border-slate-200",
      };
  }
}
