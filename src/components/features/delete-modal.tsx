"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Input } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import type { TenantSummary } from "@/lib/types";

export function DeleteModal({
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
  const [confirmSlug, setConfirmSlug] = React.useState("");

  React.useEffect(() => {
    setConfirmSlug("");
  }, [tenant, open]);

  if (!tenant) return null;

  const matches = confirmSlug.trim() === tenant.slug;

  async function onDelete() {
    if (!tenant || !matches) return;
    setSubmitting(true);

    try {
      await api.del(`/api/admin/tenants/${tenant.id}`);
      toast.success(
        "Organization Deleted",
        `Permanently removed tenant ${tenant.name} (${tenant.slug}).`,
      );
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Deletion Failed", err.detail);
      } else {
        toast.error("Deletion Failed", "Could not delete tenant.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Organization"
      description="This action is irreversible. All tenant coordinators, data, and access will be revoked."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Permanent Platform Deletion</p>
            <p className="opacity-90">
              Deleting <strong>{tenant.name}</strong> will remove {tenant.user_count} user account(s) and all session tokens.
            </p>
          </div>
        </div>

        <Field
          label={`Type "${tenant.slug}" to confirm deletion`}
          hint="Case-sensitive"
          required
        >
          <Input
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            placeholder={tenant.slug}
            autoFocus
          />
        </Field>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!matches}
            loading={submitting}
            onClick={onDelete}
          >
            Permanently Delete Tenant
          </Button>
        </div>
      </div>
    </Modal>
  );
}
