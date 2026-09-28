"use client";

import * as React from "react";
import {
  AlertCircle,
  Building2,
  CalendarCheck,
  CheckCircle,
  CreditCard,
  History,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button, Input, Select } from "@/components/ui/primitives";
import { StatusBadge, SubscriptionPlanBadge, ExpiryBadge } from "@/components/ui/badges";
import { toast } from "@/components/ui/toast";
import { RenewModal } from "@/components/features/renew-modal";
import type { SubscriptionCheckResponse, TenantSummary } from "@/lib/types";

export default function SubscriptionsPage() {
  const [tenants, setTenants] = React.useState<TenantSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checking, setChecking] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filterTier, setFilterTier] = React.useState("all");

  const [renewTarget, setRenewTarget] = React.useState<TenantSummary | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const data = await api.get<TenantSummary[]>("/api/admin/tenants");
      // Sort by urgency: negative days (expired) first, then lowest days
      data.sort((a, b) => {
        const aDays = a.days_remaining ?? 9999;
        const bDays = b.days_remaining ?? 9999;
        return aDays - bDays;
      });
      setTenants(data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to load subscription data", err.detail);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleAutoSuspendAudit() {
    setChecking(true);
    try {
      const res = await api.post<SubscriptionCheckResponse>(
        "/api/admin/subscriptions/check-expirations",
      );
      if (res.suspended_count > 0) {
        toast.error(
          "Auto-Suspension Enacted",
          `Suspended ${res.suspended_count} organization(s) whose subscription elapsed: ${res.suspended_tenants.join(", ")}`,
        );
      } else {
        toast.success(
          "Subscription Engine Up to Date",
          "All active organizations have valid subscriptions.",
        );
      }
      void loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Audit Execution Failed", err.detail);
      }
    } finally {
      setChecking(false);
    }
  }

  async function quickExtend(tenant: TenantSummary, days: number) {
    try {
      await api.post(`/api/admin/tenants/${tenant.id}/renew`, {
        extend_days: days,
        auto_activate: true,
      });
      toast.success(
        "Subscription Extended",
        `Added ${days} days to ${tenant.name}.`,
      );
      void loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to extend", err.detail);
      }
    }
  }

  const filtered = React.useMemo(() => {
    return tenants.filter((t) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
      const matchTier =
        filterTier === "all" ||
        (t.subscription_plan || "pro").toLowerCase() === filterTier.toLowerCase();
      return matchSearch && matchTier;
    });
  }, [tenants, search, filterTier]);

  const expiredCount = tenants.filter((t) => t.is_subscription_expired).length;
  const expiringSoonCount = tenants.filter(
    (t) =>
      !t.is_subscription_expired &&
      t.days_remaining !== null &&
      t.days_remaining <= 7,
  ).length;
  const activeCount = tenants.filter(
    (t) => t.status === "active" && !t.is_subscription_expired,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Subscription & Expiration Engine
            </h1>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
              Automated Guard
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monitor organizational subscription end dates, renew service tiers, and trigger automated expiration suspensions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleAutoSuspendAudit}
          loading={checking}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Run Expiration Audit Now
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Healthy Subscriptions
            </span>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-800">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Active CBOs with remaining subscription quota
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Expiring Soon (≤ 7 Days)
            </span>
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-800">
            {expiringSoonCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Organizations due for renewal or plan extension
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Expired Subscriptions
            </span>
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-rose-800">
            {expiredCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Passed expiry date — candidate for suspension
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions by organization name or slug..."
            className="pl-9"
          />
        </div>
        <Select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="w-44"
        >
          <option value="all">All Service Tiers</option>
          <option value="starter">Starter</option>
          <option value="pro">Professional</option>
          <option value="enterprise">Enterprise</option>
          <option value="trial">Free Trial</option>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Organization</th>
                <th className="px-4 py-3.5">Current Tier</th>
                <th className="px-4 py-3.5">Platform Status</th>
                <th className="px-4 py-3.5">Days Remaining</th>
                <th className="px-4 py-3.5">Expiration Date</th>
                <th className="px-5 py-3.5 text-right">Quick Renewal Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No subscriptions match filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-slate-900 font-bold">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            slug: {t.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <SubscriptionPlanBadge plan={t.subscription_plan} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        status={t.status}
                        isExpired={t.is_subscription_expired}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <ExpiryBadge days={t.days_remaining} />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {formatDate(t.subscription_end)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickExtend(t, 30)}
                          className="h-7 px-2 text-[11px] border-slate-300 text-slate-700 hover:bg-slate-100"
                          title="Instantly add 30 days"
                        >
                          +30d
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickExtend(t, 90)}
                          className="h-7 px-2 text-[11px] border-slate-300 text-slate-700 hover:bg-slate-100"
                          title="Instantly add 90 days"
                        >
                          +90d
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setRenewTarget(t)}
                          className="h-7 px-2.5 text-[11px]"
                        >
                          Custom Renewal
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RenewModal
        open={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        tenant={renewTarget}
        onSuccess={loadData}
      />
    </div>
  );
}
