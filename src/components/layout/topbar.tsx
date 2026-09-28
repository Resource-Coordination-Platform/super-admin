"use client";

import * as React from "react";
import {
  Clock,
  LogOut,
  Menu,
  RefreshCw,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import type { SubscriptionCheckResponse } from "@/lib/types";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { profile, logout } = useAuth();
  const [checking, setChecking] = React.useState(false);
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    function updateClock() {
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        }).format(new Date()),
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleAutoSuspendExpired() {
    setChecking(true);
    try {
      const res = await api.post<SubscriptionCheckResponse>(
        "/api/admin/subscriptions/check-expirations",
      );
      if (res.suspended_count > 0) {
        toast.error(
          "Auto-Suspended Expired Tenants",
          `Suspended ${res.suspended_count} tenant(s): ${res.suspended_tenants.join(", ")}`,
        );
      } else {
        toast.success(
          "Subscriptions Clean",
          `All ${res.checked_count} active tenants have valid subscriptions.`,
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Audit Failed", err.detail);
      } else {
        toast.error("Audit Failed", "Could not reach gateway API.");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/80 text-xs text-slate-500 font-medium">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{time || "UTC"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          loading={checking}
          onClick={handleAutoSuspendExpired}
          className="hidden md:inline-flex text-xs font-semibold border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100/70"
          title="Scan active tenants and suspend any whose subscription expired"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-700" />
          Auto-Suspend Expired
        </Button>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-sm">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-900">
                {profile?.full_name || "Super Admin"}
              </p>
              <p className="text-[11px] text-slate-500 max-w-[140px] truncate">
                {profile?.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-500 hover:text-rose-600 p-2"
            title="Sign out of platform"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
