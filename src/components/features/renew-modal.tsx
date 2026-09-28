"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Select } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { TenantRenewRequest, TenantSummary } from "@/lib/types";

export function RenewModal({
  open,
  onClose,
  tenant,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  tenant: TenantSummary | null;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [plan, setPlan] = React.useState("pro");
  const [extendDays, setExtendDays] = React.useState("30");
  const [autoActivate, setAutoActivate] = React.useState(true);

  React.useEffect(() => {
    if (tenant) {
      setPlan(tenant.subscription_plan || "pro");
      setExtendDays("30");
      setAutoActivate(true);
    }
  }, [tenant, open]);

  if (!tenant) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    setSubmitting(true);

    try {
      const body: TenantRenewRequest = {
        plan,
        extend_days: parseInt(extendDays, 10) || 30,
        auto_activate: autoActivate,
      };
      await api.post(`/api/admin/tenants/${tenant.id}/renew`, body);
      toast.success(
        "Subscription Extended",
        `Successfully extended ${tenant.name}'s subscription by ${extendDays} days.`,
      );
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Renewal Failed", err.detail);
      } else {
        toast.error("Renewal Failed", "Could not complete renewal.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Extend / Renew Subscription"
      description={`Manage subscription duration and plan tier for ${tenant.name}.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Organization:</span>
            <span className="font-bold text-slate-800">{tenant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="font-semibold capitalize text-slate-800">
              {tenant.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Current Expiry:</span>
            <span className="font-semibold text-slate-800">
              {formatDate(tenant.subscription_end)}
            </span>
          </div>
        </div>

        <Field label="Subscription Plan Tier" required>
          <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="starter">Starter (Volunteer Group)</option>
            <option value="pro">Professional (Regional Relief)</option>
            <option value="enterprise">Enterprise (National Mesh)</option>
          </Select>
        </Field>

        <Field label="Extension Duration" required>
          <Select
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
          >
            <option value="14">+14 Days Extension</option>
            <option value="30">+30 Days (1 Month)</option>
            <option value="60">+60 Days (2 Months)</option>
            <option value="90">+90 Days (Quarterly)</option>
            <option value="180">+180 Days (Half Year)</option>
            <option value="365">+365 Days (1 Full Year)</option>
          </Select>
        </Field>

        {tenant.status === "suspended" && (
          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoActivate}
              onChange={(e) => setAutoActivate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Automatically reactivate organization status to "Active"
            </span>
          </label>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Confirm Extension
          </Button>
        </div>
      </form>
    </Modal>
  );
}
