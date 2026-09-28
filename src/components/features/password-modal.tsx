"use client";

import * as React from "react";
import { KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Input } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import type { AdminUserRead } from "@/lib/types";

export function PasswordResetModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: AdminUserRead | null;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");

  React.useEffect(() => {
    setNewPassword("");
  }, [user, open]);

  if (!user) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await api.post(`/api/admin/users/${user.id}/reset-password`, {
        new_password: newPassword,
      });
      toast.success(
        "Password Reset",
        `Successfully updated credentials for ${user.full_name} (${user.email}).`,
      );
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Password Reset Failed", err.detail);
      } else {
        toast.error("Password Reset Failed", "Could not reset password.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Admin Password Reset"
      description={`Set a new secure password for ${user.full_name} (${user.email}).`}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
          <KeyRound className="h-4 w-4 text-brand-600 shrink-0" />
          <span>This will invalidate all current active sessions for this user.</span>
        </div>

        <Field label="New Password" hint="Minimum 10 characters" required>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            minLength={10}
            required
            autoFocus
          />
        </Field>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
