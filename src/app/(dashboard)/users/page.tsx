"use client";

import * as React from "react";
import {
  Ban,
  CheckCircle2,
  KeyRound,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button, Input, Select } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { PasswordResetModal } from "@/components/features/password-modal";
import type { AdminUserRead, TenantSummary, UserType } from "@/lib/types";

export default function UsersDirectoryPage() {
  const [users, setUsers] = React.useState<AdminUserRead[]>([]);
  const [tenants, setTenants] = React.useState<TenantSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState("");
  const [tenantFilter, setTenantFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [passwordTarget, setPasswordTarget] = React.useState<AdminUserRead | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [usersData, tenantsData] = await Promise.all([
        api.get<AdminUserRead[]>("/api/admin/users", { query: { limit: 250 } }),
        api.get<TenantSummary[]>("/api/admin/tenants"),
      ]);
      setUsers(usersData);
      setTenants(tenantsData);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to load user directory", err.detail);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleToggleUserStatus(user: AdminUserRead) {
    const nextStatus = user.status === "active" ? "disabled" : "active";
    try {
      await api.patch(`/api/admin/users/${user.id}/status`, {
        status: nextStatus,
      });
      toast.success(
        nextStatus === "disabled" ? "Account Disabled" : "Account Reactivated",
        `${user.full_name} (${user.email}) is now ${nextStatus}.`,
      );
      void loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to update status", err.detail);
      }
    }
  }

  const filtered = React.useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q));

      const matchTenant =
        tenantFilter === "all" ||
        (tenantFilter === "global" && !u.tenant_id) ||
        u.tenant_id === tenantFilter;

      const matchType =
        typeFilter === "all" ||
        u.user_type.toLowerCase() === typeFilter.toLowerCase();

      const matchStatus =
        statusFilter === "all" ||
        u.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchTenant && matchType && matchStatus;
    });
  }, [users, search, tenantFilter, typeFilter, statusFilter]);

  function roleBadge(type: UserType) {
    const styles: Record<string, string> = {
      SUPER_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
      TENANT_ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
      COORDINATOR: "bg-sky-100 text-sky-800 border-sky-200",
      VOLUNTEER: "bg-emerald-100 text-emerald-800 border-emerald-200",
      VICTIM: "bg-amber-100 text-amber-800 border-amber-200",
      DONATOR: "bg-teal-100 text-teal-800 border-teal-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
          styles[type] || "bg-slate-100 text-slate-800 border-slate-200"
        }`}
      >
        {type.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform User Directory
            </h1>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {users.length} Registered
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cross-tenant governance: browse tenant administrators, coordinators, global volunteers, and operators.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name, email, or phone..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">All Hubs & Global</option>
            <option value="global">Global Pool Only</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-36"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="TENANT_ADMIN">Tenant Admin</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="VICTIM">Victim</option>
            <option value="DONATOR">Donator</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-32"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Organization Affiliation</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Contact Phone</th>
                <th className="px-4 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users match the search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>{u.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{roleBadge(u.user_type)}</td>
                    <td className="px-4 py-3.5">
                      {u.tenant_slug ? (
                        <span className="font-semibold text-slate-800">
                          {u.tenant_slug}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Global Disaster Pool
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPasswordTarget(u)}
                          className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Password
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(u)}
                          className={
                            u.status === "active"
                              ? "h-7 px-2 text-[11px] text-rose-600 hover:bg-rose-50"
                              : "h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-50"
                          }
                          title={
                            u.status === "active" ? "Ban / Disable" : "Reactivate"
                          }
                        >
                          {u.status === "active" ? (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Enable
                            </>
                          )}
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

      <PasswordResetModal
        open={!!passwordTarget}
        onClose={() => setPasswordTarget(null)}
        user={passwordTarget}
      />
    </div>
  );
}
