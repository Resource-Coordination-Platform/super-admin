"use client";

import * as React from "react";
import {
  AlertTriangle,
  Building2,
  CalendarCheck2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/primitives";
import { StatusBadge, SubscriptionPlanBadge, ExpiryBadge } from "@/components/ui/badges";
import { toast } from "@/components/ui/toast";
import { TenantModal } from "@/components/features/tenant-modal";
import { RenewModal } from "@/components/features/renew-modal";
import { TenantGISMap } from "@/components/features/tenant-map";
import type {
  PlatformStats,
  SubscriptionCheckResponse,
  TenantSummary,
} from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = React.useState<PlatformStats | null>(null);
  const [tenants, setTenants] = React.useState<TenantSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checking, setChecking] = React.useState(false);

  // Modals
  const [createOpen, setCreateOpen] = React.useState(false);
  const [renewTarget, setRenewTarget] = React.useState<TenantSummary | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [statsData, tenantsData] = await Promise.all([
        api.get<PlatformStats>("/api/admin/stats"),
        api.get<TenantSummary[]>("/api/admin/tenants"),
      ]);
      setStats(statsData);
      setTenants(tenantsData);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to load platform data", err.detail);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleAutoSuspendExpired() {
    setChecking(true);
    try {
      const res = await api.post<SubscriptionCheckResponse>(
        "/api/admin/subscriptions/check-expirations",
      );
      if (res.suspended_count > 0) {
        toast.error(
          "Auto-Suspension Completed",
          `Suspended ${res.suspended_count} expired organization(s): ${res.suspended_tenants.join(", ")}`,
        );
      } else {
        toast.success(
          "All Subscriptions Verified",
          "No active organizations with expired subscriptions found.",
        );
      }
      void loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Audit Failed", err.detail);
      }
    } finally {
      setChecking(false);
    }
  }

  // Data for charts
  const tenantStatusData = React.useMemo(() => {
    if (!tenants.length) return [];
    let active = 0;
    let suspended = 0;
    let expired = 0;

    tenants.forEach((t) => {
      if (t.status === "suspended") suspended++;
      else if (t.is_subscription_expired) expired++;
      else active++;
    });

    return [
      { name: "Active", value: active, color: "#10b981" },
      { name: "Expiring / Expired", value: expired, color: "#f59e0b" },
      { name: "Suspended", value: suspended, color: "#e11d48" },
    ];
  }, [tenants]);

  const userTypeData = React.useMemo(() => {
    if (!stats?.users_by_type) return [];
    return stats.users_by_type.map((item) => ({
      name: item.user_type.replace(/_/g, " "),
      count: item.count,
    }));
  }, [stats]);

  const expiredCount = stats?.expired_tenants ?? 0;
  const expiringSoonCount = stats?.expiring_soon_tenants ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Command Center
            </h1>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              Global Overview
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time multi-tenant monitoring, subscription lifecycle guards, and resource distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoSuspendExpired}
            loading={checking}
            className="border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-700" />
            Check & Suspend Expired
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Onboard Organization
          </Button>
        </div>
      </div>

      {/* Expiry Warning Callout if needed */}
      {(expiredCount > 0 || expiringSoonCount > 0) && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Subscription Lifecycle Guard Alert
              </p>
              <p className="text-xs text-amber-800">
                {expiredCount > 0 && (
                  <span className="font-semibold text-rose-800">
                    {expiredCount} organization(s) have expired subscriptions.{" "}
                  </span>
                )}
                {expiringSoonCount > 0 && (
                  <span>
                    {expiringSoonCount} organization(s) are expiring within 7 days.
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={handleAutoSuspendExpired}
            loading={checking}
            className="shrink-0 text-xs"
          >
            Auto-Suspend Expired Now
          </Button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Organizations (CBOs)"
          value={stats?.total_tenants ?? "—"}
          subvalue={`${stats?.active_tenants ?? 0} Active · ${stats?.suspended_tenants ?? 0} Suspended`}
          icon={Building2}
          variant="brand"
        />
        <StatCard
          title="Subscription Health"
          value={`${stats?.active_tenants ?? 0} Active`}
          subvalue={`${expiredCount} Expired · ${expiringSoonCount} Due Soon`}
          icon={CalendarCheck2}
          variant={expiredCount > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Total Platform Users"
          value={stats?.total_users ?? "—"}
          subvalue={`${stats?.global_users ?? 0} Mobile Pool · ${stats?.tenant_users ?? 0} CBO Staff`}
          icon={UsersRound}
          variant="default"
        />
        <StatCard
          title="Super Admins"
          value={stats?.super_admins ?? "—"}
          subvalue="Platform Operators Roster"
          icon={Shield}
          variant="purple"
        />
      </div>

      {/* GIS Spatial Command Center */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Spatial Hub Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Geographic coordinates and status pins of all registered tenant relief command centers.
            </p>
          </div>
          <span className="text-xs text-slate-400">Interactive Map</span>
        </div>
        <TenantGISMap tenants={tenants} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tenant Status Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="text-sm font-bold text-slate-900">
            Tenant Status Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Proportion of active, expiring, and suspended organizations.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tenantStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tenantStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Population Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="text-sm font-bold text-slate-900">
            Platform Users by Role
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Distribution across global pool (volunteers, victims, donors) and tenant staff.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3563ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Organizations Quick Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Organizations Roster
            </h3>
            <p className="text-xs text-slate-500">
              Top relief centers with their real-time subscription status and staff counts.
            </p>
          </div>
          <a
            href="/tenants"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Manage All Tenants <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Subscription Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiry Timeline</th>
                <th className="px-4 py-3">Coordinators</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.slice(0, 6).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div>{t.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      slug: {t.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionPlanBadge plan={t.subscription_plan} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={t.status}
                      isExpired={t.is_subscription_expired}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ExpiryBadge days={t.days_remaining} />
                      <span className="text-[10px] text-slate-400">
                        {formatDate(t.subscription_end)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {t.user_count} staff ({t.coordinator_count} coords)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRenewTarget(t)}
                      className="text-brand-600 hover:text-brand-700 text-xs"
                    >
                      Renew / Extend
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <TenantModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={loadData}
      />
      <RenewModal
        open={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        tenant={renewTarget}
        onSuccess={loadData}
      />
    </div>
  );
}
