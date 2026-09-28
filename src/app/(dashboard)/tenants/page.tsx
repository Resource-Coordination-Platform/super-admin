"use client";

import * as React from "react";
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Edit2,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button, Field, Input, Select } from "@/components/ui/primitives";
import { StatusBadge, SubscriptionPlanBadge, ExpiryBadge } from "@/components/ui/badges";
import { toast } from "@/components/ui/toast";
import { TenantModal } from "@/components/features/tenant-modal";
import { RenewModal } from "@/components/features/renew-modal";
import { DeleteModal } from "@/components/features/delete-modal";
import type { SubscriptionCheckResponse, TenantSummary } from "@/lib/types";

export default function TenantsPage() {
  const [tenants, setTenants] = React.useState<TenantSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checking, setChecking] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [planFilter, setPlanFilter] = React.useState<string>("all");

  // Modals state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<TenantSummary | null>(null);
  const [renewTarget, setRenewTarget] = React.useState<TenantSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TenantSummary | null>(null);

  const loadTenants = React.useCallback(async () => {
    try {
      const data = await api.get<TenantSummary[]>("/api/admin/tenants");
      setTenants(data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to load tenants", err.detail);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  async function handleToggleStatus(tenant: TenantSummary) {
    const nextStatus = tenant.status === "active" ? "suspended" : "active";
    try {
      await api.patch(`/api/admin/tenants/${tenant.id}/status`, {
        status: nextStatus,
      });
      toast.success(
        nextStatus === "suspended" ? "Organization Suspended" : "Organization Activated",
        `${tenant.name} is now ${nextStatus}.`,
      );
      void loadTenants();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Status Change Failed", err.detail);
      }
    }
  }

  async function handleAutoSuspendExpired() {
    setChecking(true);
    try {
      const res = await api.post<SubscriptionCheckResponse>(
        "/api/admin/subscriptions/check-expirations",
      );
      if (res.suspended_count > 0) {
        toast.error(
          "Auto-Suspension Completed",
          `Suspended ${res.suspended_count} expired tenant(s): ${res.suspended_tenants.join(", ")}`,
        );
      } else {
        toast.success(
          "Audit Clean",
          "All active organizations have valid subscriptions.",
        );
      }
      void loadTenants();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Audit Failed", err.detail);
      }
    } finally {
      setChecking(false);
    }
  }

  // Filtered tenants
  const filtered = React.useMemo(() => {
    return tenants.filter((t) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.contact_email && t.contact_email.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = t.status === "active" && !t.is_subscription_expired;
      } else if (statusFilter === "suspended") {
        matchesStatus = t.status === "suspended";
      } else if (statusFilter === "expired") {
        matchesStatus = t.is_subscription_expired;
      }

      let matchesPlan = true;
      if (planFilter !== "all") {
        matchesPlan = (t.subscription_plan || "pro").toLowerCase() === planFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [tenants, search, statusFilter, planFilter]);

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const suspendedCount = tenants.filter((t) => t.status === "suspended").length;
  const expiredCount = tenants.filter((t) => t.is_subscription_expired).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Organizations & Tenants
            </h1>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {tenants.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Lifecycle operations: onboard new CBOs, manage subscription plans, toggle active/suspended status, and delete tenants.
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
          <Button
            size="sm"
            onClick={() => {
              setEditTarget(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Onboard Organization
          </Button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Tenants
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {tenants.length}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Active Hubs
          </p>
          <p className="mt-1 text-xl font-extrabold text-emerald-800">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Expired Subscriptions
          </p>
          <p className="mt-1 text-xl font-extrabold text-amber-800">
            {expiredCount}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-center shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
            Suspended
          </p>
          <p className="mt-1 text-xl font-extrabold text-rose-800">
            {suspendedCount}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name, slug or email..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
            <option value="suspended">Suspended Only</option>
          </Select>
          <Select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-36"
          >
            <option value="all">All Tiers</option>
            <option value="starter">Starter</option>
            <option value="pro">Professional</option>
            <option value="enterprise">Enterprise</option>
            <option value="trial">Free Trial</option>
          </Select>
        </div>
      </div>

      {/* Tenants Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Organization</th>
                <th className="px-4 py-3.5">Tier</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Subscription Timeline</th>
                <th className="px-4 py-3.5">Staff & Admins</th>
                <th className="px-4 py-3.5">Coordinates</th>
                <th className="px-4 py-3.5">Onboarded</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No organizations match the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-slate-900 font-bold">{t.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">
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
                      <div className="space-y-1">
                        <ExpiryBadge days={t.days_remaining} />
                        <div className="text-[10px] text-slate-400">
                          Expires: {formatDate(t.subscription_end)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {t.user_count} total users
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.admin_count} admins · {t.coordinator_count} coords
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {typeof t.latitude === "number" && typeof t.longitude === "number"
                        ? `${t.latitude.toFixed(2)}, ${t.longitude.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Renew / Extend */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRenewTarget(t)}
                          className="h-7 px-2 text-[11px] text-blue-600 border-blue-200 hover:bg-blue-50"
                          title="Extend or renew subscription"
                        >
                          <CalendarCheck2 className="h-3.5 w-3.5" />
                          Renew
                        </Button>

                        {/* Toggle Suspend / Active */}
                        <Button
                          variant={t.status === "active" ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => handleToggleStatus(t)}
                          className={
                            t.status === "active"
                              ? "h-7 px-2 text-[11px] text-amber-600 hover:bg-amber-50"
                              : "h-7 px-2 text-[11px] text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          }
                          title={
                            t.status === "active"
                              ? "Suspend Organization"
                              : "Reactivate Organization"
                          }
                        >
                          {t.status === "active" ? (
                            <>
                              <PauseCircle className="h-3.5 w-3.5" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditTarget(t);
                            setModalOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
                          title="Edit Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(t)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Organization"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modals */}
      <TenantModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        tenant={editTarget}
        onSuccess={loadTenants}
      />
      <RenewModal
        open={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        tenant={renewTarget}
        onSuccess={loadTenants}
      />
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        tenant={deleteTarget}
        onSuccess={loadTenants}
      />
    </div>
  );
}
