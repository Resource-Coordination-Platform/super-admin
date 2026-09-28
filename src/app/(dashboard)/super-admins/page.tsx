"use client";

import * as React from "react";
import {
  KeyRound,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { SuperAdminModal } from "@/components/features/superadmin-modal";
import { PasswordResetModal } from "@/components/features/password-modal";
import type { AdminUserRead } from "@/lib/types";

export default function SuperAdminsPage() {
  const [admins, setAdmins] = React.useState<AdminUserRead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [passwordTarget, setPasswordTarget] = React.useState<AdminUserRead | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const data = await api.get<AdminUserRead[]>("/api/admin/users", {
        query: { user_type: "SUPER_ADMIN" },
      });
      setAdmins(data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to load operators", err.detail);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Super Administrators
            </h1>
            <span className="rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
              {admins.length} Operators
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Platform-wide governance operators with unrestricted root access to cross-tenant resources.
          </p>
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Provision Super Admin
        </Button>
      </div>

      {/* Security Info Card */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shrink-0 shadow-sm">
          <Shield className="h-5 w-5" />
        </div>
        <div className="text-xs text-purple-900 space-y-0.5">
          <p className="font-bold">Privileged Root Operator Accounts</p>
          <p className="opacity-90">
            Super Admins carry no tenant bindings and possess global administrative authority to onboard tenants, alter subscriptions, manage security credentials, and inspect logs.
          </p>
        </div>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {admins.map((a) => (
          <div
            key={a.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-sm shadow-sm">
                  {a.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {a.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">{a.email}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Provisioned
                </span>
                <span>{formatDate(a.created_at)}</span>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasswordTarget(a)}
                  className="h-7 text-xs text-slate-600 hover:text-slate-900"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset Key
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SuperAdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
      <PasswordResetModal
        open={!!passwordTarget}
        onClose={() => setPasswordTarget(null)}
        user={passwordTarget}
      />
    </div>
  );
}
