"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Input } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import type { SuperAdminCreate } from "@/lib/types";

export function SuperAdminModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    setEmail("");
    setFullName("");
    setPhone("");
    setPassword("");
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body: SuperAdminCreate = {
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        password,
      };
      await api.post("/api/admin/super-admins", body);
      toast.success(
        "Super Admin Provisioned",
        `Created super administrator account for ${fullName}.`,
      );
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to Provision", err.detail);
      } else {
        toast.error("Failed to Provision", "Could not complete request.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Provision Super Administrator"
      description="Create a new platform-wide operator account with unrestricted administrative access."
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-purple-50 p-3 text-xs text-purple-800 border border-purple-200">
          <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
          <span>Platform operators have global authority across all tenant data.</span>
        </div>

        <Field label="Full Name" required>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Elena Rostova"
            required
          />
        </Field>

        <Field label="Email Address" hint="Must be unique" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@rcp.platform.lk"
            required
          />
        </Field>

        <Field label="Phone Number">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 71 234 5678"
          />
        </Field>

        <Field label="Temporary Password" hint="Minimum 10 characters" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            minLength={10}
            required
          />
        </Field>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Provision Operator
          </Button>
        </div>
      </form>
    </Modal>
  );
}
